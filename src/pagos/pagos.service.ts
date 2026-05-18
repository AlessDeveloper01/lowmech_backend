import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import type { Stripe as StripeClient } from 'stripe';
import { Pago } from './entities/pago.entity';
import { Orden } from '../ordenes/entities/orden.entity';
import { OrdenLinea } from '../ordenes/entities/orden-linea.entity';
import { CrearIntentDto } from './dto/crear-intent.dto';
import { ConfirmarPagoDto } from './dto/confirmar-pago.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);
  private readonly stripe: StripeClient;
  private readonly currency: string;

  constructor(
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(Pago) private readonly pagoRepo: Repository<Pago>,
    @InjectRepository(Orden) private readonly ordenRepo: Repository<Orden>,
    @InjectRepository(OrdenLinea)
    private readonly lineaRepo: Repository<OrdenLinea>,
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY') ?? '';
    if (!secret || secret.includes('TU_CLAVE')) {
      this.logger.warn(
        'STRIPE_SECRET_KEY no configurada. Configura el .env antes de pagar.',
      );
    }
    this.stripe = new Stripe(secret || 'sk_test_dummy');
    this.currency = (
      this.config.get<string>('STRIPE_CURRENCY') ?? 'mxn'
    ).toLowerCase();
  }

  /**
   * Crea un PaymentIntent en Stripe y guarda los datos de la orden en la
   * metadata para que al confirmar podamos crear la orden en la BD.
   */
  async crearIntent(dto: CrearIntentDto) {
    if (!dto.lineas?.length)
      throw new BadRequestException('Debes incluir al menos una linea');
    if (dto.total <= 0)
      throw new BadRequestException('Total debe ser mayor a 0');

    // Stripe usa la cantidad mínima: centavos
    const amount = Math.round(dto.total * 100);

    // Guardamos el payload serializado como metadata (límite 500 chars por valor)
    const ordenPayload = JSON.stringify(dto);

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount,
        currency: this.currency,
        automatic_payment_methods: { enabled: true },
        description: `Orden taller mecanico - ${dto.lineas.length} items`,
        metadata: {
          clienteId: String(dto.clienteId ?? ''),
          vehiculoId: String(dto.vehiculoId ?? ''),
          total: String(dto.total),
          lineas: String(dto.lineas.length),
        },
      });

      // Registramos el pago pendiente (guardamos el payload en notas internas)
      const pago = this.pagoRepo.create({
        monto: dto.total,
        moneda: this.currency,
        metodo: 'card',
        estado: 'pending',
        stripePaymentIntentId: intent.id,
      });
      await this.pagoRepo.save(pago);

      // Guardamos el payload temporalmente indexado por intent id (en memoria)
      this.pendingOrdenes.set(intent.id, ordenPayload);

      return {
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount: dto.total,
        currency: this.currency,
      };
    } catch (e: any) {
      this.logger.error('Error creando PaymentIntent', e?.message);
      throw new BadRequestException(
        `Error Stripe: ${e?.message ?? 'desconocido'}`,
      );
    }
  }

  /** Cache en memoria: paymentIntentId -> JSON del dto */
  private pendingOrdenes = new Map<string, string>();

  /**
   * Verifica el pago en Stripe. Si fue exitoso, crea la orden en la BD
   * marcándola como pagada y retorna la orden completa.
   */
  async confirmar(dto: ConfirmarPagoDto) {
    let intent;
    try {
      intent = await this.stripe.paymentIntents.retrieve(dto.paymentIntentId);
    } catch (e: any) {
      throw new BadRequestException(
        `No se pudo verificar el pago: ${e?.message ?? 'error Stripe'}`,
      );
    }

    if (intent.status !== 'succeeded') {
      throw new BadRequestException(
        `El pago no se ha completado (estado: ${intent.status})`,
      );
    }

    // Idempotencia: si ya hay una orden asociada al paymentIntent, regresarla
    const pagoExistente = await this.pagoRepo.findOne({
      where: { stripePaymentIntentId: dto.paymentIntentId },
    });
    if (pagoExistente?.ordenId) {
      const ya = await this.ordenRepo.findOne({
        where: { id: pagoExistente.ordenId },
        relations: ['cliente', 'vehiculo', 'mecanico', 'promocion', 'lineas'],
      });
      if (ya) return { orden: ya, pago: pagoExistente };
    }

    // Recuperar payload
    const payloadRaw = this.pendingOrdenes.get(dto.paymentIntentId);
    if (!payloadRaw) {
      throw new NotFoundException(
        'No se encontraron los datos de la orden. Inicia el pago de nuevo.',
      );
    }
    const payload: CrearIntentDto = JSON.parse(payloadRaw);

    let ordenId: number;

    if (payload.ordenId) {
      // --- Actualizar orden existente ---
      const ordenExistente = await this.ordenRepo.findOne({
        where: { id: payload.ordenId },
        relations: ['cliente', 'vehiculo', 'mecanico', 'promocion', 'lineas'],
      });
      if (!ordenExistente) {
        throw new NotFoundException(`Orden #${payload.ordenId} no encontrada`);
      }
      ordenExistente.anticipo = (ordenExistente.anticipo ?? 0) + payload.total;
      ordenExistente.estado = 'pagado';
      if (!ordenExistente.fechaFin) {
        ordenExistente.fechaFin = new Date().toISOString().split('T')[0];
      }
      await this.ordenRepo.save(ordenExistente);
      ordenId = ordenExistente.id;
    } else {
      // --- Crear la orden nueva ---
      const orden = this.ordenRepo.create({
        clienteId: payload.clienteId,
        vehiculoId: payload.vehiculoId,
        mecanicoId: payload.mecanicoId,
        diagnostico: payload.diagnostico ?? '',
        notas: payload.notas ?? '',
        fechaIngreso:
          payload.fechaIngreso ?? new Date().toISOString().split('T')[0],
        fechaPromesa: payload.fechaPromesa ?? '',
        prioridad: payload.prioridad ?? 'media',
        estado: 'pagado',
        anticipo: payload.total,
        descuento: payload.descuento ?? 0,
        promocionId: payload.promocionId,
      });
      const saved = await this.ordenRepo.save(orden);

      if (payload.lineas?.length) {
        const lineas = payload.lineas.map((l) =>
          this.lineaRepo.create({ ...l, ordenId: saved.id }),
        );
        await this.lineaRepo.save(lineas);
      }
      ordenId = saved.id;
    }

    // Actualizar el pago
    let pago = pagoExistente;
    if (!pago) {
      pago = this.pagoRepo.create({
        monto: payload.total,
        moneda: this.currency,
        metodo: 'card',
        stripePaymentIntentId: dto.paymentIntentId,
      });
    }
    pago.ordenId = ordenId;
    pago.estado = 'succeeded';

    // Intentamos extraer marca y últimos 4
    const charge =
      (intent.latest_charge as string) ??
      (intent as any).latest_charge?.id ??
      '';
    pago.stripeChargeId = charge ?? '';
    try {
      if (charge) {
        const ch = await this.stripe.charges.retrieve(charge);
        pago.last4 = ch.payment_method_details?.card?.last4 ?? '';
        pago.brand = ch.payment_method_details?.card?.brand ?? '';
      }
    } catch {
      /* opcional */
    }
    await this.pagoRepo.save(pago);

    this.pendingOrdenes.delete(dto.paymentIntentId);

    const ordenCompleta = await this.ordenRepo.findOne({
      where: { id: ordenId },
      relations: ['cliente', 'vehiculo', 'mecanico', 'promocion', 'lineas'],
    });

    // Enviar email de confirmacion de pago (fire-and-forget, no bloquea la respuesta)
    if (ordenCompleta) {
      this.enviarEmailPago(ordenCompleta, pago).catch((e) =>
        this.logger.error('Error enviando email de pago:', e),
      );
    }

    return { orden: ordenCompleta, pago };
  }

  /**
   * Envia email de confirmacion de pago al cliente.
   * Fire-and-forget: no bloquea la respuesta del endpoint.
   */
  private async enviarEmailPago(orden: Orden, pago: Pago) {
    if (!orden.cliente?.email) {
      this.logger.warn(`Orden #${orden.id} sin email de cliente, omitiendo envio`);
      return;
    }

    const subtotal = orden.lineas.reduce(
      (sum, l) => sum + l.cantidad * l.precioUnitario,
      0,
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const vehiculoInfo = orden.vehiculo
      ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo} ${orden.vehiculo.anio ?? ''}`.trim()
      : 'No especificado';

    const cardInfo = pago.brand && pago.last4 ? `${pago.brand} •••• ${pago.last4}` : undefined;

    const fechaFormateada = new Date(pago.createdAt).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await this.emailService.sendPaymentConfirmation(orden.cliente.email, {
      ordenId: orden.id,
      clienteNombre: orden.cliente.nombre,
      vehiculoInfo,
      diagnostico: orden.diagnostico,
      monto: pago.monto,
      metodo: pago.metodo,
      cardInfo,
      fecha: fechaFormateada,
      lineas: orden.lineas.map((l) => ({
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
      })),
      subtotal,
      iva,
      total,
    });
  }

  async findPagoByOrden(ordenId: number) {
    return this.pagoRepo.findOne({
      where: { ordenId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.pagoRepo.find({
      relations: ['orden', 'orden.cliente', 'orden.vehiculo', 'orden.mecanico'],
      order: { createdAt: 'DESC' },
    });
  }
}

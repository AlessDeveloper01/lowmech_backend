import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orden } from './entities/orden.entity';
import { OrdenLinea } from './entities/orden-linea.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdenesService {
  private readonly logger = new Logger(OrdenesService.name);

  constructor(
    @InjectRepository(Orden)
    private readonly ordenRepo: Repository<Orden>,
    @InjectRepository(OrdenLinea)
    private readonly lineaRepo: Repository<OrdenLinea>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,
    private readonly cloudinary: CloudinaryService,
    private readonly emailService: EmailService,
  ) {}

  private isBase64(str: string): boolean {
    return str.startsWith('data:image');
  }

  async create(dto: CreateOrdenDto) {
    const { lineas, ...rest } = dto;
    if (rest.imagenUrl && this.isBase64(rest.imagenUrl)) {
      rest.imagenUrl = await this.cloudinary.uploadBase64(rest.imagenUrl, 'ordenes');
    }
    const orden = this.ordenRepo.create(rest);
    const saved = await this.ordenRepo.save(orden);

    if (lineas?.length) {
      const lineaEntities = lineas.map((l) =>
        this.lineaRepo.create({ ...l, ordenId: saved.id }),
      );
      await this.lineaRepo.save(lineaEntities);
    }

    return this.findOne(saved.id);
  }

  findAll() {
    return this.ordenRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findConEvidencia() {
    const ordenes = await this.ordenRepo.find({
      relations: ['cliente', 'vehiculo', 'mecanico', 'lineas'],
      order: { createdAt: 'DESC' },
    });
    return ordenes
      .filter((o) => o.imagenUrl)
      .map((orden) => {
        const subtotal = orden.lineas.reduce(
          (sum, l) => sum + l.cantidad * l.precioUnitario,
          0,
        );
        const iva = subtotal * 0.16;
        const total = subtotal + iva;
        return {
          id: orden.id,
          imagenUrl: orden.imagenUrl,
          diagnostico: orden.diagnostico,
          estado: orden.estado,
          fechaIngreso: orden.fechaIngreso,
          fechaFin: orden.fechaFin,
          cliente: orden.cliente,
          vehiculo: orden.vehiculo,
          mecanico: orden.mecanico,
          subtotal,
          iva,
          total,
        };
      });
  }

  async findByClienteId(clienteId: number) {
    const ordenes = await this.ordenRepo.find({
      where: { clienteId },
      relations: ['cliente', 'vehiculo', 'mecanico', 'promocion', 'lineas'],
      order: { createdAt: 'DESC' },
    });
    return ordenes.map((orden) => {
      const { subtotal, iva, total } = this.calcularTotales(orden);
      return { ...orden, subtotal, iva, total };
    });
  }

  async findByMecanicoId(mecanicoId: number) {
    const ordenes = await this.ordenRepo.find({
      where: { mecanicoId },
      relations: ['cliente', 'vehiculo', 'mecanico', 'promocion', 'lineas'],
      order: { createdAt: 'DESC' },
    });
    return ordenes.map((orden) => {
      const { subtotal, iva, total } = this.calcularTotales(orden);
      return { ...orden, subtotal, iva, total };
    });
  }

  private calcularTotales(orden: Orden) {
    const subtotal = orden.lineas.reduce(
      (sum, l) => sum + l.cantidad * l.precioUnitario,
      0,
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  }

  async findOne(id: number) {
    const orden = await this.ordenRepo.findOne({
      where: { id },
      relations: ['cliente', 'vehiculo', 'mecanico', 'promocion', 'lineas'],
    });
    if (!orden) throw new NotFoundException(`Orden #${id} no encontrada`);
    
    const subtotal = orden.lineas.reduce(
      (sum, l) => sum + l.cantidad * l.precioUnitario,
      0,
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    return {
      ...orden,
      subtotal,
      iva,
      total,
    };
  }

  async update(id: number, dto: UpdateOrdenDto) {
    const orden = await this.findOne(id);
    const { lineas, ...rest } = dto;

    if (rest.imagenUrl && this.isBase64(rest.imagenUrl)) {
      if (orden.imagenUrl) await this.cloudinary.deleteImage(orden.imagenUrl);
      rest.imagenUrl = await this.cloudinary.uploadBase64(rest.imagenUrl, 'ordenes');
    }

    Object.assign(orden, rest);
    await this.ordenRepo.save(orden);

    if (lineas !== undefined) {
      await this.lineaRepo.delete({ ordenId: id });
      if (lineas.length) {
        const lineaEntities = lineas.map((l) =>
          this.lineaRepo.create({ ...l, ordenId: id }),
        );
        await this.lineaRepo.save(lineaEntities);
      }
    }

    return this.findOne(id);
  }

  async cambiarEstado(id: number, estado: string, imagenUrl?: string) {
    const orden = await this.findOne(id);
    const estadosFinales = ['completado', 'entregado', 'finalizado'];

    if (estadosFinales.includes(estado) && !imagenUrl && !orden.imagenUrl) {
      throw new BadRequestException('Se requiere una imagen al finalizar la orden');
    }

    orden.estado = estado;
    if (estadosFinales.includes(estado)) {
      orden.fechaFin = new Date().toISOString().split('T')[0];
    }
    if (imagenUrl) {
      if (this.isBase64(imagenUrl)) {
        if (orden.imagenUrl) await this.cloudinary.deleteImage(orden.imagenUrl);
        orden.imagenUrl = await this.cloudinary.uploadBase64(imagenUrl, 'ordenes');
      } else {
        orden.imagenUrl = imagenUrl;
      }
    }
    await this.ordenRepo.save(orden);
    return this.findOne(id);
  }

  async pagarEfectivo(id: number, dto: { anticipo: number; estado: string }) {
    const orden = await this.findOne(id);
    orden.anticipo = dto.anticipo;
    orden.estado = dto.estado;
    if (
      dto.estado === 'completado' ||
      dto.estado === 'entregado' ||
      dto.estado === 'pagado'
    ) {
      orden.fechaFin = orden.fechaFin ?? new Date().toISOString().split('T')[0];
    }
    await this.ordenRepo.save(orden);

    // Registrar pago en efectivo
    const pago = this.pagoRepo.create({
      ordenId: id,
      monto: dto.anticipo,
      moneda: 'mxn',
      metodo: 'cash',
      estado: dto.estado === 'pagado' ? 'succeeded' : 'pending',
    });
    await this.pagoRepo.save(pago);

    // Enviar email si el pago fue exitoso
    if (dto.estado === 'pagado') {
      const ordenCompleta = await this.ordenRepo.findOne({
        where: { id },
        relations: ['cliente', 'vehiculo', 'mecanico', 'lineas'],
      });
      if (ordenCompleta) {
        this.enviarEmailPago(ordenCompleta, pago).catch((e) =>
          this.logger.error('Error enviando email de pago efectivo:', e),
        );
      }
    }

    return this.findOne(id);
  }

  /**
   * Envia email de confirmacion de pago.
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

  async remove(id: number) {
    const orden = await this.findOne(id);
    return this.ordenRepo.remove(orden);
  }

  async marcarOperativo(id: number) {
    const orden = await this.findOne(id);
    orden.estado = 'operativo';
    orden.fechaOperativo = new Date();
    await this.ordenRepo.save(orden);

    if (orden.vehiculoId) {
      await this.vehiculoRepo.update(orden.vehiculoId, { estado: 'disponible' });
    }

    return this.findOne(id);
  }

  async actualizarProgreso(id: number, progreso: number, notasProgreso: string, checklist: Record<string, boolean>) {
    const orden = await this.findOne(id);
    orden.progreso = progreso;
    orden.notasProgreso = notasProgreso;
    if (checklist.diagnostico !== undefined) orden.checklistDiagnostico = checklist.diagnostico;
    if (checklist.reparacion !== undefined) orden.checklistReparacion = checklist.reparacion;
    if (checklist.pruebas !== undefined) orden.checklistPruebas = checklist.pruebas;
    if (checklist.limpieza !== undefined) orden.checklistLimpieza = checklist.limpieza;
    await this.ordenRepo.save(orden);
    return this.findOne(id);
  }
}

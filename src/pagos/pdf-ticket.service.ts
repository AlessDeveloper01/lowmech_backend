import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import type { Orden } from '../ordenes/entities/orden.entity';
import type { Pago } from './entities/pago.entity';

@Injectable()
export class PdfTicketService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Genera un ticket PDF en memoria y lo devuelve como Buffer.
   */
  async generar(orden: Orden, pago: Pago | null): Promise<Buffer> {
    const business = {
      name:
        this.config.get<string>('BUSINESS_NAME') ??
        'LowMech Servicios Mecanicos',
      rfc: this.config.get<string>('BUSINESS_RFC') ?? '',
      address: this.config.get<string>('BUSINESS_ADDRESS') ?? '',
      phone: this.config.get<string>('BUSINESS_PHONE') ?? '',
    };

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: [226, 700], // 80mm ancho aprox (ticket térmico)
          margin: 15,
        });
        const chunks: Buffer[] = [];
        doc.on('data', (c: Buffer) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const hr = () => {
          const y = doc.y;
          doc
            .moveTo(15, y)
            .lineTo(211, y)
            .dash(2, { space: 2 })
            .stroke()
            .undash();
          doc.moveDown(0.5);
        };

        const line = (
          text: string,
          opts: { bold?: boolean; size?: number; align?: any } = {},
        ) => {
          doc
            .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(opts.size ?? 9)
            .text(text, { align: opts.align ?? 'left' });
        };

        // --- Encabezado ---
        line(business.name, { bold: true, size: 12, align: 'center' });
        if (business.rfc)
          line(`RFC: ${business.rfc}`, { size: 8, align: 'center' });
        if (business.address)
          line(business.address, { size: 8, align: 'center' });
        if (business.phone)
          line(`Tel: ${business.phone}`, { size: 8, align: 'center' });
        doc.moveDown(0.5);
        hr();

        line(`TICKET DE PAGO #${orden.id}`, {
          bold: true,
          size: 10,
          align: 'center',
        });
        line(
          `Fecha: ${new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}`,
          { align: 'center', size: 8 },
        );
        hr();

        // --- Cliente / vehículo ---
        if (orden.cliente) {
          line('Cliente:', { bold: true });
          line(orden.cliente.nombre ?? '-', { size: 9 });
          if (orden.cliente.telefono) line(`Tel: ${orden.cliente.telefono}`);
        }
        if (orden.vehiculo) {
          doc.moveDown(0.3);
          line('Vehiculo:', { bold: true });
          line(
            `${orden.vehiculo.marca ?? ''} ${orden.vehiculo.modelo ?? ''} ${orden.vehiculo.anio ?? ''}`.trim(),
          );
          if (orden.vehiculo.placa) line(`Placa: ${orden.vehiculo.placa}`);
        }
        hr();

        // --- Conceptos ---
        line('CONCEPTOS', { bold: true });
        doc.moveDown(0.2);

        let subtotal = 0;
        for (const l of orden.lineas ?? []) {
          const tot = (l.cantidad ?? 1) * (l.precioUnitario ?? 0);
          subtotal += tot;
          line(`${l.descripcion || l.tipo}`, { size: 9 });
          line(
            `  ${l.cantidad} x $${l.precioUnitario.toFixed(2)}     $${tot.toFixed(2)}`,
            { size: 9 },
          );
        }
        hr();

        // --- Totales ---
        const descuento = orden.descuento ?? 0;
        const subConDesc = Math.max(0, subtotal - descuento);
        const iva = subConDesc * 0.16;
        const total = subConDesc + iva;

        const row = (label: string, value: string, bold = false) => {
          doc
            .font(bold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(bold ? 10 : 9);
          const y = doc.y;
          doc.text(label, 15, y, { continued: false });
          doc.text(value, 15, y, { align: 'right' });
        };

        row('Subtotal:', `$${subtotal.toFixed(2)}`);
        if (descuento > 0) row('Descuento:', `-$${descuento.toFixed(2)}`);
        row('IVA 16%:', `$${iva.toFixed(2)}`);
        doc.moveDown(0.3);
        row('TOTAL:', `$${total.toFixed(2)}`, true);
        hr();

        // --- Pago ---
        line('FORMA DE PAGO', { bold: true });
        if (pago) {
          line(`Metodo: ${pago.metodo?.toUpperCase() ?? 'CARD'}`);
          if (pago.brand || pago.last4)
            line(`Tarjeta: ${pago.brand} **** ${pago.last4}`.trim());
          line(`Estado: ${pago.estado.toUpperCase()}`);
          if (pago.stripePaymentIntentId)
            line(`Ref: ${pago.stripePaymentIntentId.slice(-12)}`, { size: 7 });
        } else {
          line('Metodo: EFECTIVO');
        }
        hr();

        line('Gracias por su preferencia!', { align: 'center', bold: true });
        line('Conserve este ticket', { align: 'center', size: 8 });

        doc.end();
      } catch (e) {
        reject(e);
      }
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private from: string;
  private readonly devEmail = 'tracododo@gmail.com';

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
    this.from = process.env.EMAIL_FROM || 'LowMech <onboarding@resend.dev>';
  }

  /**
   * Envia email de confirmacion de pago.
   * En desarrollo (NODE_ENV !== 'production') se envia a tracododo@gmail.com.
   * En produccion se envia al correo del cliente.
   */
  async sendPaymentConfirmation(
    clientEmail: string,
    data: {
      ordenId: number;
      clienteNombre: string;
      vehiculoInfo: string;
      diagnostico: string;
      monto: number;
      metodo: string;
      cardInfo?: string;
      fecha: string;
      lineas?: { descripcion: string; cantidad: number; precioUnitario: number }[];
      subtotal: number;
      iva: number;
      total: number;
    },
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    const to = isProd ? clientEmail : this.devEmail;

    this.logger.log(
      `Enviando confirmacion de pago para Orden #${data.ordenId} a: ${to} (prod: ${isProd})`,
    );

    const html = this.paymentConfirmationTemplate(data);

    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: [to],
        subject: `Pago confirmado - Orden #${data.ordenId} - LowMech`,
        html,
      });

      if (error) {
        this.logger.error(`Error enviando email de pago: ${error.message}`);
      } else {
        this.logger.log(`Email de pago enviado exitosamente a ${to}`);
      }
    } catch (e: any) {
      this.logger.error(`Error enviando email de pago: ${e?.message ?? 'desconocido'}`);
    }
  }

  private paymentConfirmationTemplate(data: {
    ordenId: number;
    clienteNombre: string;
    vehiculoInfo: string;
    diagnostico: string;
    monto: number;
    metodo: string;
    cardInfo?: string;
    fecha: string;
    lineas?: { descripcion: string; cantidad: number; precioUnitario: number }[];
    subtotal: number;
    iva: number;
    total: number;
  }): string {
    const metodoLabel: Record<string, string> = {
      card: 'Tarjeta',
      cash: 'Efectivo',
      transfer: 'Transferencia',
    };

    const formatCurrency = (amount: number) =>
      `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const lineasHtml = (data.lineas ?? [])
      .map(
        (l) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eef0f4;font-size:13px;color:#333;">${l.descripcion}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eef0f4;font-size:13px;color:#333;text-align:center;">${l.cantidad}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eef0f4;font-size:13px;color:#333;text-align:right;">${formatCurrency(l.precioUnitario)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eef0f4;font-size:13px;color:#333;text-align:right;font-weight:600;">${formatCurrency(l.cantidad * l.precioUnitario)}</td>
        </tr>`,
      )
      .join('');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago Confirmado - LowMech</title>
</head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1f2e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ff6b35;font-size:22px;font-weight:700;">LowMech</h1>
              <p style="margin:6px 0 0;color:#ffffff99;font-size:13px;">Sistema de Gestion para Talleres Mecanicos</p>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="background:#ecfdf5;padding:20px 40px;text-align:center;border-bottom:1px solid #d1fae5;">
              <p style="margin:0;color:#065f46;font-size:16px;font-weight:600;">Pago Confirmado</p>
              <p style="margin:4px 0 0;color:#047857;font-size:13px;">Tu pago ha sido procesado exitosamente</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0 0 16px;color:#333;font-size:14px;line-height:1.6;">
                Hola <strong>${data.clienteNombre}</strong>,<br>
                Te confirmamos que tu pago para la <strong>Orden #${data.ordenId}</strong> ha sido procesado correctamente.
              </p>

              <!-- Info Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#666;">Vehiculo:</td>
                  <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;font-weight:500;">${data.vehiculoInfo}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#666;">Servicio:</td>
                  <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;font-weight:500;">${data.diagnostico}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#666;">Metodo de pago:</td>
                  <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;font-weight:500;">${metodoLabel[data.metodo] ?? data.metodo}${data.cardInfo ? ` (${data.cardInfo})` : ''}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#666;">Fecha:</td>
                  <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;font-weight:500;">${data.fecha}</td>
                </tr>
              </table>

              <!-- Line Items -->
              ${lineasHtml ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <thead>
                  <tr>
                    <th style="padding:8px 0;font-size:11px;color:#888;text-align:left;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #eef0f4;">Concepto</th>
                    <th style="padding:8px 0;font-size:11px;color:#888;text-align:center;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #eef0f4;">Cant.</th>
                    <th style="padding:8px 0;font-size:11px;color:#888;text-align:right;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #eef0f4;">P. Unit.</th>
                    <th style="padding:8px 0;font-size:11px;color:#888;text-align:right;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #eef0f4;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${lineasHtml}
                </tbody>
              </table>
              ` : ''}

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#666;">Subtotal:</td>
                  <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;">${formatCurrency(data.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#666;">IVA (16%):</td>
                  <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;">${formatCurrency(data.iva)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0 4px;font-size:15px;color:#333;font-weight:700;border-top:2px solid #e5e7eb;">Total pagado:</td>
                  <td style="padding:10px 0 4px;font-size:15px;color:#ff6b35;font-weight:700;text-align:right;border-top:2px solid #e5e7eb;">${formatCurrency(data.total)}</td>
                </tr>
              </table>

              <p style="margin:16px 0 0;color:#777;font-size:12px;line-height:1.5;">
                Si tienes alguna duda sobre tu orden, no dudes en contactarnos.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #eef0f4;text-align:center;">
              <p style="margin:0 0 4px;color:#999;font-size:11px;">${process.env.BUSINESS_NAME ?? 'LowMech Servicios Mecanicos'}</p>
              <p style="margin:0;color:#999;font-size:11px;">${process.env.BUSINESS_ADDRESS ?? ''} | ${process.env.BUSINESS_PHONE ?? ''}</p>
              <p style="margin:8px 0 0;color:#bbb;font-size:10px;">LowMech Systems &copy; ${new Date().getFullYear()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendPasswordReset(email: string, resetUrl: string, name?: string) {
    const html = this.passwordResetTemplate(resetUrl, name || email);
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: [email],
      subject: 'Recupera tu contraseña - LowMech',
      html,
    });

    if (error) {
      throw new Error(`Error enviando email: ${error.message}`);
    }
  }

  private passwordResetTemplate(resetUrl: string, name: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recupera tu contraseña</title>
</head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#1a1f2e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ff6b35;font-size:22px;font-weight:700;">LowMech</h1>
              <p style="margin:6px 0 0;color:#ffffff99;font-size:13px;">Sistema de Gestión para Talleres Mecánicos</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 12px;color:#0f1117;font-size:18px;font-weight:600;">Recupera tu contraseña</h2>
              <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6;">
                Hola <strong>${name}</strong>,<br><br>
                Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para continuar:
              </p>
              <a href="${resetUrl}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;">Restablecer contraseña</a>
              <p style="margin:20px 0 0;color:#777;font-size:12px;line-height:1.5;">
                Si no solicitaste este cambio, ignora este correo. El enlace expira en 1 hora por seguridad.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #eef0f4;text-align:center;">
              <p style="margin:0;color:#999;font-size:11px;">LowMech Systems &copy; ${new Date().getFullYear()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}

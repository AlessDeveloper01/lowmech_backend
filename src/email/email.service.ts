import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private from: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
    this.from = process.env.EMAIL_FROM || 'LowMech <onboarding@resend.dev>';
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

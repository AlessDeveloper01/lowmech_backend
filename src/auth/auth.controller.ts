import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { BetterAuthService } from '../better-auth/better-auth.service.js';
import { ClientesService } from '../clientes/clientes.service.js';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly betterAuthService: BetterAuthService,
    private readonly clientesService: ClientesService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Solicita recuperación de contraseña (staff) */
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return this.authService.forgotPassword(email, frontendUrl);
  }

  /** Restablece contraseña con token (staff) */
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  /** Intercambia sesión Better Auth por JWT interno de cliente */
  @Post('cliente/exchange')
  async clienteExchange(@Req() req: Request) {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      }
    }
    const session = await this.betterAuthService.auth.api.getSession({ headers });
    if (!session) {
      throw new UnauthorizedException('Sesión no válida');
    }

    let cliente = await this.clientesService.findByEmail(session.user.email);
    if (!cliente) {
      cliente = await this.clientesService.create({
        nombre: session.user.name || session.user.email.split('@')[0],
        email: session.user.email,
        telefono: '',
        betterAuthUserId: session.user.id,
      } as any);
    } else if (!cliente.betterAuthUserId) {
      await this.clientesService.update(cliente.id, {
        betterAuthUserId: session.user.id,
      } as any);
    }

    return this.authService.buildClienteToken(cliente);
  }
}

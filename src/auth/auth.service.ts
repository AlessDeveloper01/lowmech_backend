import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service.js';
import { ClientesService } from '../clientes/clientes.service.js';
import { EmailService } from '../email/email.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Cliente } from '../clientes/entities/cliente.entity.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly clientesService: ClientesService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      rol: user.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  // ─── Recuperación de contraseña (staff) ──────────────────────────────────

  async forgotPassword(email: string, frontendUrl: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('No existe un usuario con ese correo');
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.usersService.setResetToken(user.id, token, expires);

    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    await this.emailService.sendPasswordReset(user.email, resetUrl, user.nombre);

    return { message: 'Se ha enviado un correo con las instrucciones' };
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    await this.usersService.resetPassword(token, password);
    return { message: 'Contraseña actualizada correctamente' };
  }

  buildClienteToken(cliente: Cliente) {
    const payload = {
      sub: cliente.id,
      username: cliente.email,
      rol: 'cliente',
      clienteId: cliente.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: cliente.id,
        username: cliente.email,
        nombre: cliente.nombre,
        apellido: '',
        email: cliente.email,
        rol: 'cliente' as const,
      },
    };
  }
}

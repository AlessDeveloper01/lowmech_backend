import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { ClientesService } from '../clientes/clientes.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly clientesService: ClientesService,
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

  // ─── Portal de clientes ──────────────────────────────────────────────────

  /** Paso 1: verificar si el email existe y si ya tiene contraseña */
  async clienteCheck(email: string): Promise<{ needsPassword: boolean }> {
    const cliente = await this.clientesService.findByEmail(email);
    if (!cliente) {
      throw new UnauthorizedException(
        'El correo no está registrado como cliente',
      );
    }
    return { needsPassword: !cliente.passwordSet };
  }

  /** Paso 2a (primer acceso): establecer contraseña y devolver JWT */
  async clienteSetPassword(email: string, password: string) {
    const cliente = await this.clientesService.findByEmail(email);
    if (!cliente) throw new UnauthorizedException('Cliente no encontrado');
    if (cliente.passwordSet) {
      throw new BadRequestException(
        'Este cliente ya tiene contraseña establecida',
      );
    }

    const hash = await bcrypt.hash(password, 10);
    await this.clientesService.setPassword(cliente.id, hash);

    return this.buildClienteToken({ ...cliente, passwordSet: true });
  }

  /** Paso 2b (accesos siguientes): login con email + contraseña */
  async clienteLogin(email: string, password: string) {
    const cliente = await this.clientesService.findByEmail(email);
    if (!cliente || !cliente.passwordSet || !cliente.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(password, cliente.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    return this.buildClienteToken(cliente);
  }

  private buildClienteToken(cliente: any) {
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

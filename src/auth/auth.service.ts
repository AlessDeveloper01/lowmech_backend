import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { ClientesService } from '../clientes/clientes.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Cliente } from '../clientes/entities/cliente.entity.js';

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

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Verifica si el email existe y si ya tiene contraseña */
  @Post('cliente/check')
  clienteCheck(@Body('email') email: string) {
    return this.authService.clienteCheck(email);
  }

  /** Primer acceso: establece contraseña y devuelve JWT */
  @Post('cliente/set-password')
  clienteSetPassword(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.clienteSetPassword(email, password);
  }

  /** Login normal con email + contraseña */
  @Post('cliente/login')
  clienteLogin(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.clienteLogin(email, password);
  }
}

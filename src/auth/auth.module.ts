import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { UsersModule } from '../users/users.module.js';
import { ClientesModule } from '../clientes/clientes.module.js';
import { BetterAuthModule } from '../better-auth/better-auth.module.js';
import { EmailModule } from '../email/email.module.js';
import { JWT_SECRET } from './constants.js';

@Module({
  imports: [
    UsersModule,
    ClientesModule,
    BetterAuthModule,
    EmailModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}

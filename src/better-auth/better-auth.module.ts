import { Module } from '@nestjs/common';
import { ClientesModule } from '../clientes/clientes.module.js';
import { EmailModule } from '../email/email.module.js';
import { BetterAuthService } from './better-auth.service.js';
import { BetterAuthController } from './better-auth.controller.js';

@Module({
  imports: [ClientesModule, EmailModule],
  controllers: [BetterAuthController],
  providers: [BetterAuthService],
  exports: [BetterAuthService],
})
export class BetterAuthModule {}

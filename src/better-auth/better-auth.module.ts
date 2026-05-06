import { Module } from '@nestjs/common';
import { ClientesModule } from '../clientes/clientes.module.js';
import { BetterAuthService } from './better-auth.service.js';
import { BetterAuthController } from './better-auth.controller.js';

@Module({
  imports: [ClientesModule],
  controllers: [BetterAuthController],
  providers: [BetterAuthService],
  exports: [BetterAuthService],
})
export class BetterAuthModule {}

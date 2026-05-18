import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Orden } from '../ordenes/entities/orden.entity';
import { OrdenLinea } from '../ordenes/entities/orden-linea.entity';
import { PagosService } from './pagos.service';
import { PdfTicketService } from './pdf-ticket.service';
import { PagosController } from './pagos.controller';
import { EmailService } from '../email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Orden, OrdenLinea])],
  controllers: [PagosController],
  providers: [PagosService, PdfTicketService, EmailService],
  exports: [PagosService],
})
export class PagosModule {}

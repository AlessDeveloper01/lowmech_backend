import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Orden } from '../ordenes/entities/orden.entity';
import { OrdenLinea } from '../ordenes/entities/orden-linea.entity';
import { PagosService } from './pagos.service';
import { PdfTicketService } from './pdf-ticket.service';
import { PagosController } from './pagos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Orden, OrdenLinea])],
  controllers: [PagosController],
  providers: [PagosService, PdfTicketService],
  exports: [PagosService],
})
export class PagosModule {}

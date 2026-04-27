import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PagosService } from './pagos.service';
import { PdfTicketService } from './pdf-ticket.service';
import { CrearIntentDto } from './dto/crear-intent.dto';
import { ConfirmarPagoDto } from './dto/confirmar-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orden } from '../ordenes/entities/orden.entity';

@UseGuards(JwtAuthGuard)
@Controller('pagos')
export class PagosController {
  constructor(
    private readonly svc: PagosService,
    private readonly pdf: PdfTicketService,
    @InjectRepository(Orden) private readonly ordenRepo: Repository<Orden>,
  ) {}

  @Post('crear-intent')
  crearIntent(@Body() dto: CrearIntentDto) {
    return this.svc.crearIntent(dto);
  }

  @Post('confirmar')
  confirmar(@Body() dto: ConfirmarPagoDto) {
    return this.svc.confirmar(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('ticket/:ordenId')
  async ticket(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Res() res: Response,
  ) {
    const orden = await this.ordenRepo.findOne({
      where: { id: ordenId },
      relations: ['cliente', 'vehiculo', 'mecanico', 'lineas'],
    });
    if (!orden) throw new NotFoundException(`Orden #${ordenId} no existe`);
    const pago = await this.svc.findPagoByOrden(ordenId);
    const buffer = await this.pdf.generar(orden, pago);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="ticket-${ordenId}.pdf"`,
    );
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}

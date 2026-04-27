import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@UseGuards(JwtAuthGuard)
@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly svc: OrdenesService) {}

  @Post()
  create(@Body() dto: CreateOrdenDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  /** Endpoint para clientes: devuelve solo sus ordenes */
  @Get('mis-ordenes')
  misOrdenes(@Request() req: any) {
    return this.svc.findByClienteId(req.user.clienteId);
  }

  /** Endpoint para mecanicos: devuelve solo sus ordenes asignadas */
  @Get('mis-trabajos')
  misTrabajos(@Request() req: any) {
    return this.svc.findByMecanicoId(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrdenDto) {
    return this.svc.update(id, dto);
  }

  @Put(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
  ) {
    return this.svc.cambiarEstado(id, estado);
  }

  @Put(':id/pagar-efectivo')
  pagarEfectivo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { anticipo: number; estado: string },
  ) {
    return this.svc.pagarEfectivo(id, body);
  }

  @Put(':id/marcar-operativo')
  marcarOperativo(@Param('id', ParseIntPipe) id: number) {
    return this.svc.marcarOperativo(id);
  }

  @Put(':id/progreso')
  actualizarProgreso(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { progreso: number; notasProgreso: string; checklist: Record<string, boolean> },
  ) {
    return this.svc.actualizarProgreso(id, body.progreso, body.notasProgreso, body.checklist);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}

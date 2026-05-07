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
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { BetterAuthService } from '../better-auth/index';

@UseGuards(JwtAuthGuard)
@Controller('ordenes')
export class OrdenesController {
  constructor(
    private readonly svc: OrdenesService,
    private readonly cloudinary: CloudinaryService,
    private readonly jwtService: JwtService,
    private readonly betterAuthService: BetterAuthService,
  ) {}

  @Post('upload')
  async uploadImagen(@Request() req: any, @Body('imagen') imagen: string) {
    // Verificar autenticación (JWT o Better Auth)
    const authHeader = req.headers.authorization;
    let autenticado = false;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        this.jwtService.verify(token);
        autenticado = true;
      } catch {
        // JWT inválido
      }
    }
    if (!autenticado) {
      try {
        const session = await this.betterAuthService.auth.api.getSession(req);
        if (session && session.user) autenticado = true;
      } catch {
        // Better Auth falló
      }
    }
    if (!autenticado) {
      throw new UnauthorizedException('No autorizado');
    }

    try {
      if (!imagen || !imagen.startsWith('data:image')) {
        throw new Error('Formato de imagen inválido. Debe ser una imagen en base64.');
      }
      const url = await this.cloudinary.uploadBase64(imagen, 'ordenes');
      return { url };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al subir la imagen a Cloudinary');
    }
  }

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
    @Body() body: { estado: string; imagenUrl?: string },
  ) {
    return this.svc.cambiarEstado(id, body.estado, body.imagenUrl);
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

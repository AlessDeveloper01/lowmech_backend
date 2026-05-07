import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InventarioService } from './inventario.service.js';
import { CreateArticuloDto } from './dto/create-articulo.dto.js';
import { UpdateArticuloDto } from './dto/update-articulo.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Controller('inventario')
@UseGuards(JwtAuthGuard)
export class InventarioController {
  constructor(
    private readonly inventarioService: InventarioService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post('upload')
  async uploadImagen(@Body('imagen') imagen: string) {
    const url = await this.cloudinary.uploadBase64(imagen, 'inventario');
    return { url };
  }

  @Post()
  create(@Body() dto: CreateArticuloDto) {
    return this.inventarioService.create(dto);
  }

  @Get()
  findAll() {
    return this.inventarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticuloDto,
  ) {
    return this.inventarioService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.remove(id);
  }

  @Patch(':id/stock')
  ajustarStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('cantidad') cantidad: number,
  ) {
    return this.inventarioService.ajustarStock(id, cantidad);
  }
}

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo } from './entities/articulo.entity.js';
import { CreateArticuloDto } from './dto/create-articulo.dto.js';
import { UpdateArticuloDto } from './dto/update-articulo.dto.js';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Articulo)
    private readonly articulosRepo: Repository<Articulo>,
  ) {}

  async create(dto: CreateArticuloDto): Promise<Articulo> {
    const exists = await this.articulosRepo.findOne({
      where: { sku: dto.sku },
    });
    if (exists) {
      throw new ConflictException('Ya existe un artículo con ese SKU');
    }
    const articulo = this.articulosRepo.create(dto);
    return this.articulosRepo.save(articulo);
  }

  async findAll(): Promise<Articulo[]> {
    return this.articulosRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Articulo> {
    const articulo = await this.articulosRepo.findOne({ where: { id } });
    if (!articulo) {
      throw new NotFoundException(`Artículo con id ${id} no encontrado`);
    }
    return articulo;
  }

  async update(id: number, dto: UpdateArticuloDto): Promise<Articulo> {
    const articulo = await this.articulosRepo.findOne({ where: { id } });
    if (!articulo) {
      throw new NotFoundException(`Artículo con id ${id} no encontrado`);
    }

    if (dto.sku && dto.sku !== articulo.sku) {
      const duplicate = await this.articulosRepo.findOne({
        where: { sku: dto.sku },
      });
      if (duplicate) {
        throw new ConflictException('Ya existe un artículo con ese SKU');
      }
    }

    Object.assign(articulo, dto);
    return this.articulosRepo.save(articulo);
  }

  async remove(id: number): Promise<{ message: string }> {
    const articulo = await this.articulosRepo.findOne({ where: { id } });
    if (!articulo) {
      throw new NotFoundException(`Artículo con id ${id} no encontrado`);
    }
    await this.articulosRepo.remove(articulo);
    return { message: `Artículo con id ${id} eliminado correctamente` };
  }

  async ajustarStock(id: number, cantidad: number): Promise<Articulo> {
    const articulo = await this.articulosRepo.findOne({ where: { id } });
    if (!articulo) {
      throw new NotFoundException(`Artículo con id ${id} no encontrado`);
    }
    articulo.stock = Math.max(0, articulo.stock + cantidad);
    return this.articulosRepo.save(articulo);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity.js';
import { ServicioItem } from './entities/servicio-item.entity.js';
import { CreateServicioDto } from './dto/create-servicio.dto.js';
import { UpdateServicioDto } from './dto/update-servicio.dto.js';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly serviciosRepo: Repository<Servicio>,
    @InjectRepository(ServicioItem)
    private readonly itemsRepo: Repository<ServicioItem>,
  ) {}

  async create(dto: CreateServicioDto): Promise<Servicio> {
    const { items, ...rest } = dto;
    const servicio = this.serviciosRepo.create(rest);
    const saved = await this.serviciosRepo.save(servicio);

    if (items && items.length > 0) {
      const servicioItems = items.map((i) =>
        this.itemsRepo.create({
          servicioId: saved.id,
          articuloId: i.articuloId,
          cantidad: i.cantidad,
        }),
      );
      await this.itemsRepo.save(servicioItems);
    }

    return this.findOne(saved.id);
  }

  async findAll(): Promise<Servicio[]> {
    return this.serviciosRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.articulo'],
    });
  }

  async findOne(id: number): Promise<Servicio> {
    const servicio = await this.serviciosRepo.findOne({
      where: { id },
      relations: ['items', 'items.articulo'],
    });
    if (!servicio) {
      throw new NotFoundException(`Servicio con id ${id} no encontrado`);
    }
    return servicio;
  }

  async update(id: number, dto: UpdateServicioDto): Promise<Servicio> {
    const servicio = await this.serviciosRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!servicio) {
      throw new NotFoundException(`Servicio con id ${id} no encontrado`);
    }

    const { items, ...rest } = dto;
    Object.assign(servicio, rest);
    await this.serviciosRepo.save(servicio);

    if (items !== undefined) {
      // Remove old items and replace
      await this.itemsRepo.delete({ servicioId: id });
      if (items.length > 0) {
        const newItems = items.map((i) =>
          this.itemsRepo.create({
            servicioId: id,
            articuloId: i.articuloId,
            cantidad: i.cantidad,
          }),
        );
        await this.itemsRepo.save(newItems);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const servicio = await this.serviciosRepo.findOne({ where: { id } });
    if (!servicio) {
      throw new NotFoundException(`Servicio con id ${id} no encontrado`);
    }
    await this.serviciosRepo.remove(servicio);
    return { message: `Servicio con id ${id} eliminado correctamente` };
  }
}

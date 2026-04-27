import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from './entities/vehiculo.entity.js';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto.js';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto.js';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculosRepo: Repository<Vehiculo>,
  ) {}

  async create(dto: CreateVehiculoDto): Promise<Vehiculo> {
    const vehiculo = this.vehiculosRepo.create(dto);
    return this.vehiculosRepo.save(vehiculo);
  }

  async findAll(): Promise<Vehiculo[]> {
    return this.vehiculosRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findByClienteEmail(email: string): Promise<Vehiculo[]> {
    return this.vehiculosRepo.find({
      where: { clienteEmail: email },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculosRepo.findOne({ where: { id } });
    if (!vehiculo) {
      throw new NotFoundException(`Vehiculo con id ${id} no encontrado`);
    }
    return vehiculo;
  }

  async update(id: number, dto: UpdateVehiculoDto): Promise<Vehiculo> {
    const vehiculo = await this.vehiculosRepo.findOne({ where: { id } });
    if (!vehiculo) {
      throw new NotFoundException(`Vehiculo con id ${id} no encontrado`);
    }
    Object.assign(vehiculo, dto);
    return this.vehiculosRepo.save(vehiculo);
  }

  async remove(id: number): Promise<{ message: string }> {
    const vehiculo = await this.vehiculosRepo.findOne({ where: { id } });
    if (!vehiculo) {
      throw new NotFoundException(`Vehiculo con id ${id} no encontrado`);
    }
    await this.vehiculosRepo.remove(vehiculo);
    return { message: `Vehiculo con id ${id} eliminado correctamente` };
  }
}

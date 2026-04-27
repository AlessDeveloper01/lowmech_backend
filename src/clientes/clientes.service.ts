import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepo: Repository<Cliente>,
  ) {}

  async create(dto: CreateClienteDto): Promise<Cliente> {
    const exists = await this.clientesRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('Ya existe un cliente con ese email');
    }
    const cliente = this.clientesRepo.create(dto);
    return this.clientesRepo.save(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return this.clientesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepo.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.clientesRepo.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }

    if (dto.email && dto.email !== cliente.email) {
      const duplicate = await this.clientesRepo.findOne({
        where: { email: dto.email },
      });
      if (duplicate) {
        throw new ConflictException('Ya existe un cliente con ese email');
      }
    }

    Object.assign(cliente, dto);
    return this.clientesRepo.save(cliente);
  }

  async remove(id: number): Promise<{ message: string }> {
    const cliente = await this.clientesRepo.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    await this.clientesRepo.remove(cliente);
    return { message: `Cliente con id ${id} eliminado correctamente` };
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    return this.clientesRepo.findOne({ where: { email } });
  }

  async setPassword(id: number, hash: string): Promise<void> {
    await this.clientesRepo.update(id, { password: hash, passwordSet: true });
  }
}

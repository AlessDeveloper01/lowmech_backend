import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promocion } from './entities/promocion.entity';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Injectable()
export class PromocionesService {
  constructor(
    @InjectRepository(Promocion)
    private readonly repo: Repository<Promocion>,
  ) {}

  create(dto: CreatePromocionDto) {
    const promo = this.repo.create(dto);
    return this.repo.save(promo);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findActivas() {
    return this.repo.find({
      where: { activa: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const promo = await this.repo.findOneBy({ id });
    if (!promo) throw new NotFoundException(`Promoción #${id} no encontrada`);
    return promo;
  }

  async update(id: number, dto: UpdatePromocionDto) {
    const promo = await this.findOne(id);
    Object.assign(promo, dto);
    return this.repo.save(promo);
  }

  async remove(id: number) {
    const promo = await this.findOne(id);
    return this.repo.remove(promo);
  }
}

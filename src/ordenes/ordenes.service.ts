import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orden } from './entities/orden.entity';
import { OrdenLinea } from './entities/orden-linea.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectRepository(Orden)
    private readonly ordenRepo: Repository<Orden>,
    @InjectRepository(OrdenLinea)
    private readonly lineaRepo: Repository<OrdenLinea>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private isBase64(str: string): boolean {
    return str.startsWith('data:image');
  }

  async create(dto: CreateOrdenDto) {
    const { lineas, ...rest } = dto;
    if (rest.imagenUrl && this.isBase64(rest.imagenUrl)) {
      rest.imagenUrl = await this.cloudinary.uploadBase64(rest.imagenUrl, 'ordenes');
    }
    const orden = this.ordenRepo.create(rest);
    const saved = await this.ordenRepo.save(orden);

    if (lineas?.length) {
      const lineaEntities = lineas.map((l) =>
        this.lineaRepo.create({ ...l, ordenId: saved.id }),
      );
      await this.lineaRepo.save(lineaEntities);
    }

    return this.findOne(saved.id);
  }

  findAll() {
    return this.ordenRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findByClienteId(clienteId: number) {
    const ordenes = await this.ordenRepo.find({
      where: { clienteId },
      relations: ['cliente', 'vehiculo', 'mecanico', 'promocion', 'lineas'],
      order: { createdAt: 'DESC' },
    });
    return ordenes.map((orden) => {
      const { subtotal, iva, total } = this.calcularTotales(orden);
      return { ...orden, subtotal, iva, total };
    });
  }

  async findByMecanicoId(mecanicoId: number) {
    const ordenes = await this.ordenRepo.find({
      where: { mecanicoId },
      relations: ['cliente', 'vehiculo', 'mecanico', 'promocion', 'lineas'],
      order: { createdAt: 'DESC' },
    });
    return ordenes.map((orden) => {
      const { subtotal, iva, total } = this.calcularTotales(orden);
      return { ...orden, subtotal, iva, total };
    });
  }

  private calcularTotales(orden: Orden) {
    const subtotal = orden.lineas.reduce(
      (sum, l) => sum + l.cantidad * l.precioUnitario,
      0,
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  }

  async findOne(id: number) {
    const orden = await this.ordenRepo.findOne({
      where: { id },
      relations: ['cliente', 'vehiculo', 'mecanico', 'promocion', 'lineas'],
    });
    if (!orden) throw new NotFoundException(`Orden #${id} no encontrada`);
    
    const subtotal = orden.lineas.reduce(
      (sum, l) => sum + l.cantidad * l.precioUnitario,
      0,
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    return {
      ...orden,
      subtotal,
      iva,
      total,
    };
  }

  async update(id: number, dto: UpdateOrdenDto) {
    const orden = await this.findOne(id);
    const { lineas, ...rest } = dto;

    if (rest.imagenUrl && this.isBase64(rest.imagenUrl)) {
      if (orden.imagenUrl) await this.cloudinary.deleteImage(orden.imagenUrl);
      rest.imagenUrl = await this.cloudinary.uploadBase64(rest.imagenUrl, 'ordenes');
    }

    Object.assign(orden, rest);
    await this.ordenRepo.save(orden);

    if (lineas !== undefined) {
      await this.lineaRepo.delete({ ordenId: id });
      if (lineas.length) {
        const lineaEntities = lineas.map((l) =>
          this.lineaRepo.create({ ...l, ordenId: id }),
        );
        await this.lineaRepo.save(lineaEntities);
      }
    }

    return this.findOne(id);
  }

  async cambiarEstado(id: number, estado: string, imagenUrl?: string) {
    const orden = await this.findOne(id);
    const estadosFinales = ['completado', 'entregado', 'finalizado'];

    if (estadosFinales.includes(estado) && !imagenUrl && !orden.imagenUrl) {
      throw new BadRequestException('Se requiere una imagen al finalizar la orden');
    }

    orden.estado = estado;
    if (estadosFinales.includes(estado)) {
      orden.fechaFin = new Date().toISOString().split('T')[0];
    }
    if (imagenUrl) {
      if (this.isBase64(imagenUrl)) {
        if (orden.imagenUrl) await this.cloudinary.deleteImage(orden.imagenUrl);
        orden.imagenUrl = await this.cloudinary.uploadBase64(imagenUrl, 'ordenes');
      } else {
        orden.imagenUrl = imagenUrl;
      }
    }
    await this.ordenRepo.save(orden);
    return this.findOne(id);
  }

  async pagarEfectivo(id: number, dto: { anticipo: number; estado: string }) {
    const orden = await this.findOne(id);
    orden.anticipo = dto.anticipo;
    orden.estado = dto.estado;
    if (
      dto.estado === 'completado' ||
      dto.estado === 'entregado' ||
      dto.estado === 'pagado'
    ) {
      orden.fechaFin = orden.fechaFin ?? new Date().toISOString().split('T')[0];
    }
    await this.ordenRepo.save(orden);
    return this.findOne(id);
  }

  async remove(id: number) {
    const orden = await this.findOne(id);
    return this.ordenRepo.remove(orden);
  }

  async marcarOperativo(id: number) {
    const orden = await this.findOne(id);
    orden.estado = 'operativo';
    orden.fechaOperativo = new Date();
    await this.ordenRepo.save(orden);

    if (orden.vehiculoId) {
      await this.vehiculoRepo.update(orden.vehiculoId, { estado: 'disponible' });
    }

    return this.findOne(id);
  }

  async actualizarProgreso(id: number, progreso: number, notasProgreso: string, checklist: Record<string, boolean>) {
    const orden = await this.findOne(id);
    orden.progreso = progreso;
    orden.notasProgreso = notasProgreso;
    if (checklist.diagnostico !== undefined) orden.checklistDiagnostico = checklist.diagnostico;
    if (checklist.reparacion !== undefined) orden.checklistReparacion = checklist.reparacion;
    if (checklist.pruebas !== undefined) orden.checklistPruebas = checklist.pruebas;
    if (checklist.limpieza !== undefined) orden.checklistLimpieza = checklist.limpieza;
    await this.ordenRepo.save(orden);
    return this.findOne(id);
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from './entities/configuracion.entity';
import { Orden } from '../ordenes/entities/orden.entity';
import { OrdenLinea } from '../ordenes/entities/orden-linea.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { Articulo } from '../inventario/entities/articulo.entity';
import { Pago } from '../pagos/entities/pago.entity';

export interface ConfiguracionData {
  tallerNombre: string;
  tallerDireccion: string;
  tallerTelefono: string;
  tallerEmail: string;
  iva: number;
  moneda: string;
}

const DEFAULTS: ConfiguracionData = {
  tallerNombre: 'LowMech Systems',
  tallerDireccion: 'Av. Principal #123, Col. Centro',
  tallerTelefono: '555-000-0000',
  tallerEmail: 'admin@lowmech.com',
  iva: 16,
  moneda: 'MXN',
};

@Injectable()
export class ConfiguracionService {
  constructor(
    @InjectRepository(Configuracion)
    private readonly repo: Repository<Configuracion>,
    @InjectRepository(Orden)
    private readonly ordenRepo: Repository<Orden>,
    @InjectRepository(OrdenLinea)
    private readonly lineaRepo: Repository<OrdenLinea>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,
  ) {}

  async findAll(): Promise<ConfiguracionData> {
    const rows = await this.repo.find();
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.clave] = row.valor;
    }
    return {
      tallerNombre: map['tallerNombre'] ?? DEFAULTS.tallerNombre,
      tallerDireccion: map['tallerDireccion'] ?? DEFAULTS.tallerDireccion,
      tallerTelefono: map['tallerTelefono'] ?? DEFAULTS.tallerTelefono,
      tallerEmail: map['tallerEmail'] ?? DEFAULTS.tallerEmail,
      iva: map['iva'] != null ? Number(map['iva']) : DEFAULTS.iva,
      moneda: map['moneda'] ?? DEFAULTS.moneda,
    };
  }

  async updateAll(
    data: Partial<ConfiguracionData>,
  ): Promise<ConfiguracionData> {
    const entries = Object.entries(data) as [string, string | number][];
    for (const [clave, valor] of entries) {
      await this.repo.upsert(
        { clave, valor: String(valor) },
        { conflictPaths: ['clave'] },
      );
    }
    return this.findAll();
  }

  async resetDatos(tipo: string): Promise<{ mensaje: string }> {
    switch (tipo) {
      case 'ordenes':
        await this.lineaRepo.delete({});
        await this.pagoRepo.delete({});
        await this.ordenRepo.delete({});
        break;
      case 'vehiculos':
        await this.vehiculoRepo.delete({});
        break;
      case 'clientes':
        await this.clienteRepo.delete({});
        break;
      case 'inventario':
        await this.articuloRepo.delete({});
        break;
      case 'todo':
        await this.lineaRepo.delete({});
        await this.pagoRepo.delete({});
        await this.ordenRepo.delete({});
        await this.vehiculoRepo.delete({});
        await this.clienteRepo.delete({});
        await this.articuloRepo.delete({});
        break;
      default:
        throw new BadRequestException(`Tipo desconocido: ${tipo}`);
    }
    return { mensaje: `Datos de "${tipo}" eliminados correctamente` };
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Servicio } from './servicio.entity.js';
import { Articulo } from '../../inventario/entities/articulo.entity.js';

@Entity('servicio_items')
export class ServicioItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Servicio, (s) => s.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'servicioId' })
  servicio: Servicio;

  @Column()
  servicioId: number;

  @ManyToOne(() => Articulo, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'articuloId' })
  articulo: Articulo;

  @Column()
  articuloId: number;

  @Column({ type: 'integer', default: 1 })
  cantidad: number;
}

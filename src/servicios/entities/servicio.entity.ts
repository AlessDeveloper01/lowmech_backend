import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ServicioItem } from './servicio-item.entity.js';

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ default: '' })
  descripcion: string;

  @Column({ default: '' })
  categoria: string;

  @Column({ type: 'real', default: 0 })
  precioManoObra: number;

  @Column({ type: 'integer', default: 60 })
  duracionMinutos: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'text', default: '' })
  notas: string;

  @OneToMany(() => ServicioItem, (item) => item.servicio, {
    cascade: true,
    eager: true,
  })
  items: ServicioItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('promociones')
export class Promocion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', default: '' })
  descripcion: string;

  /** porcentaje | monto | gratis */
  @Column({ default: 'porcentaje' })
  tipo: string;

  /** % o monto fijo de descuento */
  @Column({ type: 'real', default: 0 })
  valor: number;

  @Column({ default: '' })
  codigo: string;

  @Column({ type: 'text', default: '' })
  fechaInicio: string;

  @Column({ type: 'text', default: '' })
  fechaFin: string;

  @Column({ default: true })
  activa: boolean;

  @Column({ type: 'integer', default: 0 })
  usosMaximos: number;

  @Column({ type: 'integer', default: 0 })
  usosActuales: number;

  @Column({ type: 'text', default: '' })
  condiciones: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

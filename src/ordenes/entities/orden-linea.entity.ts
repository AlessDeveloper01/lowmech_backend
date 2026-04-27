import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Orden } from './orden.entity';

@Entity('orden_lineas')
export class OrdenLinea {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Orden, (o) => o.lineas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordenId' })
  orden: Orden;

  @Column()
  ordenId: number;

  /** servicio | refaccion */
  @Column()
  tipo: string;

  @Column({ nullable: true })
  servicioId: number;

  @Column({ nullable: true })
  articuloId: number;

  @Column({ default: '' })
  descripcion: string;

  @Column({ type: 'integer', default: 1 })
  cantidad: number;

  @Column({ type: 'real', default: 0 })
  precioUnitario: number;
}

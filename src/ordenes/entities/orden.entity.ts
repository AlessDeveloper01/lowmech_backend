import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';
import { User } from '../../users/entities/user.entity';
import { Promocion } from '../../promociones/entities/promocion.entity';
import { OrdenLinea } from './orden-linea.entity';

@Entity('ordenes')
export class Orden {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column({ nullable: true })
  clienteId: number;

  @ManyToOne(() => Vehiculo, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'vehiculoId' })
  vehiculo: Vehiculo;

  @Column({ nullable: true })
  vehiculoId: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'mecanicoId' })
  mecanico: User;

  @Column({ nullable: true })
  mecanicoId: number;

  @Column({ type: 'text', default: '' })
  diagnostico: string;

  @Column({ type: 'text', default: '' })
  notas: string;

  @Column({ type: 'text', default: '' })
  fechaIngreso: string;

  @Column({ type: 'text', default: '' })
  fechaPromesa: string;

  /** baja | media | alta | urgente */
  @Column({ default: 'media' })
  prioridad: string;

  /** recibido | diagnostico | en_progreso | esperando_piezas | completado | entregado | operativo | cancelado */
  @Column({ default: 'recibido' })
  estado: string;

  @Column({ type: 'datetime', nullable: true })
  fechaOperativo: Date;

  @Column({ type: 'real', default: 0 })
  progreso: number;

  @Column({ type: 'text', default: '' })
  notasProgreso: string;

  @Column({ default: false })
  checklistDiagnostico: boolean;

  @Column({ default: false })
  checklistReparacion: boolean;

  @Column({ default: false })
  checklistPruebas: boolean;

  @Column({ default: false })
  checklistLimpieza: boolean;

  @Column({ type: 'real', default: 0 })
  anticipo: number;

  @Column({ type: 'real', default: 0 })
  descuento: number;

  @ManyToOne(() => Promocion, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'promocionId' })
  promocion: Promocion;

  @Column({ nullable: true })
  promocionId: number;

  @Column({ type: 'text', default: '' })
  fechaFin: string;

  @OneToMany(() => OrdenLinea, (l) => l.orden, { eager: true, cascade: true })
  lineas: OrdenLinea[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

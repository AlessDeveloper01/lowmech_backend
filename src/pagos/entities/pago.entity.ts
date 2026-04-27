import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Orden } from '../../ordenes/entities/orden.entity';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Orden, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'ordenId' })
  orden: Orden;

  @Column({ nullable: true })
  ordenId: number;

  @Column({ type: 'real', default: 0 })
  monto: number;

  @Column({ default: 'mxn' })
  moneda: string;

  /** card | cash | transfer */
  @Column({ default: 'card' })
  metodo: string;

  /** pending | succeeded | failed | refunded */
  @Column({ default: 'pending' })
  estado: string;

  @Column({ default: '' })
  stripePaymentIntentId: string;

  @Column({ default: '' })
  stripeChargeId: string;

  @Column({ default: '' })
  last4: string;

  @Column({ default: '' })
  brand: string;

  @CreateDateColumn()
  createdAt: Date;
}

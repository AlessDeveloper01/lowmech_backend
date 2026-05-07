import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('articulos')
export class Articulo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  sku: string;

  @Column({ default: '' })
  categoria: string;

  @Column({ type: 'integer', default: 0 })
  stock: number;

  @Column({ type: 'integer', default: 5 })
  stockMinimo: number;

  @Column({ default: 'Piezas' })
  unidad: string;

  @Column({ type: 'real', default: 0 })
  precioCompra: number;

  @Column({ type: 'real', default: 0 })
  precioVenta: number;

  @Column({ default: '' })
  proveedor: string;

  @Column({ default: '' })
  ubicacion: string;

  @Column({ type: 'text', default: '' })
  notas: string;

  @Column({ type: 'text', nullable: true })
  imagenUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

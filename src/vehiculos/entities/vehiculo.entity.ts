import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type EstadoVehiculo = 'en_taller' | 'disponible' | 'en_espera';

@Entity('vehiculos')
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column({ default: '' })
  anio: string;

  @Column()
  placa: string;

  @Column({ default: '' })
  color: string;

  @Column({ default: '' })
  vin: string;

  @Column({ type: 'integer', default: 0 })
  kilometraje: number;

  @Column({ default: 'Gasolina' })
  combustible: string;

  @Column()
  clienteNombre: string;

  @Column({ default: '' })
  clienteTelefono: string;

  @Column({ default: '' })
  clienteEmail: string;

  @Column({ type: 'varchar', default: 'disponible' })
  estado: EstadoVehiculo;

  @Column({ type: 'text', default: '' })
  notas: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  telefono: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: '' })
  direccion: string;

  @Column({ default: '' })
  rfc: string;

  @Column({ type: 'text', default: '' })
  notas: string;

  /** Hash bcrypt. NULL = primer acceso, aún sin contraseña. */
  @Column({ type: 'text', nullable: true, default: null })
  password: string | null;

  /** true cuando el cliente ya estableció su contraseña por primera vez */
  @Column({ type: 'boolean', default: false })
  passwordSet: boolean;

  /** Better Auth user id (linked automatically on sign-up) */
  @Column('varchar', { length: 100, nullable: true, unique: true })
  betterAuthUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

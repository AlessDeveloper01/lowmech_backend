import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  MECANICO = 'mecanico',
  RECEPCIONISTA = 'recepcionista',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', default: UserRole.MECANICO })
  rol: UserRole;

  @Column({ default: true })
  activo: boolean;

  @Column('varchar', { length: 100, nullable: true })
  resetToken: string | null;

  @Column('datetime', { nullable: true })
  resetTokenExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('configuracion')
export class Configuracion {
  @PrimaryColumn({ type: 'text' })
  clave: string;

  @Column({ type: 'text' })
  valor: string;
}

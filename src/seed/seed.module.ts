import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { Cliente } from '../clientes/entities/cliente.entity.js';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity.js';
import { Articulo } from '../inventario/entities/articulo.entity.js';
import { Servicio } from '../servicios/entities/servicio.entity.js';
import { ServicioItem } from '../servicios/entities/servicio-item.entity.js';
import { Promocion } from '../promociones/entities/promocion.entity.js';
import { Orden } from '../ordenes/entities/orden.entity.js';
import { OrdenLinea } from '../ordenes/entities/orden-linea.entity.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Cliente,
      Vehiculo,
      Articulo,
      Servicio,
      ServicioItem,
      Promocion,
      Orden,
      OrdenLinea,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuracion } from './entities/configuracion.entity';
import { ConfiguracionService } from './configuracion.service';
import { ConfiguracionController } from './configuracion.controller';
import { Orden } from '../ordenes/entities/orden.entity';
import { OrdenLinea } from '../ordenes/entities/orden-linea.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { Articulo } from '../inventario/entities/articulo.entity';
import { Pago } from '../pagos/entities/pago.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Configuracion,
      Orden,
      OrdenLinea,
      Cliente,
      Vehiculo,
      Articulo,
      Pago,
    ]),
  ],
  controllers: [ConfiguracionController],
  providers: [ConfiguracionService],
  exports: [ConfiguracionService],
})
export class ConfiguracionModule {}

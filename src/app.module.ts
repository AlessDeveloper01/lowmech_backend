import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PagosModule } from './pagos/pagos.module.js';
import { Pago } from './pagos/entities/pago.entity.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SeedModule } from './seed/seed.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { VehiculosModule } from './vehiculos/vehiculos.module.js';
import { InventarioModule } from './inventario/inventario.module.js';
import { ServiciosModule } from './servicios/servicios.module.js';
import { PromocionesModule } from './promociones/promociones.module.js';
import { OrdenesModule } from './ordenes/ordenes.module.js';
import { ConfiguracionModule } from './configuracion/configuracion.module.js';
import { Configuracion } from './configuracion/entities/configuracion.entity.js';
import { User } from './users/entities/user.entity.js';
import { Cliente } from './clientes/entities/cliente.entity.js';
import { Vehiculo } from './vehiculos/entities/vehiculo.entity.js';
import { Articulo } from './inventario/entities/articulo.entity.js';
import { Servicio } from './servicios/entities/servicio.entity.js';
import { ServicioItem } from './servicios/entities/servicio-item.entity.js';
import { Promocion } from './promociones/entities/promocion.entity.js';
import { Orden } from './ordenes/entities/orden.entity.js';
import { OrdenLinea } from './ordenes/entities/orden-linea.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'lowmech.db',
      entities: [
        User,
        Cliente,
        Vehiculo,
        Articulo,
        Servicio,
        ServicioItem,
        Promocion,
        Orden,
        OrdenLinea,
        Pago,
        Configuracion,
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    SeedModule,
    ClientesModule,
    VehiculosModule,
    InventarioModule,
    ServiciosModule,
    PromocionesModule,
    OrdenesModule,
    PagosModule,
    ConfiguracionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

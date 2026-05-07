import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orden } from './entities/orden.entity';
import { OrdenLinea } from './entities/orden-linea.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { BetterAuthModule } from '../better-auth/index';
import { JWT_SECRET } from '../auth/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orden, OrdenLinea, Vehiculo]),
    CloudinaryModule,
    BetterAuthModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [OrdenesController],
  providers: [OrdenesService],
  exports: [OrdenesService],
})
export class OrdenesModule {}

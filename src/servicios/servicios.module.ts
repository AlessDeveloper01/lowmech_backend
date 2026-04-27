import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity.js';
import { ServicioItem } from './entities/servicio-item.entity.js';
import { ServiciosService } from './servicios.service.js';
import { ServiciosController } from './servicios.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Servicio, ServicioItem])],
  controllers: [ServiciosController],
  providers: [ServiciosService],
  exports: [ServiciosService],
})
export class ServiciosModule {}

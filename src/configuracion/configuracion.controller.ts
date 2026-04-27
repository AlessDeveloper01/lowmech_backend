import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ConfiguracionService,
  type ConfiguracionData,
} from './configuracion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly service: ConfiguracionService) {}

  @Get()
  findAll(): Promise<ConfiguracionData> {
    return this.service.findAll();
  }

  @Put()
  update(@Body() body: Partial<ConfiguracionData>): Promise<ConfiguracionData> {
    return this.service.updateAll(body);
  }

  @Delete('reset/:tipo')
  resetDatos(@Param('tipo') tipo: string) {
    return this.service.resetDatos(tipo);
  }
}

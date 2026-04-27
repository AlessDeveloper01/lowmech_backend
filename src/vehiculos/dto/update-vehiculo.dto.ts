import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  MinLength,
} from 'class-validator';
import type { EstadoVehiculo } from '../entities/vehiculo.entity.js';

export class UpdateVehiculoDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  nombre?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  marca?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  anio?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  placa?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsNumber()
  @IsOptional()
  kilometraje?: number;

  @IsString()
  @IsOptional()
  combustible?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  clienteNombre?: string;

  @IsString()
  @IsOptional()
  clienteTelefono?: string;

  @IsString()
  @IsOptional()
  clienteEmail?: string;

  @IsIn(['en_taller', 'disponible', 'en_espera'])
  @IsOptional()
  estado?: EstadoVehiculo;

  @IsString()
  @IsOptional()
  notas?: string;
}

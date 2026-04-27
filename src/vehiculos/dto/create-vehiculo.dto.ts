import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  MinLength,
} from 'class-validator';
import type { EstadoVehiculo } from '../entities/vehiculo.entity.js';

export class CreateVehiculoDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(1)
  marca: string;

  @IsString()
  @MinLength(1)
  modelo: string;

  @IsString()
  @IsOptional()
  anio?: string;

  @IsString()
  @MinLength(1)
  placa: string;

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
  clienteNombre: string;

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

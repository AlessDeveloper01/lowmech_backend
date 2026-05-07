import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrdenLineaDto {
  @IsString()
  tipo: string;

  @IsOptional()
  @IsNumber()
  servicioId?: number;

  @IsOptional()
  @IsNumber()
  articuloId?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  cantidad?: number;

  @IsOptional()
  @IsNumber()
  precioUnitario?: number;
}

export class CreateOrdenDto {
  @IsOptional()
  @IsNumber()
  clienteId?: number;

  @IsOptional()
  @IsNumber()
  vehiculoId?: number;

  @IsOptional()
  @IsNumber()
  mecanicoId?: number;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsString()
  fechaIngreso?: string;

  @IsOptional()
  @IsString()
  fechaPromesa?: string;

  @IsOptional()
  @IsString()
  prioridad?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsNumber()
  anticipo?: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;

  @IsOptional()
  @IsNumber()
  promocionId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrdenLineaDto)
  lineas?: CreateOrdenLineaDto[];

  @IsString()
  @IsOptional()
  imagenUrl?: string;
}

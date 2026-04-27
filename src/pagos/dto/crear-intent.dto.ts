import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LineaIntentDto {
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

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;
}

export class CrearIntentDto {
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
  @IsNumber()
  descuento?: number;

  @IsOptional()
  @IsNumber()
  promocionId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineaIntentDto)
  lineas: LineaIntentDto[];

  /** Total calculado (con IVA y descuento) en pesos */
  @IsNumber()
  @Min(1)
  total: number;

  /** Si se proporciona, actualiza la orden existente en lugar de crear una nueva */
  @IsOptional()
  @IsNumber()
  ordenId?: number;
}

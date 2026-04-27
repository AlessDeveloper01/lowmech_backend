import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServicioItemDto } from './create-servicio.dto.js';

export class UpdateServicioDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precioManoObra?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  duracionMinutos?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicioItemDto)
  @IsOptional()
  items?: ServicioItemDto[];
}

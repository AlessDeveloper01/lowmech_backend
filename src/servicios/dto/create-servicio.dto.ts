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

export class ServicioItemDto {
  @IsNumber()
  articuloId: number;

  @IsNumber()
  @Min(1)
  cantidad: number;
}

export class CreateServicioDto {
  @IsString()
  @MinLength(2)
  nombre: string;

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

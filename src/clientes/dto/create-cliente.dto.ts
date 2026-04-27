import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(7)
  telefono: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  rfc?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}

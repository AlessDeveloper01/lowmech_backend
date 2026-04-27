import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmarPagoDto {
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;
}

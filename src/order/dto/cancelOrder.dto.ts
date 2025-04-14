import { IsNotEmpty, IsString } from "class-validator";

export class CancelOrderDto {
    @IsString()
    @IsNotEmpty()
    cancellationReason!: string;
  }
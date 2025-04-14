import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {

    @IsString()
    @IsNotEmpty({ message: 'Product name is required' })
    name!: string;

    
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  price!: number;
 
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  stock!: number


}

import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto.ts';


export class UpdateProductDto extends PartialType(CreateProductDto) {}

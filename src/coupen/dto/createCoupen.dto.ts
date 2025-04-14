
import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsDateString, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';
export enum DiscountType {
    PERCENTAGE='PERCENTAGE',
    FIXED='FIXED'
  }
export class CreateCouponDto {
    @IsString()
    code!: string;
    
    @IsOptional()
    @IsString()
    discountType?: DiscountType;
    
    @IsNumber()
    discountValue!: number;
   
    @IsOptional()
    @IsNumber()
    usageLimit?: number;
    
    @IsDateString()
    expiresAt!: Date;

    @IsOptional()
    @IsNumber()
    minOrder?: number;
    
    @IsOptional()
    @IsBoolean()
    isActive?:boolean
  }
  export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
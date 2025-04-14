import { Body, Controller, Post } from "@nestjs/common";
import { CouponService } from "./coupen.service";
import { AdminOnly } from "src/auth/roles.decorator";
import { CreateCouponDto } from "./dto/createCoupen.dto";

@Controller('coupons')

export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('create')
  @AdminOnly()
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

@Post('apply-coupon')
async applyCoupon(
  @Body() body: { items: Array<{ productId: string; quantity: number }>, couponCode: string }
) {
  return this.couponService.calculateWithCoupon(body.items, body.couponCode);
}
}
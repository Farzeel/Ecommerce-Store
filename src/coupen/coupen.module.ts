import { Module } from "@nestjs/common";
import { CouponService } from "./coupen.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { CouponController } from "./coupen.controller";

@Module({
    controllers: [CouponController],
    providers: [CouponService],
    imports: [PrismaModule],
  })
  export class CouponModule {}
  
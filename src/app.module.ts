import { PrismaService } from './prisma.service';
import { Module } from '@nestjs/common';


import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { AdminModule } from './admin/admin.module';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupen/coupen.module';



@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true, envFilePath: './.env'}),
    AuthModule,
    PrismaModule,
    ProductModule,
    AdminModule,
    OrderModule,
    CouponModule
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}

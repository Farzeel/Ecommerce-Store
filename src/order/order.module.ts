import { PrismaModule } from 'src/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MailService } from 'src/mail/mail.service';


@Module({
    imports:[PrismaModule],
  controllers: [OrderController],
  providers: [OrderService,MailService],
})
export class OrderModule {}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RequestWithUser } from "src/auth/request-with-user.interface";
import { AdminOnly } from "src/auth/roles.decorator";
import { UpdateOrderStatusDto } from "./dto/update-order.dto";
import { CancelOrderDto } from "./dto/cancelOrder.dto";


@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  
  @UseGuards(JwtAuthGuard)
  @Post("created")
  async create(@Body() createOrderDto: CreateOrderDto,    @Req() req ){
   
    return    this.orderService.create( createOrderDto,req.user.userId);
      
  }
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @Param('id') orderId: string,
    @Body() cancelOrderDto: CancelOrderDto,
    @Req() request 
  ) {
    const userId = request.user.userId; 
    return this.orderService.cancelOrder(orderId, userId, cancelOrderDto.cancellationReason);
  }

  @UseGuards(JwtAuthGuard)
  @Get("allOrders")
  async getAllUserOrders( @Req() req ){
   
    return    this.orderService.findAllForUser( req.user.userId);
      
  }
  @UseGuards(JwtAuthGuard)
  @AdminOnly()
  @Get("all")
  async findAll(@Query('page') page: number, @Query('limit') limit: number){
   
    return    this.orderService.findAll( page,limit);
      
  }

  @UseGuards(JwtAuthGuard)
  @AdminOnly()
  @Patch('update/:id')
  async updateStatus(
    @Param('id') orderId: string,
    @Body() status: UpdateOrderStatusDto
  ) {
    return this.orderService.update(orderId, status);
  }
  @UseGuards(JwtAuthGuard)
  @AdminOnly()
  @Delete('delete/:id')
  async delete(
    @Param('id') id:string,
  
  ) {
    return this.orderService.remove(id);
  }
}
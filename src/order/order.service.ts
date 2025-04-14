import { MailService } from 'src/mail/mail.service';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {  OrderStatus, UpdateOrderStatusDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma.service';
import { isValidTransition } from 'src/utils/order-status.utils';
import { DiscountType } from 'src/coupen/dto/createCoupen.dto';
import { Coupon } from '@prisma/client';




@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService, private readonly MailService: MailService) {}
  
  private readonly validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: [OrderStatus.PROCESSING, OrderStatus.CANCELLED,],
    PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    SHIPPED: [OrderStatus.DELIVERED],
    DELIVERED: [],
    CANCELLED: [],
    };

  // Create a new order
  async create(createOrderDto: CreateOrderDto,userId: string) {
    try {
      const { items,couponCode } = createOrderDto;
  
      return this.prisma.$transaction(async (prisma) => {
        // 1. Get products and validate stock
        const products = await prisma.product.findMany({
          where: { id: { in: items.map(item => item.productId) } },
          select: {
            id: true,
            price: true,
            stock: true,
            name: true,
            imageUrl: true
          }
        });
  
        // 2. Validate stock and calculate totals
        const orderItems = items.map(item => {
          const product = products.find(p => p.id === item.productId);
          if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
          if (product.stock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for product ${product.name}`);
          }
          return {
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
            productName: product.name,
            productImage: product.imageUrl
          };
        });
  
        const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
        // 3. Handle coupon validation and discount calculation
        let coupon :null | Coupon = null;
        let discount = 0;
        let amountPaid = subtotal;
  
        if (couponCode) {
          coupon = await prisma.coupon.findUnique({
            where: { code: couponCode }

          });
  
          if (!coupon) throw new NotFoundException('Coupon not found');
          
          // Validate coupon
          const now = new Date();
          if (!coupon.isActive || coupon.expiresAt < now) {
            throw new BadRequestException('Coupon is expired or inactive');
          }
          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new BadRequestException('Coupon usage limit reached');
          }
          if (coupon.minOrder && subtotal < coupon.minOrder) {
            throw new BadRequestException(`Minimum order amount of ${coupon.minOrder} required`);
          }
  
          // Calculate discount
          discount = coupon.discountType === 'PERCENTAGE'
            ? subtotal * (coupon.discountValue / 100)
            : coupon.discountValue;
          
          discount = Math.min(discount, subtotal);
          amountPaid = subtotal - discount;
  
          // Increment coupon usage
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
          });
        }
  
        // 4. Create order and decrement stock
        const order = await prisma.order.create({
          data: {
            userId,
            totalAmount: subtotal,
            discount: discount,
            amountPaid: amountPaid,
            couponId: coupon?.id,
            items: {
              create: orderItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          },
          select: {
            id: true,
            userId: true,
            totalAmount: true,
            discount: true,
            amountPaid: true,
            status: true,
            createdAt: true,
            coupon: {
              select: {
                code: true,
                discountType: true,
                discountValue: true
              }
            },
            items: {
              select: {
                id: true,
                productId: true,
                quantity: true,
                price: true,
                product: {
                  select: {
                    name: true,
                    imageUrl: true
                  }
                }
              }
            }
          }
        });
  
        // 5. Update product stock
        await Promise.all(
          orderItems.map(item =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } }
            })
          )
        );
  
        // 6. Send email (outside transaction)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true }
        });
  
        if (user?.email) {
          this.MailService.sendOrderConfirmation(user.email,{
            
            userName: user.name,
            orderId: order.id,
            items: order.items,
            totalAmount: order.totalAmount,
            discount: order.discount,
            amountPaid: order.amountPaid,
            createdAt:order.createdAt,
            coupon: order.coupon
          }).catch(err => console.error('Email failed:', err));
        }
  
        return {
          success: true,
          message: 'Order created successfully',
          order: {
            ...order,
            items: order.items.map(item => ({
              product: {
                name: item.product.name,
                imageUrl: item.product.imageUrl
              },
              quantity: item.quantity,
              price: item.price
            }))
          }
        };
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error; // Re-throw for proper error handling
    }
  }

  // Get all orders for a specific user
/**
   * Get all orders for a specific user
   * @param userId - ID of the user to fetch orders for
   * @returns Array of user's orders with items
   */
async findAllForUser(userId: string) {
  try {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.log(error)
  }

}


async cancelOrder(orderId: string, userId: string, cancellationReason: string) {
  try {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Verify the order exists and belongs to the user
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
  
      if (!order) {
        throw new NotFoundException('Order not found');
      }
  
      if (order.userId !== userId) {
        console.log(order.userId, userId)
        throw new ForbiddenException('You can only cancel your own orders');
      }
  
      // 2. Check if order is cancelable (pending status)
      if (order.status !== 'PENDING') {
        throw new BadRequestException(
          `Order cannot be cancelled because it's already ${order.status.toLowerCase()}`
        );
      }
  
      // 3. Update order status and record cancellation reason
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancellationReason,
          cancelledAt: new Date(),
        }
      });
  
      // 4. Restore product stock (if applicable)
      await Promise.all(
        order.items.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          })
        )
      );
  
      // 5. If coupon was used, decrement its usage count
      if (order.couponId) {
        await prisma.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { decrement: 1 } }
        });
      }
  
      // 6. Send cancellation confirmation (optional)
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });
      
      if(user?.email){
  
        this.MailService.sendOrderCancellation(user.email, {
          customerName: user.name,
          orderId: updatedOrder.id,
          orderDate: updatedOrder.cancelledAt,
          cancellationReason: updatedOrder.cancellationReason,
        }).catch((err)=>console.log('Failed to send cancellation email:', err));
      }
  
      return {
        success: true,
        message: 'Order cancelled successfully',
      
      };
    });
  } catch (error) {
    console.log(error)
    throw error
  }
  
}






  // // Get all orders (Admin only)
/**
   * Get all orders (Admin only)
   * @returns Array of all orders in the system
   */
async findAll(page: number = 1, limit: number = 10) {
  try {

page = Math.max(1, page);
limit = Math.max(1, Math.min(100, limit)); 

const skip = (page - 1) * limit;

const [orders, totalCount] = await Promise.all([
  this.prisma.order.findMany({
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }),
  this.prisma.order.count()
]);

return {
  data: orders,
  meta: {
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    hasNextPage: page * limit < totalCount,
    hasPreviousPage: page > 1
  }
};
  } catch (error) {
    console.log(error)
  }
  
}
  /**
   Get order by ID
  */
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  // Update the status of an order (Admin only)
/**
   * Update the status of an order (Admin only)
   * @param id - Order ID to update
   * @param updateOrderDto - Update data (status)
   * @returns Updated order
   */


async update(id: string, updateOrderDto: UpdateOrderStatusDto) {
  try {
    const order = await this.prisma.order.findUnique({
      where: { id }
    });
  
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  
        // Validate the transition
        if (!this.validTransitions[order.status].includes(updateOrderDto.status)) {
          
            return `Invalid status transition from ${order.status} to ${updateOrderDto.status}`
          
        }
  
     const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status:  updateOrderDto.status
        
      },select:{
        status:true
      }

    });
    return {
      message: 'Status updated successfully',
      order: updatedOrder,
    };
  } catch (error) {
   console.log(error) 
  }
  
}

  //  Delete an order (Admin only)
/**
   * Delete an order (Admin only)
   * @param id - Order ID to delete
   * @returns Deleted order
   */
async remove(id: string) {
  try {
    const order = await this.prisma.order.findUnique({
      where: { id }
    });
  
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  
    // First delete all order items
    await this.prisma.orderItem.deleteMany({
      where: { orderId: id }
    });
  
    // Then delete the order
    await this.prisma.order.delete({
      where: { id }
    });
  
    return {message:"DELETED SUCCESSFULLY"}
  } catch (error) {
    console.log(error)
  }

}

  
}

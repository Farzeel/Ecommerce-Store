import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateCouponDto } from "./dto/createCoupen.dto";

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}
  
  private  errorMessage(message:string,data:number){
    throw new BadRequestException({message,data})
  }
  
  async create(createCouponDto: CreateCouponDto) {
    try {
        const existing = await this.prisma.coupon.findUnique({
            where: { code: createCouponDto.code },
          });
      
          if (existing) {
            return {success:false,message: 'Coupon code already exists'};
            
          }
          const data=await this.prisma.coupon.create({
              data: {
                ...createCouponDto,
                expiresAt: new Date(createCouponDto.expiresAt),
              },
            });
         return {success:true, message:data}
    } catch (error) {
     console.log(error)   
    }

    


}

async calculateWithCoupon(
    items: Array<{ productId: string; quantity: number }>,
    couponCode: string
  ) {
   try {
   

    const coupon = await this.prisma.coupon.findUnique({
        where: { code: couponCode }
      });

      if(!coupon){
        return {success:false, messsage:"No coupen available with this code"}
      }
    // Get current product prices
    const products = await this.prisma.product.findMany({
      where: { id: { in: items.map(item => item.productId) } }
    });
  
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      return sum + (product.price * item.quantity);
    }, 0);
  


   
    let discountAmount = 0;
    let totalAmount = subtotal;
    let valid = true;
   
  
    


        // Validate coupon
        const now = new Date();
        if (!coupon.isActive) {
          valid = false;
          this.errorMessage("Coupon is not active", totalAmount)
     
         
        }
        if (coupon.expiresAt < now) {
          valid = false;
          this.errorMessage("Coupon has expired", totalAmount)
          
          
          
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          valid = false;
          this.errorMessage("Coupon usage limit reached", totalAmount)
        
          
      
        }
        if (coupon.minOrder && subtotal < coupon.minOrder) {
          valid = false;
          this.errorMessage(`Minimum order amount of ${coupon.minOrder} required`, totalAmount)
       
         
        }
  
        if (valid) {
          // Calculate discount
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = subtotal * (coupon.discountValue / 100);
          } else { // 'FIXED'
            discountAmount = coupon.discountValue;
          }
  
          // Ensure discount doesn't make total negative
          discountAmount = Math.min(discountAmount, subtotal);
          totalAmount = subtotal - discountAmount;
        }
      
    
  
    return {
   
        data:{
            valid,
            subtotal,
            discountAmount,
            totalAmount,
            coupon: {
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue
        }
     
      
        }
    };
   } catch (error) {
    console.log(error)
    throw error
   }
    
  }

}
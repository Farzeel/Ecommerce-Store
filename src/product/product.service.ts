import { extractPublicId } from './../utils/checkFileType';
import { CreateProductDto } from './dto/create-product.dto.ts';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';





@Injectable()
export class ProductService {

    constructor(private prisma: PrismaService) {}

    private async deleteImage(publicId: string) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err:any) {
        console.error('Failed to delete image:', err.message);
      }
    }

   
      

    create(dto: CreateProductDto & { imageUrl: string, imagePublicId:string }) {
        try {
            console.log("creation")
            
            return this.prisma.product.create({ data: dto });
        } catch (error) {
            console.log(error)
        }
    }
  
    findAll() {
      return this.prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    }
  
    async findOne(id: string) {
      try {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');
        return product;
      } catch (error) {
        console.log(error)
      }

    }
  
    async update(id: string, dto: UpdateProductDto & { imageUrl?: string, imagePublicId?:string }) {
      try {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');
       console.log("running")
        if (dto.imageUrl && product.imagePublicId) {
          await this.deleteImage(product.imagePublicId);
        } else if (!dto.imageUrl) {
       
          dto.imageUrl = product.imageUrl;
          dto.imagePublicId = product.imagePublicId;
        }
      
      console.log("update",dto)
        return this.prisma.product.update({ where: { id }, data: dto });
      } catch (error) {
        console.log(error)
      }
     
    }
  
    async remove(id: string):Promise<{success: boolean, message?: string}> {
      try {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)   return { success: false, message: 'product with this id not found' };;
        if(product.imagePublicId){
  
          await this.deleteImage(product.imagePublicId)
        }
         this.prisma.product.delete({ where: { id } });
         return { success: true, message: 'Product deleted successfully' };
      } catch (error) {
        console.error('Delete error:', error);
        return { success: false, message: 'Failed to delete product' };
      }
     
    }
}

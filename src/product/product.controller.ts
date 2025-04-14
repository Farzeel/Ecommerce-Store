import { extractPublicId } from './../utils/checkFileType';

import { storage } from '../cloudinary/cloudinary.storage';
import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, NotFoundException, Param, ParseFilePipe, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.ts';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductService } from './product.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from 'src/utils/checkFileType';
import path from 'path';
import { AdminOnly } from 'src/auth/roles.decorator';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}
    // Add this near your storage configuration


  // Public route
  @Get("allProducts")
  findAll() {
    return this.productService.findAll();
  }

  @Get('singleProduct/:id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  // Admin routes
  @Post("create")
  @AdminOnly()
  @UseInterceptors(FileInterceptor('image', { storage,fileFilter:imageFileFilter }))
  create(@UploadedFile(
  ) file: Express.Multer.File,@Body() dto: CreateProductDto) {
    console.log("imageUrl")
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
   

    const imageUrl = file?.path;

    const imagePublicId = extractPublicId(imageUrl);
    return this.productService.create({ ...dto, imageUrl,imagePublicId });
  }

  @Patch('update/:id')
  @AdminOnly()
  @UseInterceptors(FileInterceptor('image', { storage, fileFilter: imageFileFilter }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    let updateData: UpdateProductDto & { imageUrl?: string, imagePublicId?: string } = { ...dto };
    if (file) {
      const imageUrl = file.path;
      const imagePublicId = extractPublicId(imageUrl);
      updateData = { ...updateData, imageUrl, imagePublicId };
    }
     this.productService.update(id, updateData);
     return {message:"updated", updateData}
  }

  @Delete('delete/:id')
  @AdminOnly()
  async remove(@Param('id') id: string) {
    const result = await this.productService.remove(id);
  
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
  
    return {
      statusCode: 200,
      message: result.message
    };
  }
}

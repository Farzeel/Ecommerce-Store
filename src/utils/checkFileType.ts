import { BadRequestException } from "@nestjs/common";


export const imageFileFilter = (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new BadRequestException('Only image files (jpeg, png, jpg, webp) are allowed'), false);
    }
  };
  export const extractPublicId = (imageUrl: string)=>  {
   
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1]; // uuid.jpg
      return `ecommerce-products/${filename.split('.')[0]}`;
     

  }
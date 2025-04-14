import { cloudinary } from './cloudinary.provider';

import { CloudinaryStorage } from 'multer-storage-cloudinary';

export const storage = new CloudinaryStorage({
 cloudinary,
 params:  async (req, file) => ({
    folder: 'ecommerce-products',
    allowed_formats: ['jpg', 'png', 'jpeg',"webp"],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  }),
});

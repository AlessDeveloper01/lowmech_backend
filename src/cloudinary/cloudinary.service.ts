import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadBase64(base64: string, folder: string, publicId?: string): Promise<string> {
    const uploadOptions: any = {
      folder: `lowmech/${folder}`,
      overwrite: true,
    };
    if (publicId) uploadOptions.public_id = publicId;

    const result = await cloudinary.uploader.upload(base64, uploadOptions);
    return result.secure_url;
  }

  async deleteImage(url: string): Promise<void> {
    try {
      const publicId = this.extractPublicId(url);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    } catch {
      // ignore
    }
  }

  private extractPublicId(url: string): string | null {
    const match = url.match(/\/upload\/v\d+\/(.+)\./);
    return match ? match[1] : null;
  }
}

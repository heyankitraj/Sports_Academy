import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "test",
  api_key: process.env.CLOUDINARY_API_KEY || "test",
  api_secret: process.env.CLOUDINARY_API_SECRET || "test",
});

export function uploadToCloudinary(
  fileBuffer: Buffer,
  folder = "sports-academy",
): Promise<{ secure_url: string; format: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result as { secure_url: string; format: string });
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
}

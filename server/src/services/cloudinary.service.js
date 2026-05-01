import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'test',
  api_key: process.env.CLOUDINARY_API_KEY || 'test',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'test',
});

export const uploadToCloudinary = (fileBuffer, folder = "sports-academy") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // automatically detect image/pdf
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

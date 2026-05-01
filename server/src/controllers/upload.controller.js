import { uploadToCloudinary } from "../services/cloudinary.service.js";
import sharp from "sharp";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { mimetype, size } = req.file;
    let fileBuffer = req.file.buffer;

    // Define limits
    const maxPdfSize = 2 * 1024 * 1024; // 2MB
    const maxImageSize = 1 * 1024 * 1024; //  1MB

    if (mimetype === "application/pdf") {
      // For PDF, exact size check
      if (size > maxPdfSize) {
        return res.status(400).json({ error: "PDF size must not exceed 2MB." });
      }
    } else if (mimetype.startsWith("image/")) {
      // For Images, resize and auto-compress using sharp
      fileBuffer = await sharp(req.file.buffer)
        .resize({ width: 1024, withoutEnlargement: true }) // resize to a sensible width to avoid massive uncompressed files
        .jpeg({ quality: 80, force: false })
        .png({ quality: 80, force: false })
        .webp({ quality: 80, force: false })
        .toBuffer();

      // Check final compressed size
      if (fileBuffer.length > maxImageSize) {
        return res.status(400).json({ error: "Image could not be compressed under 1MB limit. Please upload a smaller image." });
      }
    } else {
      return res.status(400).json({ error: "Unsupported file type." });
    }

    // Upload to cloudinary
    const cloudinaryResponse = await uploadToCloudinary(fileBuffer, "documents");

    res.status(200).json({
      message: "File uploaded successfully",
      url: cloudinaryResponse.secure_url,
      format: cloudinaryResponse.format,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
};

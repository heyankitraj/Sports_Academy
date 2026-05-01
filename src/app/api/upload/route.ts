import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const { type: mimetype, size } = file;
    let fileBuffer: Buffer = Buffer.from(new Uint8Array(await file.arrayBuffer()));

    const maxPdfSize = 10 * 1024 * 1024; // 10 MB
    const maxImageSize = 5 * 1024 * 1024; // 5 MB after compression

    if (mimetype === "application/pdf") {
      if (size > maxPdfSize) {
        return NextResponse.json(
          { error: "PDF size must not exceed 10MB." },
          { status: 400 },
        );
      }
    } else if (mimetype.startsWith("image/")) {
      fileBuffer = await sharp(fileBuffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .jpeg({ quality: 80, force: false })
        .png({ quality: 80, force: false })
        .webp({ quality: 80, force: false })
        .toBuffer();

      if (fileBuffer.length > maxImageSize) {
        return NextResponse.json(
          {
            error:
              "Image could not be compressed under 1MB. Please upload a smaller image.",
          },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 400 },
      );
    }

    const result = await uploadToCloudinary(fileBuffer, "documents");

    return NextResponse.json({
      message: "File uploaded successfully",
      url: result.secure_url,
      format: result.format,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "File upload failed" },
      { status: 500 },
    );
  }
}

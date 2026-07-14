import { v2 as cloudinary } from "cloudinary";

// The cloudinary SDK auto-configures itself from the CLOUDINARY_URL env var
// (format: cloudinary://<api_key>:<api_secret>@<cloud_name>, from the
// Cloudinary dashboard). Until it's set, isCloudinaryConfigured() is false
// and the upload endpoint answers 503 { configured: false } — the loan form
// then simply skips document upload instead of failing the application.

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_URL);
}

// Uploads a file buffer (from multer memory storage). `resource_type: "auto"`
// lets Cloudinary accept PDFs as well as images.
export function uploadDocument(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "dhansetu/documents",
        resource_type: "auto",
        filename_override: filename,
        use_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

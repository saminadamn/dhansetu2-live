import { v2 as cloudinary } from "cloudinary";

// The cloudinary SDK auto-configures itself from the CLOUDINARY_URL env var
// (format: cloudinary://<api_key>:<api_secret>@<cloud_name>, from the
// Cloudinary dashboard). Until it's set, isCloudinaryConfigured() is false
// and the upload endpoint answers 503 { configured: false } — the loan form
// then simply skips document upload instead of failing the application.

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_URL);
}

// Uploads an authenticated, non-public asset. It is retrieved only through
// our authorized document endpoint; no provider URL is returned to clients.
export function uploadDocument(buffer, filename, mimeType) {
  const resourceType = mimeType === "application/pdf" ? "raw" : "image";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "dhansetu/documents",
        resource_type: resourceType,
        type: "authenticated",
        filename_override: filename,
        use_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ publicId: result.public_id, resourceType: result.resource_type });
      }
    );
    stream.end(buffer);
  });
}

// This signed delivery URL is used only by the backend document proxy.
export function getPrivateDocumentUrl({ publicId, resourceType }) {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    secure: true,
    sign_url: true,
  });
}

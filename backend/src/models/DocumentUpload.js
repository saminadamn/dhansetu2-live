import mongoose from "mongoose";

// An opaque, server-side record of each private Cloudinary upload. The client
// can submit only this ID; it cannot choose a provider URL or public ID.
const documentUploadSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "LoanApplication", default: null, index: true },
    label: { type: String, required: true, maxlength: 100 },
    originalName: { type: String, required: true, maxlength: 255 },
    mimeType: { type: String, required: true },
    resourceType: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("DocumentUpload", documentUploadSchema);

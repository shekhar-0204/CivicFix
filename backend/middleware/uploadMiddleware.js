import multer from "multer";

import ApiError from "../utils/ApiError.js";

// Final size accepted by the API. The React app resizes/compresses photos to
// roughly 1-2 MB before uploading, so this is a safety ceiling, not the target.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Files are kept in memory and sent to cloudinary; nothing touches disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(ApiError.badRequest("Upload a JPG, PNG or WebP image."));
    }
    cb(null, true);
  },
});

// The mimetype header is client-controlled, so also check the real file signature.
const looksLikeImage = (buffer) => {
  const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isWebp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return isPng || isJpeg || isWebp;
};

// Optional single file in the "photo" field.
export const uploadComplaintPhoto = [
  upload.single("photo"),
  (req, _res, next) => {
    if (req.file && req.file.size > MAX_IMAGE_BYTES) {
      return next(ApiError.badRequest("Image size must be less than 5MB."));
    }
    if (req.file && !looksLikeImage(req.file.buffer)) {
      return next(ApiError.badRequest("The uploaded file is not a valid JPG, PNG or WebP image."));
    }
    next();
  },
];

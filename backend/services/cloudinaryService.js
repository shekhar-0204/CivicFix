import { randomUUID } from "node:crypto";

import { v2 as cloudinary } from "cloudinary";
import ApiError from "../utils/ApiError.js";

const UPLOAD_TIMEOUT_MS = 30000;

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );

const getClient = () => {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      503,
      "Photo uploads are not available right now. Please try again later."
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });

  return cloudinary;
};

const withTimeout = (promise, ms) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Cloudinary upload timed out.")),
      ms
    );

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

const safeBaseName = (name = "photo") =>
  String(name)
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 40) || "photo";

// Readable prefix + random UUID: two uploads with the same filename never collide.
const uniquePublicId = (originalName) => `${safeBaseName(originalName)}-${randomUUID()}`;

export const uploadImage = async (buffer, originalName) => {
  const client = getClient();

  try {
    const result = await withTimeout(
      new Promise((resolve, reject) => {
        const uploadStream = client.uploader.upload_stream(
          {
            folder: process.env.CLOUDINARY_FOLDER || "civicfix/complaints",
            public_id: uniquePublicId(originalName),
            overwrite: false,
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result);
          }
        );

        uploadStream.end(buffer);
      }),
      UPLOAD_TIMEOUT_MS
    );

    if (!result?.secure_url || !result?.public_id) {
      throw new Error("Cloudinary returned an unexpected response.");
    }

    return {
      url: result.secure_url,
      fileId: result.public_id,
    };
  } catch (error) {
    console.error(
      "Cloudinary upload failed:",
      error?.message || error
    );

    throw new ApiError(
      502,
      "Photo upload failed. Please try again."
    );
  }
};

export const deleteImage = async (fileId) => {
  if (!fileId || !isCloudinaryConfigured()) return;

  try {
    const client = getClient();

    await client.uploader.destroy(fileId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error(
      "Cloudinary delete failed:",
      error?.message || error
    );
  }
};

export { isCloudinaryConfigured };
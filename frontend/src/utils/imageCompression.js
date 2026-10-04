// Resizes and compresses a photo in the browser BEFORE it is uploaded, so a
// 5-6 MB phone photo becomes roughly 1 MB. The result is a normal File (never base64).

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Largest original we are willing to open in the browser. It only needs to fit in memory;
// the file that is actually uploaded is the optimized one.
export const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

// Matches the API's ceiling for the final file.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Above this size the user is told the image will be optimized.
export const LARGE_IMAGE_BYTES = 2 * 1024 * 1024;

const MAX_DIMENSION = 1600; // px, longest side
const TARGET_BYTES = 1.5 * 1024 * 1024; // aim for 1-2 MB
const MIN_QUALITY = 0.5;
const MIN_DIMENSION = 800;

export const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const fileTypeLabel = (file) =>
  ({ "image/jpeg": "JPG", "image/png": "PNG", "image/webp": "WebP" })[file.type] || "Image";

const unreadable = () => new Error("This image could not be read. Try a different photo.");

// createImageBitmap applies the EXIF rotation, so phone photos are not turned sideways.
const decode = async (file) => {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close?.() };
    } catch {
      // fall through to <img>
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(unreadable());
      element.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
};

const toBlob = (canvas, quality) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(unreadable())), "image/jpeg", quality)
  );

const render = (decoded, scale) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(decoded.width * scale));
  canvas.height = Math.max(1, Math.round(decoded.height * scale));

  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff"; // JPEG has no transparency
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);

  return canvas;
};

// Resolves to { file, originalSize, optimizedSize, durationMs, optimized }.
// Small images that are already within limits are returned untouched.
export async function optimizeImage(file) {
  const started = performance.now();
  const decoded = await decode(file);

  try {
    let scale = Math.min(1, MAX_DIMENSION / Math.max(decoded.width, decoded.height));

    if (scale === 1 && file.size <= TARGET_BYTES) {
      return finish(file, file, started, false);
    }

    let blob = null;

    // Lower the quality first; if that is not enough, shrink the picture a little more.
    for (;;) {
      const canvas = render(decoded, scale);
      let quality = 0.85;
      blob = await toBlob(canvas, quality);

      while (blob.size > TARGET_BYTES && quality > MIN_QUALITY) {
        quality = Math.max(MIN_QUALITY, quality - 0.1);
        blob = await toBlob(canvas, quality);
      }

      const longest = Math.max(canvas.width, canvas.height);
      if (blob.size <= TARGET_BYTES || longest * 0.8 < MIN_DIMENSION) break;
      scale *= 0.8;
    }

    // Never make things worse: keep the original if it is already smaller and within limits.
    if (blob.size >= file.size && file.size <= MAX_UPLOAD_BYTES) {
      return finish(file, file, started, false);
    }

    if (blob.size > MAX_UPLOAD_BYTES) {
      throw new Error("This image is too large to upload even after optimizing. Choose a smaller photo.");
    }

    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    const optimized = new File([blob], `${name}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
    return finish(file, optimized, started, true);
  } finally {
    decoded.release();
  }
}

function finish(original, result, started, optimized) {
  const durationMs = performance.now() - started;

  if (import.meta.env.DEV) {
    console.info(
      [
        `Original image: ${formatBytes(original.size)}`,
        `Compressed image: ${formatBytes(result.size)}${optimized ? "" : " (unchanged)"}`,
        `Compression time: ${(durationMs / 1000).toFixed(2)} sec`,
      ].join("\n")
    );
  }

  return { file: result, originalSize: original.size, optimizedSize: result.size, durationMs, optimized };
}

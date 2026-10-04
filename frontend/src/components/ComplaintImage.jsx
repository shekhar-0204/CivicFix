import { useState } from "react";
import { ImageOff } from "lucide-react";

// Shows the complaint photo, or a neutral placeholder if it is
// missing or fails to load.
function ComplaintImage({ src, alt, className = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div className={`photo-placeholder ${className}`} role="img" aria-label="No photo">
        <ImageOff size={22} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailedSrc(src)}
    />
  );
}

export default ComplaintImage;

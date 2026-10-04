import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Camera, CheckCircle2, ImagePlus, Info, MapPin, Send, Trash2 } from "lucide-react";

import AppLayout from "../components/AppLayout";
import { CATEGORIES, CATEGORY_NAMES } from "../data/categories";
import { createComplaint } from "../services/complaintService";
import {
  ACCEPTED_IMAGE_TYPES,
  fileTypeLabel,
  formatBytes,
  LARGE_IMAGE_BYTES,
  MAX_SOURCE_BYTES,
  optimizeImage,
} from "../utils/imageCompression";

// One id per form submission. If a request is retried (double click, timeout) the server
// recognises the id and returns the same complaint instead of creating another.
const newRequestId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function ReportIssue() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialCategory = searchParams.get("category");

  const [formData, setFormData] = useState({
    category: CATEGORY_NAMES.includes(initialCategory) ? initialCategory : "",
    description: "",
    location: "",
  });

  // image: { file, previewUrl, status: "optimizing" | "ready" | "error", result?, error? }
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ message: "", percent: null, done: false });

  const submittingRef = useRef(false); // blocks double clicks synchronously
  const requestIdRef = useRef(newRequestId());
  const optimizationRef = useRef(null); // promise for the image currently selected
  const selectionRef = useRef(0); // ignores results for an image that was replaced/removed
  const fileInputRef = useRef(null);

  // Release the preview URL when it changes or the page unmounts.
  const previewRef = useRef(null);
  useEffect(() => {
    previewRef.current = image?.previewUrl ?? null;
  }, [image]);
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    event.target.value = ""; // lets the same file be picked again

    if (!file || submittingRef.current) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((previous) => ({ ...previous, photo: "Upload a JPG, PNG or WebP image." }));
      return;
    }

    if (file.size > MAX_SOURCE_BYTES) {
      setErrors((previous) => ({
        ...previous,
        photo: `This photo is too large (${formatBytes(file.size)}). Choose one under ${formatBytes(MAX_SOURCE_BYTES)}.`,
      }));
      return;
    }

    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);

    // 1. Show the preview right away.
    const selectionId = ++selectionRef.current;
    setImage({ file, previewUrl: URL.createObjectURL(file), status: "optimizing" });
    setErrors((previous) => ({ ...previous, photo: "" }));

    // 2. Resize/compress once, in the background. Submit waits for this same promise,
    //    so the photo is processed once and uploaded once.
    const optimization = optimizeImage(file);
    optimizationRef.current = optimization;

    optimization.then(
      (result) => {
        if (selectionId !== selectionRef.current) return;
        setImage((current) => (current ? { ...current, status: "ready", result } : current));
      },
      (error) => {
        if (selectionId !== selectionRef.current) return;
        setImage((current) => (current ? { ...current, status: "error", error: error.message } : current));
      }
    );
  };

  const removeImage = () => {
    if (submittingRef.current) return;

    selectionRef.current += 1;
    optimizationRef.current = null;
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
    setErrors((previous) => ({ ...previous, photo: "" }));
  };

  const validate = () => {
    const next = {};

    if (!formData.category) next.category = "Select an issue category.";

    if (!formData.description.trim()) next.description = "Describe the problem.";
    else if (formData.description.trim().length < 10)
      next.description = "Add a little more detail (at least 10 characters).";

    if (!formData.location.trim()) next.location = "Enter the location of the issue.";

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // A second click while the first submit is running does nothing.
    if (submittingRef.current) return;

    setSubmitError("");

    const validation = validate();
    if (image?.status === "error") validation.photo = image.error;
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    submittingRef.current = true;
    setLoading(true);
    setProgress({ message: "", percent: null, done: false });

    try {
      let photo = null;

      if (image) {
        // Usually finished long ago; only waits if the photo is still being optimized.
        if (image.status === "optimizing") {
          setProgress({ message: "Optimizing photo…", percent: null, done: false });
        }
        photo = (await optimizationRef.current).file;
      }

      setProgress({
        message: photo ? "Uploading photo…" : "Saving complaint…",
        percent: photo ? 0 : null,
        done: false,
      });

      const complaint = await createComplaint({
        ...formData,
        image: photo,
        requestId: requestIdRef.current,
        onUploadProgress: (event) => {
          if (!photo || !event.total) return;
          const percent = Math.round((event.loaded / event.total) * 100);
          // Once the browser has sent every byte, the server is uploading to ImageKit and saving.
          setProgress(
            percent >= 100
              ? { message: "Saving complaint…", percent: null, done: false }
              : { message: "Uploading photo…", percent, done: false }
          );
        },
      });

      setProgress({ message: "Complaint submitted successfully.", percent: null, done: true });
      requestIdRef.current = newRequestId();

      // Brief pause so the success message is actually seen.
      await new Promise((resolve) => setTimeout(resolve, 700));
      navigate(`/complaints/${complaint.id}`, { state: { created: true } });
    } catch (error) {
      // Keep everything the person typed; just stop loading and explain what happened.
      if (error.fieldErrors) setErrors((previous) => ({ ...previous, ...error.fieldErrors }));
      setSubmitError(error.message);
      setProgress({ message: "", percent: null, done: false });
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <AppLayout
      title="Report an issue"
      description="Tell us about the civic problem you found. A photo and exact location help the team find it."
    >
      <form className="report-form" onSubmit={handleSubmit} noValidate>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Issue photo</h2>
              <p>Optional. JPG, PNG or WebP. Large photos are optimized before upload.</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={loading}
            hidden
          />

          {!image ? (
            <button
              type="button"
              className="upload-box"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <div className="upload-icon">
                <Camera size={24} />
              </div>

              <strong>Upload a photo</strong>
              <span>Click to choose an image</span>
            </button>
          ) : (
            <div className="image-selected">
              <div className="image-preview">
                <img src={image.previewUrl} alt="Issue preview" />
              </div>

              <div className="image-meta">
                <strong className="image-name" title={image.file.name}>
                  {image.file.name}
                </strong>
                <span>
                  {formatBytes(image.file.size)} · {fileTypeLabel(image.file)}
                </span>

                {image.file.size > LARGE_IMAGE_BYTES && (
                  <p className="image-note">
                    <Info size={15} />
                    Image is large. It will be optimized before upload.
                  </p>
                )}

                {image.status === "optimizing" && (
                  <p className="image-note">
                    <span className="btn-spinner dark" aria-hidden="true" />
                    Optimizing photo…
                  </p>
                )}

                {image.status === "ready" && image.result.optimized && (
                  <p className="image-note ok">
                    <CheckCircle2 size={15} />
                    Optimized to {formatBytes(image.result.optimizedSize)} (was{" "}
                    {formatBytes(image.result.originalSize)}).
                  </p>
                )}

                {image.status === "error" && <p className="field-error">{image.error}</p>}
              </div>

              <div className="image-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <ImagePlus size={16} />
                  Change Image
                </button>
                <button type="button" className="secondary-button danger" onClick={removeImage} disabled={loading}>
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          )}

          {errors.photo && <p className="field-error">{errors.photo}</p>}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Issue details</h2>
              <p>Provide some details about the problem.</p>
            </div>
          </div>

          <div className="field">
            <label htmlFor="category">Issue category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              aria-invalid={Boolean(errors.category)}
            >
              <option value="">Select an issue category</option>
              {CATEGORIES.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="field-error">{errors.category}</p>}
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              placeholder="Describe the problem and where it is happening…"
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>

          <div className="field">
            <label htmlFor="location">Location</label>
            <div className="location-input">
              <MapPin size={18} />
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
                placeholder="Area, street or landmark"
                aria-invalid={Boolean(errors.location)}
              />
            </div>
            {errors.location && <p className="field-error">{errors.location}</p>}
          </div>
        </section>

        {loading && progress.message && (
          <div className={progress.done ? "submit-status done" : "submit-status"} role="status" aria-live="polite">
            {progress.done ? <CheckCircle2 size={18} /> : <span className="btn-spinner dark" aria-hidden="true" />}
            <div>
              <strong>{progress.message}</strong>
              {progress.percent !== null && (
                <div className="progress-track" aria-hidden="true">
                  <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
                </div>
              )}
            </div>
          </div>
        )}

        {submitError && (
          <div className="auth-error" role="alert">
            {submitError}
          </div>
        )}

        <div className="form-actions">
          <Link
            to="/dashboard"
            className="secondary-button"
            aria-disabled={loading}
            onClick={(event) => loading && event.preventDefault()}
          >
            Cancel
          </Link>

          <button type="submit" className="primary-button" disabled={loading} aria-busy={loading}>
            {loading ? <span className="btn-spinner" aria-hidden="true" /> : <Send size={17} />}
            {loading ? progress.message || "Submitting…" : "Submit Complaint"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}

export default ReportIssue;

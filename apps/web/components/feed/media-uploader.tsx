"use client";

import { useRef, useState } from "react";

interface MediaUploaderProps {
  onUpload: (path: string, previewUrl: string) => void;
  onClear: () => void;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4";

export function MediaUploader({ onUpload, onClear }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file: File) => {
    setError(null);
    setProgress(0);

    // Client-side size check (server also validates)
    const maxBytes = file.type === "video/mp4" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      const maxMB = maxBytes / (1024 * 1024);
      setError(`File must be under ${maxMB}MB.`);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 85));
      }, 150);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: form,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = (await res.json()) as {
        success?: boolean;
        data?: { path: string; signedUrl: string | null };
        error?: { message: string };
      };

      if (!res.ok || !data.success) {
        setError(data.error?.message ?? "Upload failed.");
        setPreview(null);
        return;
      }

      onUpload(data.data!.path, data.data!.signedUrl ?? localPreview);
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  };

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
        {preview.includes("video") ? (
          <video src={preview} className="w-full max-h-64 object-cover" controls={false} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Upload preview" className="w-full max-h-64 object-cover" />
        )}
        {uploading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
            <div
              className="h-full transition-all duration-150"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #FFD600, #FF6B00)" }}
            />
          </div>
        )}
        {!uploading && (
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "rgba(0,0,0,0.6)" }}
            aria-label="Remove media"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-full py-3 rounded-2xl text-sm text-white/40 transition-colors hover:text-white/60 flex items-center justify-center gap-2"
        style={{
          border: "1px dashed rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <span>📎</span>
        <span>Add photo or video</span>
      </button>
      {error && (
        <p className="mt-2 text-red-400 text-xs">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

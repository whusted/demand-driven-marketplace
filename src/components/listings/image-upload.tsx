"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages: number;
}

export function ImageUpload({ value, onChange, maxImages }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null);
      const remaining = maxImages - value.length;
      if (remaining <= 0) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remaining);

      for (const file of filesToUpload) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
          setError(`Invalid file type: ${file.type}. Use JPEG, PNG, or WebP.`);
          return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
          setError("File too large. Maximum 10MB per image.");
          return;
        }
      }

      setUploading(true);
      try {
        const newUrls: string[] = [];
        for (const file of filesToUpload) {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              size: file.size,
            }),
          });

          if (!res.ok) throw new Error("Upload failed");
          const { data } = await res.json();

          // Upload directly to storage
          await fetch(data.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          newUrls.push(data.publicUrl);
        }
        onChange([...value, ...newUrls]);
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, maxImages],
  );

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
            <img src={url} alt="" className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 bg-background/80 rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-destructive hover:text-white"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      {value.length < maxImages && (
        <label className="block">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={uploading}
          />
          <span className="inline-flex h-7 cursor-pointer items-center rounded-md border px-2.5 text-sm hover:bg-muted">
            {uploading ? "Uploading..." : `Add images (${value.length}/${maxImages})`}
          </span>
        </label>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

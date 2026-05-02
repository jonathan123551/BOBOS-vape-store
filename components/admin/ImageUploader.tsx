"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUploader({ value, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }
      onChange(data.url);
      toast.success("Uploaded");
    } catch {
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 rounded-lg border border-[rgb(var(--border))] overflow-hidden grid place-items-center bg-black/30">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs opacity-60">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="btn-ghost text-xs"
          >
            {uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-rose-400 hover:text-rose-300"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        type="url"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder="…or paste an image URL"
        className="input text-sm"
      />
    </div>
  );
}

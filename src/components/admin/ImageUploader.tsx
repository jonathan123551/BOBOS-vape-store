import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { uploadProductImage } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";

export function ImageUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const { publicUrl } = await uploadProductImage(file);
      onChange(publicUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
      <div className="w-full sm:w-32 aspect-square rounded-xl border border-dashed border-[rgb(var(--border))] grid place-items-center bg-black/30 overflow-hidden">
        {value ? (
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl opacity-60">💨</span>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={uploading || !isSupabaseConfigured}
            onClick={() => inputRef.current?.click()}
            className="btn-primary h-9 px-3 text-xs"
          >
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="btn-ghost h-9 px-3 text-xs"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs opacity-60">
          {isSupabaseConfigured
            ? "JPEG, PNG, WEBP, or GIF — max 5 MB. Stored in Supabase Storage (public)."
            : "Image upload requires a configured Supabase project."}
        </p>
        <label className="block">
          <span className="text-xs opacity-70 block">Or paste image URL</span>
          <input
            type="url"
            placeholder="https://…"
            className="input mt-1 text-xs"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
          />
        </label>
      </div>
    </div>
  );
}

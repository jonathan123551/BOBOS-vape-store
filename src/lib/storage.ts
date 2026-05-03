import { isSupabaseConfigured, supabase } from "./supabase";

export const PRODUCT_IMAGES_BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadResult {
  publicUrl: string;
  path: string;
}

/**
 * Upload a product image to the Supabase Storage `product-images` bucket and
 * return its public URL. Throws on validation errors so the form can show
 * `error.message` directly.
 */
export async function uploadProductImage(file: File): Promise<UploadResult> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Demo mode — connect Supabase to enable image uploads.");
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WEBP, or GIF images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });
  if (error) throw new Error(error.message || "Upload failed.");
  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

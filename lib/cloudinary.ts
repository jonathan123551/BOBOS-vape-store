// Optional Cloudinary uploader using their unsigned upload preset endpoint.
// Falls back gracefully when CLOUDINARY_* env vars are not configured.
export async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) return null;

  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)]);
  form.append("file", blob, filename);
  form.append("upload_preset", preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { secure_url?: string };
  return data.secure_url ?? null;
}

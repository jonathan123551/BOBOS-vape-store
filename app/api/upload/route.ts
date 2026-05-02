import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getAdminFromCookies } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(req: NextRequest) {
  if (!getAdminFromCookies()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
  }
  if (file.type && !ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const originalName = (file as File).name || "image";
  const safeBase = originalName.replace(/[^a-z0-9._-]/gi, "_").slice(-50);
  const filename = `${crypto.randomBytes(8).toString("hex")}-${safeBase}`;

  const cloudUrl = await uploadToCloudinary(buffer, filename);
  if (cloudUrl) {
    return NextResponse.json({ url: cloudUrl, provider: "cloudinary" });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const dest = path.join(dir, filename);
  await writeFile(dest, buffer);
  return NextResponse.json({ url: `/uploads/${filename}`, provider: "local" });
}

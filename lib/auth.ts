import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "bobos_admin";

function getSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 8) {
    // Fallback (still functional in dev) but emit warning once.
    return "bobos-default-dev-secret-please-change";
  }
  return s;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createAdminToken(username: string): string {
  const issuedAt = Date.now().toString();
  const payload = `${username}.${issuedAt}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined): { username: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, issuedAt, sig] = parts;
  const payload = `${username}.${issuedAt}`;
  const expected = sign(payload);
  // constant-time compare
  if (sig.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) mismatch |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (mismatch !== 0) return null;
  // 7-day expiry
  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > 1000 * 60 * 60 * 24 * 7) return null;
  return { username };
}

export function getAdminFromCookies(): { username: string } | null {
  const c = cookies().get(COOKIE_NAME)?.value;
  return verifyAdminToken(c);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

export function checkAdminCredentials(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME || "admin";
  const p = process.env.ADMIN_PASSWORD || "bobos-admin-2026";
  return username === u && password === p;
}

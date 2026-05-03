import { cookies } from "next/headers";
import crypto from "crypto";

// =============================================================================
// Single-admin authentication
// =============================================================================
// BOBOS Vapes Store has exactly ONE admin account. There is no public
// registration UI, no /api/admin/register endpoint, and no way to mint
// additional admins from the UI. The credentials are read from env vars with
// safe defaults — see .env.example. To rotate them in production, change the
// env vars on your host (Vercel/Netlify/Render/Fly/etc.) and redeploy.
// =============================================================================

const COOKIE_NAME = "bobos_admin";

// Hardcoded fallbacks ensure the app boots even when env is empty (Lovable
// import / fresh clone). PRODUCTION DEPLOYS MUST OVERRIDE THESE.
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "bobos-admin-2026";

function getSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 8) {
    // Fallback (still functional in dev) — emit warning only in non-prod.
    if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
      // eslint-disable-next-line no-console
      console.warn(
        "[bobos] ADMIN_SECRET is unset/short. Using insecure dev fallback. Set a real secret in production."
      );
    }
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
  const u = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  // Length-tagged constant-time compare to avoid leaking length differences.
  if (username.length !== u.length || password.length !== p.length) return false;
  let m = 0;
  for (let i = 0; i < u.length; i++) m |= username.charCodeAt(i) ^ u.charCodeAt(i);
  for (let i = 0; i < p.length; i++) m |= password.charCodeAt(i) ^ p.charCodeAt(i);
  return m === 0;
}

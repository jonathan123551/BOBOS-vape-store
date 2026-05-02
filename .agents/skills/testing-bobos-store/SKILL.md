---
name: testing-bobos-store
description: End-to-end test the BOBOS Vapes Store storefront + admin panel against the seeded SQLite DB. Use whenever verifying changes to product / cart / checkout / admin flows or i18n / theme toggles.
---

# BOBOS Vapes Store — testing skill

## Boot the dev server

```bash
cd /path/to/BOBOS-vape-store
cp -n .env.example .env  # if .env doesn't exist yet
npm install
npm run setup            # prisma db push + seed (idempotent)
npm run dev              # serves on http://localhost:3000
```

If `prisma/dev.db` is missing or empty, re-run `npm run setup`. The `DATABASE_URL` MUST be `file:./dev.db` (relative to project root, where Prisma runs from). `file:./prisma/dev.db` is wrong — it produces a nested `prisma/prisma/dev.db`.

## Default credentials (dev only)

- Storefront: no login required
- Admin login at `/admin/login`
  - Username: `admin`
  - Password: `bobos-admin-2026`
- These come from `.env` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). The auth cookie is HMAC-signed with `ADMIN_SECRET` and expires after 7 days.

These are local-only dev credentials. For production deploys the user is expected to override them in their host env.

## Seeded data shape (`prisma/seed.ts`)

- 4 categories: Disposable Vapes, Pod Systems, E-Liquids, Accessories (slug = lowercase-kebab)
- 8 products, 2 per category, 3 of them featured (BOBOS Cloud 6000 Puffs, BOBOS Pod Pro Kit, Smoke Lab Strawberry 60ml)
- Stock per product is in the 12–80 range; pick a product with low stock when testing decrement (BOBOS Pod Pro Kit starts at 18, Neon Pod X at 12).

## Golden-path flows to exercise

1. **Storefront E2E** (no auth)
   - Home renders hero + 4 category cards + featured products.
   - Click a category card → URL becomes `/products?category=<slug>` and only matching products render.
   - Open a product detail → quantity stepper + add to cart → cart badge updates.
   - Reload `/cart` → contents survive (localStorage).
   - Checkout with name / phone / address → confirmation page with cuid order ID, cart cleared.
   - Re-open the product → stock decreased by ordered qty.
2. **Admin E2E**
   - `/admin` redirects to `/admin/login` without a cookie.
   - Log in → dashboard shows totals, revenue, charts (Recharts) populated by the order from step 1.
   - Orders list → expand a row, change status via select → toast “Status updated” → reload → status persisted (PATCH /api/orders/:id).
   - Products → create a test SKU (Save → toast “Product created”), then Delete it (toast “Deleted”).
3. **i18n + theme**
   - Click "AR" in the navbar — entire layout flips to RTL, hero text becomes Arabic (`اشحن مزاجك.`).
   - Click theme toggle (sun/moon) — background switches between dark and light; reload should preserve the choice.

## Pitfalls / things that can confuse a tester

- **Add-to-cart on product detail page accumulates** — pressing it twice on a product with qty=3 puts 6 in the cart. The cart's `−` buttons let you correct this. Don't double-click the button.
- The Arabic translation includes navigation labels too, so coordinates of buttons differ in RTL vs LTR. Always re-screenshot before clicking after a language toggle.
- Image upload defaults to local `/public/uploads`. Cloudinary is only used if `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` are both set. If neither is set, no warning is raised — just check where the file actually lands.
- `next dev` HMR can leave a stale Prisma client referenced after schema edits — restart the dev server after running `npm run setup`.
- The first request to a route compiles it (Next.js dev), so the first navigation can take a few seconds — this isn't a bug.
- No CI workflows exist on the repo, so PR checks won't gate merges. Don't wait on CI.

## Devin Secrets Needed

None for local dev. The `.env.example` provides safe defaults. Optional secrets (only if testing the Cloudinary upload path):

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_PRESET` (must be unsigned)

## Useful endpoints / paths

- `GET /` — storefront home
- `GET /products` (`?category=<slug>`, `?search=`, `?sort=newest|price-asc|price-desc`)
- `GET /products/<id>` — product detail
- `GET /cart`, `GET /checkout`, `GET /contact`
- `POST /api/orders` — public, creates order in a Prisma transaction (decrements stock atomically)
- `POST /api/admin/login`, `POST /api/admin/logout`
- `GET /api/admin/stats?from=<iso>&to=<iso>&granularity=daily|weekly|monthly` — protected by HMAC cookie
- `GET|POST /api/products`, `PATCH|DELETE /api/products/:id` — POST/PATCH/DELETE protected
- `GET|POST /api/categories`, `PATCH|DELETE /api/categories/:id` — same
- `POST /api/upload` — accepts multipart, returns image URL

## What's NOT covered by this skill

- Cloudinary upload (needs creds)
- Postgres swap (change `provider` in `schema.prisma` + `DATABASE_URL`)
- Mobile / responsive viewport regressions
- Multi-user / concurrent stock-race testing

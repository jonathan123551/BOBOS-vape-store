# BOBOS Vapes Store

A full-stack e-commerce store for **BOBOS Vapes Store** built as a single Next.js (App Router) application — frontend, API, and admin panel all in one deployment. Deploys to Vercel out of the box.

## Features

### Storefront
- Dark mode (default) and light mode with neon/glow accents
- English (LTR) and Arabic (RTL) — language toggle persists per user
- Browse products and shop by category
- Product detail page with flavor / nicotine info and stock availability
- Cart with quantity controls (persisted in localStorage)
- Checkout (no auth) — collects name, phone, address; creates an order and decrements stock
- Contact page with click-to-call and WhatsApp group buttons
- Toast notifications, loading states, and form validation

### Admin panel (`/admin`)
- Simple env-based credential login (HMAC signed cookie, 7-day expiry)
- **Dashboard**: total orders, revenue, status breakdown, sales line chart (daily / weekly / monthly), top products, top categories, custom date filtering
- **Orders**: list, filter by status, expand to view items, update status (pending → out for delivery → done / cancelled)
- **Products**: full CRUD with bilingual name/description, price, stock, image, optional flavor and nicotine fields, category, featured flag
- **Categories**: full CRUD with bilingual names, auto-generated slugs, image
- **Image upload**: local (`/public/uploads`) by default, with optional Cloudinary fallback via env vars

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) — fullstack framework, API routes
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) — branded design system
- [Prisma ORM](https://www.prisma.io/) with PostgreSQL
- [Recharts](https://recharts.org/) — admin dashboard charts
- [Zod](https://zod.dev/) — request validation
- [react-hot-toast](https://react-hot-toast.com/) — toasts

## Quick start (local)

You need a Postgres database. The fastest free option is [Neon](https://neon.tech) (~30 seconds, free tier). Once you have a connection string:

```bash
# 1. Install
npm install

# 2. Copy env, then paste your Postgres URL into DATABASE_URL
cp .env.example .env

# 3. Push schema + seed demo data
npm run setup

# 4. Run
npm run dev
```

Open http://localhost:3000 — the storefront. Open http://localhost:3000/admin/login for the admin panel (default credentials are in `.env.example`).

## Deploying on Vercel

1. **Create a Postgres database** (free tier on either):
   - **Neon** — https://neon.tech → create project → copy the **pooled** connection string from the dashboard. Looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`.
   - **Supabase** — https://supabase.com/dashboard → New project → Settings → Database → "Connection string" → URI mode.
2. **Push the schema and seed it once** from your local machine, pointing at the new database:
   ```bash
   DATABASE_URL="<your-postgres-url>" npm run setup
   ```
3. **Import the GitHub repo into Vercel** at https://vercel.com/new. Vercel auto-detects Next.js — keep the defaults.
4. **Add env vars** in the Vercel project (Settings → Environment Variables) for Production, Preview, and Development:
   - `DATABASE_URL` — the Postgres URL from step 1
   - `ADMIN_USERNAME` — your admin username
   - `ADMIN_PASSWORD` — a strong admin password
   - `ADMIN_SECRET` — `openssl rand -hex 32` output (long random string)
   - `NEXT_PUBLIC_SITE_URL` — `https://<your-domain>` (set after the domain is connected, otherwise the Vercel preview URL)
   - `NEXT_PUBLIC_STORE_PHONE` — `01287566246`
   - `NEXT_PUBLIC_WHATSAPP_LINK` — `https://chat.whatsapp.com/Es1cmi0a7Mp8Qz4PtyiDgF?mode=hqctcli`
   - **Cloudinary (required on Vercel for image upload)** — `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET` (an unsigned upload preset).
5. Click **Deploy**. First build takes ~2 minutes. The default domain is `<project-name>.vercel.app`.

### Connecting a custom domain

1. In the Vercel project → **Settings** → **Domains** → **Add** → enter your domain (e.g. `bobos.example.com` or `example.com`).
2. Vercel shows the DNS records to add. At your domain registrar, configure either:
   - **Apex** (`example.com`): `A` record → `76.76.21.21`
   - **Subdomain** (`bobos.example.com`): `CNAME` → `cname.vercel-dns.com`
3. Wait for DNS propagation (1–30 minutes). Vercel auto-issues an SSL cert.
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to the final HTTPS URL and redeploy.

### Image upload on Vercel

Vercel's filesystem is read-only at runtime, so the local `/public/uploads` fallback does not work. The `/api/upload` endpoint will return **503** in production unless **Cloudinary is configured**. Set `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_UPLOAD_PRESET` (unsigned) in the Vercel project — uploads will then route there transparently.

## Default admin credentials

Configured via env (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). The `.env.example` ships with placeholder values — **change these before deploying**.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Sync Prisma schema with the database |
| `npm run db:seed` | Seed demo categories and products |
| `npm run setup` | `db:push` + `db:seed` (one-shot first-run) |

## Project structure

```
app/                     Next.js App Router routes
  api/                   API endpoints (products, categories, orders, admin, upload)
  admin/                 Admin login + (authed) dashboard, orders, products, categories
  products/              Storefront catalog + product detail
  cart/, checkout/       Cart + no-auth checkout flow
  contact/               Contact page (phone + WhatsApp)
components/              UI primitives, storefront and admin components
lib/                     Prisma client, auth, i18n, formatters, cloudinary
prisma/
  schema.prisma          Models: Category, Product, Order, OrderItem
  seed.ts                Demo data
public/                  Static assets + uploaded images (`/public/uploads`)
```

## License

MIT

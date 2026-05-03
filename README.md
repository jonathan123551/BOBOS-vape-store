# BOBOS Vapes Store

A full-stack e-commerce store for **BOBOS Vapes Store** built as a single Next.js (App Router) application — frontend, API, and admin panel all in one deployment. Designed to run out-of-the-box with zero external services.

## Features

### Storefront
- Dark mode (default) and light mode with neon/glow accents
- English (LTR) and Arabic (RTL) — language toggle persists per user
- Browse products and shop by category
- Product detail page with flavor / nicotine info and stock availability
- Cart with quantity controls (persisted in localStorage)
- **Floating cart button** — circular bottom-end FAB with live item count, jumps to `/cart`
- **Mobile-friendly `/cart`** — table on desktop, stacked card layout on phones
- Checkout (no auth) — collects name, phone, address; creates an order and decrements stock
- Contact page with click-to-call and WhatsApp group buttons
- Toast notifications, loading states, and form validation

### Admin panel (`/admin`)
- **Single-admin design** — exactly ONE admin account exists. There is no public registration UI, no `/api/admin/register` endpoint, and no way to mint additional admins from the UI.
- Env-based credential login (HMAC signed cookie, 7-day expiry)
- Default credentials (override in production): `admin` / `bobos-admin-2026`
- **Dashboard**: total orders, revenue, status breakdown, sales line chart (daily / weekly / monthly), top products, top categories, custom date filtering
- **Orders**: list, filter by status, expand to view items, update status (pending → out for delivery → done / cancelled)
- **Products**: full CRUD with bilingual name/description, price, stock, image, optional flavor and nicotine fields, category, featured flag
- **Categories**: full CRUD with bilingual names, auto-generated slugs, image
- **Image upload**: local (`/public/uploads`) by default, with optional Cloudinary fallback via env vars

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) — fullstack framework, API routes
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) — branded design system
- [Prisma ORM](https://www.prisma.io/) — SQLite by default, swap to PostgreSQL via `DATABASE_URL`
- [Recharts](https://recharts.org/) — admin dashboard charts
- [Zod](https://zod.dev/) — request validation
- [react-hot-toast](https://react-hot-toast.com/) — toasts

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Copy env (safe defaults — works out of the box)
cp .env.example .env

# 3. Initialize the database (creates SQLite file + seeds demo data)
npm run setup

# 4. Run
npm run dev
```

Open <http://localhost:3000> — the storefront. Open <http://localhost:3000/admin/login> for the admin panel.

**Admin credentials** (defaults from `.env.example`):
- Username: `admin`
- Password: `bobos-admin-2026`

## Deployment

This repo is configured to deploy with **zero manual steps** to Vercel and similar Next.js-friendly hosts. Just import the GitHub repo, set the env vars below, and ship.

### Required env vars (any host)

| Var | Required? | Default | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes (prod) | `file:./dev.db` | SQLite is fine for demos. Use Postgres (Neon/Supabase) for production. See "Postgres for production" below. |
| `ADMIN_USERNAME` | No | `admin` | Override in production. |
| `ADMIN_PASSWORD` | No | `bobos-admin-2026` | **Override in production.** Keep it long. |
| `ADMIN_SECRET` | Yes (prod) | dev fallback | HMAC key for the admin cookie. Run `openssl rand -hex 32` to generate. |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Public URL of the deployed site. |
| `NEXT_PUBLIC_STORE_PHONE` | No | included | Click-to-call number on /contact. |
| `NEXT_PUBLIC_WHATSAPP_LINK` | No | included | WhatsApp group URL on /contact. |
| `CLOUDINARY_*` | Optional | empty | Cloud image hosting. If unset, uploads go to `/public/uploads` (which does NOT persist on serverless hosts). |

### One-click Vercel deploy (recommended)

1. Push your fork of this repo to GitHub.
2. Open <https://vercel.com/new> → import the repo.
3. Set env vars under **Project Settings → Environment Variables**. At minimum:
   - `DATABASE_URL` — a Postgres connection string (Neon, Supabase, Vercel Postgres, etc.)
   - `ADMIN_PASSWORD` — a strong password
   - `ADMIN_SECRET` — `openssl rand -hex 32`
4. Click **Deploy**. The included [`vercel.json`](./vercel.json) handles the build (`prisma generate && next build`).

> **First-run database init on Postgres:** after the first deploy, run `npx prisma db push` against your `DATABASE_URL` once (locally or in a Vercel one-off shell) to create the tables. Optionally run `npm run db:seed` to add demo products. Subsequent deploys won't touch your data.

### Lovable (edit-only via GitHub sync)

[Lovable.dev](https://lovable.dev) natively builds **React + Vite + TypeScript** apps and does **not** deploy Next.js apps on its own infrastructure ([source](https://lovable.dev/faq/capabilities/tech-stack/lovable-nextjs-support)). However, you can still use Lovable as an AI editor for this repo:

1. In Lovable, create a new project and **Connect GitHub** to this repo.
2. Lovable will read the code and let you describe edits in chat (e.g. "add a new product field"). Changes sync back to GitHub.
3. The actual hosting/runtime stays on Vercel (or your chosen host) — Lovable just edits the code.

If you specifically need this app to **run on Lovable's infrastructure**, the project would need to be rewritten to Vite + React + Supabase. That's a major change (new routing, new API layer, new build) that would conflict with the "don't break existing logic / don't change routes / don't change theme" constraints — open an issue if that's actually what you want.

### Other hosts

- **Netlify**: install the [Next.js Runtime plugin](https://github.com/netlify/next-runtime), then deploy. Same env vars.
- **Render / Fly / Railway**: build with `npm run build`, run with `npm run start`. Set `DATABASE_URL` to a hosted Postgres.
- **Replit**: import from GitHub, set the env vars in **Secrets**, then run `npm run setup && npm run build && npm run start`.

### Postgres for production

SQLite is fine for local dev and demos but won't survive a serverless cold start. For production:

1. Provision a managed Postgres (Neon, Supabase, Vercel Postgres, Railway, RDS, etc.).
2. In `prisma/schema.prisma`, change the `datasource db` provider from `sqlite` to `postgresql`.
3. Set `DATABASE_URL` to your Postgres connection string.
4. Run `npx prisma db push` once to create the tables.
5. Optionally run `npm run db:seed` to insert the demo products.

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
  FloatingCartButton.tsx Bottom-end FAB with live item count
lib/                     Prisma client, auth, i18n, formatters, cloudinary
prisma/
  schema.prisma          Models: Category, Product, Order, OrderItem
  seed.ts                Demo data
public/                  Static assets + uploaded images (`/public/uploads`)
vercel.json              Vercel build config
```

## Security notes

- The admin secret cookie is HMAC-signed; a leaked cookie is invalidated by rotating `ADMIN_SECRET`.
- There is **no public sign-up**. Routes like `/register`, `/signup`, `/auth/*` are not implemented and will 404.
- Admin pages use `force-dynamic` rendering and verify the cookie on every request server-side.

## License

MIT

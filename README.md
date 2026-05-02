# BOBOS Vapes Store

A full-stack e-commerce store for **BOBOS Vapes Store** built as a single Next.js (App Router) application — frontend, API, and admin panel all in one deployment. Designed to run perfectly on Replit with zero external services.

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
- [Prisma ORM](https://www.prisma.io/) — SQLite by default, swap to PostgreSQL via `DATABASE_URL`
- [Recharts](https://recharts.org/) — admin dashboard charts
- [Zod](https://zod.dev/) — request validation
- [react-hot-toast](https://react-hot-toast.com/) — toasts

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Copy env
cp .env.example .env

# 3. Initialize the database (creates SQLite file + seeds demo data)
npm run setup

# 4. Run
npm run dev
```

Open http://localhost:3000 — the storefront. Open http://localhost:3000/admin/login for the admin panel (default credentials are in `.env.example`).

## Deploying on Replit

1. Create a new Repl from this GitHub repo (Import from GitHub).
2. In the **Secrets** panel, set the following (mirrors `.env.example`):
   - `DATABASE_URL` = `file:./prisma/dev.db` (default SQLite, zero-config) **or** a Postgres URL
   - `ADMIN_USERNAME` = your admin username
   - `ADMIN_PASSWORD` = a strong admin password
   - `ADMIN_SECRET` = a long random string (run `openssl rand -hex 32` to generate)
   - `NEXT_PUBLIC_STORE_PHONE` = `01287566246`
   - `NEXT_PUBLIC_WHATSAPP_LINK` = `https://chat.whatsapp.com/Es1cmi0a7Mp8Qz4PtyiDgF?mode=hqctcli`
   - *(optional)* `CLOUDINARY_*` for cloud image hosting
3. In the Replit shell, run once:
   ```bash
   npm install
   npm run setup
   ```
4. Set the **Run command** to:
   ```bash
   npm run build && npm run start
   ```
   *(For development you can use `npm run dev` instead.)*
5. Hit **Run**. The site will be served on the Replit URL.

> **Tip**: SQLite works perfectly for development on Replit. For production traffic with persistence across Repl restarts, use a hosted Postgres (Neon, Supabase, etc.) and set `DATABASE_URL` accordingly. Then change `prisma/schema.prisma`'s `datasource db { provider = "postgresql" }` and run `npx prisma db push`.

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

# BOBOS Vapes Store

A full-stack e-commerce storefront for vapes, pods, and e-liquids — built with **Vite + React + TypeScript + Tailwind + Supabase**, designed for one-click publish on **Lovable.app**.

- 🌑 Dark / ☀️ light theme toggle (default dark, neon glow accents)
- 🇪🇬 EN + AR with full RTL flip and Tajawal font
- 🛒 Persistent cart (localStorage) with floating cart button + mobile-friendly card layout
- 📞 Click-to-call + WhatsApp contact buttons
- 🗄️ Supabase Postgres + RLS for products / categories / orders
- 🪶 Static seed fallback so the app runs immediately, before Supabase is configured

---

## Quick start (local)

```bash
npm install
cp .env.example .env       # leave as-is for the static-seed preview
npm run dev                # http://localhost:3000
```

The storefront comes up immediately with the demo catalog from `src/lib/seed.ts`. Wire up Supabase below to switch to a real backend.

---

## Deploying to Lovable

1. Push this repo to GitHub (already done if you're reading this).
2. Open [lovable.dev/projects](https://lovable.dev/projects) → **Import GitHub repo** → pick this repo.
3. Lovable detects it as a Vite + React project automatically. Click **Publish**.
4. (Optional) Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Lovable's environment variables once your Supabase project is ready (see below).

That's it. The published `*.lovable.app` URL is your live storefront.

---

## Wiring up Supabase (5 minutes)

The app will use Supabase for products, categories, and orders as soon as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. Until then, it reads from `src/lib/seed.ts`.

### 1. Create a project
- Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**.
- Name it `bobos`, choose the closest region, generate a strong DB password, click **Create**.

### 2. Apply the schema + seed
Copy-paste each SQL file into **SQL Editor → New query** (or use the Supabase CLI), in this order:

1. `supabase/migrations/20260503000000_init.sql` — creates `categories`, `products`, `orders`, `order_items` and RLS policies.
2. `supabase/seed.sql` — inserts the 4 demo categories + 8 demo products.

### 3. Grab your keys
**Settings → API**:
- Copy the **Project URL** → set as `VITE_SUPABASE_URL`.
- Copy the **anon public** key → set as `VITE_SUPABASE_ANON_KEY`.

Both are safe to expose in the client; RLS policies enforce access.

### 4. Set env vars
- **Local:** edit `.env` (copy from `.env.example`) and restart `npm run dev`.
- **Lovable:** project settings → Environment Variables → add both.

The storefront now reads live data from Supabase, and checkout writes to the `orders` + `order_items` tables.

---

## Project structure

```
src/
  main.tsx            # Vite entry
  App.tsx             # Router + global providers
  index.css           # Tailwind + brand tokens
  components/
    Header.tsx        # sticky top nav + lang/theme toggles + mobile menu
    Footer.tsx
    Layout.tsx
    Logo.tsx
    FloatingCartButton.tsx   # bottom-end FAB, RTL-aware, hidden on /cart, /checkout, /admin
    ProductCard.tsx
    CartView.tsx      # table on md+, stacked cards on <md
  contexts/
    CartContext.tsx   # localStorage-backed cart, hydration-safe
    LangContext.tsx   # EN/AR + dir + html lang/dir wiring
    ThemeContext.tsx  # dark/light + .dark class on <html>
  lib/
    supabase.ts       # client + isSupabaseConfigured flag
    products.ts       # data layer — Supabase or static seed
    orders.ts         # createOrder() — Supabase or local stub
    seed.ts           # static demo catalog
    i18n.ts
    format.ts
  pages/
    Home.tsx, Products.tsx, ProductDetail.tsx,
    Cart.tsx, Checkout.tsx, Contact.tsx, NotFound.tsx
supabase/
  migrations/         # initial schema + RLS
  seed.sql            # demo categories + products
```

---

## Branding constants (env)

| Variable                  | Default                       |
|---------------------------|-------------------------------|
| `VITE_STORE_PHONE`        | `01287566246`                 |
| `VITE_WHATSAPP_LINK`      | (BOBOS WhatsApp group invite) |

These are read in `src/components/Footer.tsx` and `src/pages/Contact.tsx` — override them via `.env` if your contact info changes.

---

## Scripts

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — type-check + production bundle into `dist/`
- `npm run preview` — preview the production bundle locally
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript only, no emit

---

## Admin panel

Not yet ported in this iteration. The Next.js admin (dashboard, orders status updates, products / categories CRUD, image uploads via Cloudinary) is being rebuilt on Supabase Auth + Storage in a follow-up PR. Storefront + checkout work end-to-end today.

---

## Tech stack

- **Vite 5** + **React 18** + **TypeScript 5**
- **Tailwind CSS 3** with custom brand tokens (purple/cyan neon)
- **react-router-dom 6** for client-side routing
- **react-hot-toast** for notifications
- **@supabase/supabase-js 2** for the backend
- Google Fonts: **Inter** (LTR) + **Tajawal** (RTL)

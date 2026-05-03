-- BOBOS Vapes Store — initial schema
-- Run from the Supabase Dashboard → SQL Editor, or via the CLI:
--   supabase db push
--
-- The storefront uses the anon key + RLS policies (defined below). The admin
-- panel uses Supabase Auth + a `role = admin` claim (added in a separate
-- migration once the admin user is created via the dashboard).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid        primary key default gen_random_uuid(),
  slug        text        not null unique,
  name        text        not null,
  name_ar     text,
  created_at  timestamptz not null default now()
);

create index if not exists categories_slug_idx on public.categories(slug);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  name_ar         text,
  description     text        not null default '',
  description_ar  text,
  price           numeric(10,2) not null check (price >= 0),
  stock           integer     not null default 0 check (stock >= 0),
  image           text,
  flavor          text,
  nicotine        text,
  featured        boolean     not null default false,
  category_id     uuid        references public.categories(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(featured) where featured;

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'PENDING',
      'OUT_FOR_DELIVERY',
      'DONE',
      'CANCELLED'
    );
  end if;
end $$;

create table if not exists public.orders (
  id            uuid              primary key default gen_random_uuid(),
  customer_name text              not null,
  phone         text              not null,
  address       text              not null,
  notes         text,
  total         numeric(10,2)     not null check (total >= 0),
  status        public.order_status not null default 'PENDING',
  created_at    timestamptz       not null default now()
);

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id          uuid          primary key default gen_random_uuid(),
  order_id    uuid          not null references public.orders(id) on delete cascade,
  product_id  uuid          not null references public.products(id) on delete restrict,
  name        text          not null,
  price       numeric(10,2) not null check (price >= 0),
  quantity    integer       not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- ===========================================================================
-- Row-Level Security
-- ===========================================================================
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Public read for categories + products (storefront).
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products
  for select
  to anon, authenticated
  using (true);

-- Public can place orders (insert), but cannot read or modify them.
drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "order_items_public_insert" on public.order_items;
create policy "order_items_public_insert"
  on public.order_items
  for insert
  to anon, authenticated
  with check (true);

-- Admin-only access (the storefront never reads/writes these as admin):
-- Add `admin` role enforcement once Supabase Auth + admin user is set up.
-- Until then, only the service_role key (used by the seed script + Edge
-- Functions) can read orders / mutate products / categories.

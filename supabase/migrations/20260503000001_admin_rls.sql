-- BOBOS Vapes Store — admin RLS policies
--
-- Single-admin model: only the auth user with email `admin@bobos.local` can
-- mutate products / categories or read & update orders. The storefront uses
-- the anon key and is unaffected (it only inserts into orders + order_items
-- and reads products + categories — those public policies were defined in
-- the initial migration).
--
-- Set up the admin user once, in the Supabase Dashboard:
--   Authentication → Users → Add user
--     Email: admin@bobos.local
--     Password: bobos-admin-2026     (or whatever you prefer)
--     Auto Confirm User: ✓
-- Then disable signups:
--   Authentication → Providers → Email → Disable signups
-- This guarantees there's exactly one admin account.

-- Helper: returns true when the current JWT belongs to the admin user.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public, auth
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'admin@bobos.local'
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- products: admin write
-- ---------------------------------------------------------------------------
drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
  on public.products for insert to authenticated
  with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
  on public.products for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
  on public.products for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- categories: admin write
-- ---------------------------------------------------------------------------
drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert"
  on public.categories for insert to authenticated
  with check (public.is_admin());

drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update"
  on public.categories for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete"
  on public.categories for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- orders: admin read + update; insert is public (already in init migration).
-- ---------------------------------------------------------------------------
drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read"
  on public.orders for select to authenticated
  using (public.is_admin());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
  on public.orders for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete"
  on public.orders for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- order_items: admin read; public insert (already in init migration).
-- ---------------------------------------------------------------------------
drop policy if exists "order_items_admin_read" on public.order_items;
create policy "order_items_admin_read"
  on public.order_items for select to authenticated
  using (public.is_admin());

drop policy if exists "order_items_admin_delete" on public.order_items;
create policy "order_items_admin_delete"
  on public.order_items for delete to authenticated
  using (public.is_admin());

-- BOBOS Vapes Store — product image storage
--
-- Bucket `product-images` is public-readable so storefront <img> tags work
-- with no signed URLs. Only the admin user (admin@bobos.local) can upload,
-- update, or delete objects in the bucket.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

-- Public can read object listings + downloads.
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Admin (single account) can upload, replace, delete.
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );

-- BOBOS Vapes Store — demo seed data
--
-- Apply once after running migrations. Safe to re-run (uses ON CONFLICT).
-- Either:
--   1. Paste this into Supabase Dashboard → SQL Editor → Run, or
--   2. supabase db reset (local CLI)
--
-- The seeded categories + products mirror `src/lib/seed.ts` so the storefront
-- looks identical whether or not Supabase is configured.

insert into public.categories (slug, name, name_ar) values
  ('pods',        'Pod Systems',  'أنظمة البودات'),
  ('mods',        'Mods',         'موديز'),
  ('e-liquids',   'E-Liquids',    'السوائل الإلكترونية'),
  ('disposables', 'Disposables',  'أجهزة استخدام واحد')
on conflict (slug) do update set
  name = excluded.name,
  name_ar = excluded.name_ar;

with c as (select id, slug from public.categories)
insert into public.products (
  name, name_ar, description, description_ar, price, stock, flavor, nicotine, featured, category_id
)
select
  v.name, v.name_ar, v.description, v.description_ar,
  v.price, v.stock, v.flavor, v.nicotine, v.featured,
  (select id from c where slug = v.category_slug)
from (values
  ('BOBOS Pod Pro Kit',
    'بوبوس بود برو',
    'Sleek refillable pod system with adjustable airflow and 1100mAh battery. Perfect everyday carry.',
    'نظام بود قابل لإعادة التعبئة مع تدفق هواء قابل للتعديل وبطارية 1100 مللي أمبير.',
    850, 18, null, null, true, 'pods'),
  ('BOBOS Pod Mini',
    'بوبوس بود ميني',
    'Compact pod system in cyan & black. Plug-and-play pre-filled flavor cartridges.',
    'نظام بود مدمج. كاتريدج معبأ مسبقاً.',
    480, 25, null, null, true, 'pods'),
  ('Neon Storm 220W Mod',
    'نيون ستورم 220 واط',
    'Dual-battery box mod with TFT screen, temperature control and customizable RGB underglow.',
    'بوكس مود ثنائي البطارية مع شاشة TFT وتحكم بدرجة الحرارة وإضاءة RGB.',
    1850, 9, null, null, true, 'mods'),
  ('BOBOS Stick 80W',
    'بوبوس ستيك 80 واط',
    'Pen-style mod with built-in 3000mAh battery. Easy on, easy clouds. Great for beginners.',
    'مود بشكل قلم مع بطارية مدمجة 3000 مللي أمبير. مثالي للمبتدئين.',
    920, 14, null, null, false, 'mods'),
  ('Frozen Mango 30ml',
    'مانجو مثلج ٣٠ مل',
    'Sweet ripe mango with an icy menthol exhale. Salt-nic formula, 30ml chubby gorilla bottle.',
    'مانجو حلو مع نفس منثول مثلج. تركيبة سولت نيك ٣٠ مل.',
    280, 40, 'Mango / Menthol', '20mg salt', true, 'e-liquids'),
  ('Mystic Grape 60ml',
    'عنب ميستيك ٦٠ مل',
    'Concord grape candy with a hint of berry. Freebase formula, 60ml.',
    'حلوى عنب كونكورد مع لمسة توت. تركيبة فريبيز ٦٠ مل.',
    420, 22, 'Grape / Berry', '3mg', false, 'e-liquids'),
  ('BOBOS Bar 7000',
    'بوبوس بار ٧٠٠٠',
    'Up to 7000 puffs disposable with mesh coil. Variety of flavors. No charging, no refilling.',
    'جهاز يستخدم لمرة واحدة حتى ٧٠٠٠ نفس مع كويل ميش. نكهات متنوعة.',
    350, 60, 'Mixed Berries', '20mg', true, 'disposables'),
  ('BOBOS Bar 5000',
    'بوبوس بار ٥٠٠٠',
    'Up to 5000 puffs disposable. Long-lasting battery and smooth airflow.',
    'جهاز يستخدم لمرة واحدة حتى ٥٠٠٠ نفس. بطارية طويلة الأمد.',
    260, 80, 'Watermelon Ice', '20mg', false, 'disposables')
) as v(
  name, name_ar, description, description_ar,
  price, stock, flavor, nicotine, featured, category_slug
)
on conflict do nothing;

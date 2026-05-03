/**
 * Static fallback data used when Supabase is not configured (the app reads
 * from this on Lovable preview, local dev without env vars, etc.). Once
 * VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set, the products data layer
 * switches to live Supabase reads automatically.
 */
import type { Lang } from "./i18n";

export interface SeedCategory {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
}

export interface SeedProduct {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  stock: number;
  image: string | null;
  flavor: string | null;
  nicotine: string | null;
  featured: boolean;
  categorySlug: string;
  createdAt: string;
}

export const seedCategories: SeedCategory[] = [
  { id: "cat-pods", slug: "pods", name: "Pod Systems", nameAr: "أنظمة البودات" },
  { id: "cat-mods", slug: "mods", name: "Mods", nameAr: "موديز" },
  { id: "cat-eliquids", slug: "e-liquids", name: "E-Liquids", nameAr: "السوائل الإلكترونية" },
  { id: "cat-disposables", slug: "disposables", name: "Disposables", nameAr: "أجهزة استخدام واحد" },
];

export const seedProducts: SeedProduct[] = [
  {
    id: "prod-pod-pro",
    name: "BOBOS Pod Pro Kit",
    nameAr: "بوبوس بود برو",
    description:
      "Sleek refillable pod system with adjustable airflow and 1100mAh battery. Perfect everyday carry.",
    descriptionAr: "نظام بود قابل لإعادة التعبئة مع تدفق هواء قابل للتعديل وبطارية 1100 مللي أمبير.",
    price: 850,
    stock: 18,
    image: null,
    flavor: null,
    nicotine: null,
    featured: true,
    categorySlug: "pods",
    createdAt: "2026-04-20T10:00:00Z",
  },
  {
    id: "prod-pod-mini",
    name: "BOBOS Pod Mini",
    nameAr: "بوبوس بود ميني",
    description: "Compact pod system in cyan & black. Plug-and-play pre-filled flavor cartridges.",
    descriptionAr: "نظام بود مدمج. كاتريدج معبأ مسبقاً.",
    price: 480,
    stock: 25,
    image: null,
    flavor: null,
    nicotine: null,
    featured: true,
    categorySlug: "pods",
    createdAt: "2026-04-21T10:00:00Z",
  },
  {
    id: "prod-mod-storm",
    name: "Neon Storm 220W Mod",
    nameAr: "نيون ستورم 220 واط",
    description:
      "Dual-battery box mod with TFT screen, temperature control and customizable RGB underglow.",
    descriptionAr: "بوكس مود ثنائي البطارية مع شاشة TFT وتحكم بدرجة الحرارة وإضاءة RGB.",
    price: 1850,
    stock: 9,
    image: null,
    flavor: null,
    nicotine: null,
    featured: true,
    categorySlug: "mods",
    createdAt: "2026-04-22T10:00:00Z",
  },
  {
    id: "prod-mod-stick",
    name: "BOBOS Stick 80W",
    nameAr: "بوبوس ستيك 80 واط",
    description:
      "Pen-style mod with built-in 3000mAh battery. Easy on, easy clouds. Great for beginners.",
    descriptionAr: "مود بشكل قلم مع بطارية مدمجة 3000 مللي أمبير. مثالي للمبتدئين.",
    price: 920,
    stock: 14,
    image: null,
    flavor: null,
    nicotine: null,
    featured: false,
    categorySlug: "mods",
    createdAt: "2026-04-23T10:00:00Z",
  },
  {
    id: "prod-eliq-mango",
    name: "Frozen Mango 30ml",
    nameAr: "مانجو مثلج ٣٠ مل",
    description: "Sweet ripe mango with an icy menthol exhale. Salt-nic formula, 30ml chubby gorilla bottle.",
    descriptionAr: "مانجو حلو مع نفس منثول مثلج. تركيبة سولت نيك ٣٠ مل.",
    price: 280,
    stock: 40,
    image: null,
    flavor: "Mango / Menthol",
    nicotine: "20mg salt",
    featured: true,
    categorySlug: "e-liquids",
    createdAt: "2026-04-24T10:00:00Z",
  },
  {
    id: "prod-eliq-grape",
    name: "Mystic Grape 60ml",
    nameAr: "عنب ميستيك ٦٠ مل",
    description: "Concord grape candy with a hint of berry. Freebase formula, 60ml.",
    descriptionAr: "حلوى عنب كونكورد مع لمسة توت. تركيبة فريبيز ٦٠ مل.",
    price: 420,
    stock: 22,
    image: null,
    flavor: "Grape / Berry",
    nicotine: "3mg",
    featured: false,
    categorySlug: "e-liquids",
    createdAt: "2026-04-25T10:00:00Z",
  },
  {
    id: "prod-disp-7000",
    name: "BOBOS Bar 7000",
    nameAr: "بوبوس بار ٧٠٠٠",
    description:
      "Up to 7000 puffs disposable with mesh coil. Variety of flavors. No charging, no refilling.",
    descriptionAr: "جهاز يستخدم لمرة واحدة حتى ٧٠٠٠ نفس مع كويل ميش. نكهات متنوعة.",
    price: 350,
    stock: 60,
    image: null,
    flavor: "Mixed Berries",
    nicotine: "20mg",
    featured: true,
    categorySlug: "disposables",
    createdAt: "2026-04-26T10:00:00Z",
  },
  {
    id: "prod-disp-5000",
    name: "BOBOS Bar 5000",
    nameAr: "بوبوس بار ٥٠٠٠",
    description:
      "Up to 5000 puffs disposable. Long-lasting battery and smooth airflow.",
    descriptionAr: "جهاز يستخدم لمرة واحدة حتى ٥٠٠٠ نفس. بطارية طويلة الأمد.",
    price: 260,
    stock: 80,
    image: null,
    flavor: "Watermelon Ice",
    nicotine: "20mg",
    featured: false,
    categorySlug: "disposables",
    createdAt: "2026-04-27T10:00:00Z",
  },
];

export function localizeCategory(c: SeedCategory, lang: Lang): string {
  return lang === "ar" ? c.nameAr : c.name;
}

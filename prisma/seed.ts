import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding BOBOS Vapes Store...");

  const categories = [
    {
      slug: "disposable-vapes",
      name: "Disposable Vapes",
      nameAr: "فيب سحب",
      image: "https://images.unsplash.com/photo-1567459169668-95d355371bda?w=900&q=80&auto=format&fit=crop",
    },
    {
      slug: "pod-systems",
      name: "Pod Systems",
      nameAr: "أجهزة بود",
      image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=900&q=80&auto=format&fit=crop",
    },
    {
      slug: "e-liquids",
      name: "E-Liquids",
      nameAr: "سوائل",
      image: "https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=900&q=80&auto=format&fit=crop",
    },
    {
      slug: "accessories",
      name: "Accessories",
      nameAr: "اكسسوارات",
      image: "https://images.unsplash.com/photo-1562594980-6e6e1f7ed7ab?w=900&q=80&auto=format&fit=crop",
    },
  ];

  const catRecords: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, nameAr: c.nameAr, image: c.image },
      create: c,
    });
    catRecords[c.slug] = cat.id;
  }

  const products = [
    {
      slug: "disposable-vapes",
      name: "BOBOS Cloud 6000 Puffs",
      nameAr: "بوبوس كلاود 6000 سحبة",
      description: "All-in-one disposable with 6000 puffs of pure flavor and ultra-smooth airflow.",
      descriptionAr: "جهاز سحب متكامل بـ 6000 نفس وسحب ناعم ونكهات غنية.",
      price: 350,
      stock: 40,
      flavor: "Mango Ice",
      nicotine: "20 mg",
      featured: true,
      image: "https://images.unsplash.com/photo-1574329818413-2af9d8be7e25?w=900&q=80&auto=format&fit=crop",
    },
    {
      slug: "disposable-vapes",
      name: "Smoke Pen Lite 2500",
      nameAr: "سموك بن لايت 2500",
      description: "Slim disposable for everyday vaping, 2500 puffs of crisp menthol flavor.",
      descriptionAr: "سحب نحيف لكل يوم، 2500 نفس بنكهة منثول منعشة.",
      price: 220,
      stock: 60,
      flavor: "Cool Mint",
      nicotine: "20 mg",
      featured: false,
      image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=900&q=80&auto=format&fit=crop",
    },
    {
      slug: "pod-systems",
      name: "BOBOS Pod Pro Kit",
      nameAr: "بوبوس بود برو",
      description: "Refillable pod kit with 1100mAh battery and adjustable airflow.",
      descriptionAr: "جهاز بود قابل لإعادة التعبئة ببطارية 1100 وسحب قابل للتعديل.",
      price: 1250,
      stock: 18,
      featured: true,
      image: "https://images.unsplash.com/photo-1569227997603-33b9f12bb6dd?w=900&q=80&auto=format&fit=crop",
    },
    {
      slug: "pod-systems",
      name: "Neon Pod X",
      nameAr: "نيون بود إكس",
      description: "Compact pod system with neon LED accents and fast USB-C charging.",
      descriptionAr: "بود مدمج بإضاءة نيون وشحن USB-C سريع.",
      price: 980,
      stock: 12,
      featured: false,
      image: "https://images.unsplash.com/photo-1551214012-84f95e060dee?w=900&q=80&auto=format&fit=crop",
    },
    {
      slug: "e-liquids",
      name: "Smoke Lab Strawberry 60ml",
      nameAr: "سموك لاب فراولة 60مل",
      description: "Sweet ripe strawberries balanced with a creamy finish.",
      descriptionAr: "فراولة ناضجة بطعم كريمي ناعم.",
      price: 280,
      stock: 30,
      flavor: "Strawberry Cream",
      nicotine: "3 mg",
      featured: true,
      image: "https://images.unsplash.com/photo-1626788064155-9bb24a83c3f6?w=900&q=80&auto=format&fit=crop",
    },
    {
      slug: "e-liquids",
      name: "Tropic Storm 100ml",
      nameAr: "تروبيك ستورم 100مل",
      description: "Mango, pineapple and passion fruit cooled with a hint of menthol.",
      descriptionAr: "مانجو وأناناس وباشن مع لمسة منثول باردة.",
      price: 420,
      stock: 22,
      flavor: "Tropical Ice",
      nicotine: "6 mg",
      featured: false,
      image: "https://images.unsplash.com/photo-1593368858664-7ca6f81dc5b1?w=900&q=80&auto=format&fit=crop",
    },
    {
      slug: "accessories",
      name: "Replacement Coils 0.6Ω (5x)",
      nameAr: "كويلات بديلة 0.6 (5 قطع)",
      description: "Pack of 5 mesh coils for the BOBOS Pod Pro and compatible kits.",
      descriptionAr: "5 كويلات ميش متوافقة مع بوبوس بود برو.",
      price: 180,
      stock: 80,
      featured: false,
      image: "https://images.unsplash.com/photo-1602050207630-3c8d18e8e9b3?w=900&q=80&auto=format&fit=crop",
    },
    {
      slug: "accessories",
      name: "USB-C Fast Charger",
      nameAr: "شاحن USB-C سريع",
      description: "Compact 18W USB-C charger compatible with all BOBOS devices.",
      descriptionAr: "شاحن USB-C سريع 18 واط متوافق مع كل أجهزة بوبوس.",
      price: 120,
      stock: 50,
      featured: false,
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&q=80&auto=format&fit=crop",
    },
  ];

  // Wipe products+orders for idempotent re-seed (categories preserved by upsert above).
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  for (const p of products) {
    const { slug, ...data } = p;
    await prisma.product.create({
      data: { ...data, categoryId: catRecords[slug] },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

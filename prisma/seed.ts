import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SITE_SETTING_DEFAULTS } from "../lib/siteContent";

const prisma = new PrismaClient();

async function main() {
  // --- Categories: the 3 real SAKKAB door product lines ---
  const categories = [
    {
      slug: "wpc-doors",
      nameAr: "أبواب WPC",
      nameEn: "WPC Doors",
      taglineAr: "أبواب سكاب عالية الأداء",
      taglineEn: "Sakkab's high performance doors",
      descriptionAr:
        "مصممة لمتانة استثنائية، تجمع أبواب WPC لدينا بين أعلى مقاومة للرطوبة والأناقة العصرية لحماية مساحاتك والارتقاء بها.",
      descriptionEn:
        "Engineered for superior durability, our WPC doors combine ultimate moisture resistance with modern elegance to secure and elevate your spaces.",
      heroImage: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200"
    },
    {
      slug: "upvc-doors",
      nameAr: "أبواب UPVC",
      nameEn: "UPVC Doors",
      taglineAr: "أبواب سكاب عالية الأداء",
      taglineEn: "Sakkab's high performance doors",
      descriptionAr:
        "تجمع أبواب UPVC العصرية لدينا بين خفة الوزن والمرونة والعزل الحراري الاستثنائي، وتقدّم أداءً ذكياً واقتصادياً مع مقاومة عالية للاستخدام اليومي والعوامل الجوية.",
      descriptionEn:
        "Combining lightweight versatility with exceptional insulation, our modern UPVC doors deliver smart, cost-effective performance while maintaining high resistance to daily wear and weather elements.",
      heroImage: "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=1200"
    },
    {
      slug: "aluminum-doors",
      nameAr: "أبواب ألمنيوم",
      nameEn: "Aluminum Doors",
      taglineAr: "أبواب سكاب عالية الأداء",
      taglineEn: "Sakkab's high performance doors",
      descriptionAr:
        "مصنوعة لأعلى درجات الأمان وبتأثير معماري مميز، تقدّم أبواب الألمنيوم الثقيلة لدينا قوة لا تُخترق مع هيبة جمالية خالدة لحماية عقارك وتمييزه.",
      descriptionEn:
        "Crafted for ultimate security and striking architectural impact, our heavy-duty Aluminum doors offer impenetrable strength combined with timeless aesthetic prestige to protect and distinguish your property.",
      heroImage: "https://images.unsplash.com/photo-1745015446589-7ee6f702d8c1?w=1200"
    }
  ];

  const createdCategories = [];
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c
    });
    createdCategories.push(cat);
  }

  const [wpc, upvc, aluminum] = createdCategories;

  // --- Sample products (2 per category) ---
  const products = [
    {
      slug: "wpc-classic-entry-door",
      nameAr: "باب WPC كلاسيكي للمدخل",
      nameEn: "WPC Classic Entry Door",
      descriptionAr: "باب WPC فاخر بتشطيب خشبي طبيعي المظهر، مقاوم تماماً للرطوبة والعوامل الجوية، مثالي للمداخل الرئيسية.",
      descriptionEn: "Premium WPC door with a natural wood-look finish, fully moisture and weather resistant — ideal for main entrances.",
      categoryId: wpc.id,
      material: "WPC",
      price: 2400,
      featured: true,
      images: ["https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200"]
    },
    {
      slug: "wpc-modern-villa-door",
      nameAr: "باب WPC مودرن للفلل",
      nameEn: "WPC Modern Villa Door",
      descriptionAr: "تصميم عصري بخطوط نظيفة وطبقة حماية UV، يحافظ على لونه لسنوات طويلة تحت شمس الإمارات.",
      descriptionEn: "Modern clean-line design with UV-protective coating, keeping its color for years under UAE sun.",
      categoryId: wpc.id,
      material: "WPC",
      price: 2750,
      featured: false,
      images: ["https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200"]
    },
    {
      slug: "upvc-insulated-door",
      nameAr: "باب UPVC معزول حرارياً",
      nameEn: "UPVC Insulated Door",
      descriptionAr: "عزل حراري وصوتي ممتاز، خفيف الوزن وسهل الصيانة، خيار اقتصادي وذكي للمنازل والمكاتب.",
      descriptionEn: "Excellent thermal and acoustic insulation, lightweight and low-maintenance — a smart, cost-effective choice for homes and offices.",
      categoryId: upvc.id,
      material: "UPVC",
      price: 1450,
      featured: true,
      images: ["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200"]
    },
    {
      slug: "upvc-sliding-door",
      nameAr: "باب UPVC سحّاب",
      nameEn: "UPVC Sliding Door",
      descriptionAr: "باب سحّاب أنيق يوفر مساحة أكبر ورؤية بانورامية، مقاوم للاستخدام اليومي المكثف.",
      descriptionEn: "Elegant sliding door that maximizes space and view, built to withstand heavy daily use.",
      categoryId: upvc.id,
      material: "UPVC",
      price: 1980,
      featured: false,
      images: ["https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=1200"]
    },
    {
      slug: "aluminum-security-door-pro",
      nameAr: "باب ألمنيوم أمني بروفيشنال",
      nameEn: "Aluminum Security Door Pro",
      descriptionAr: "باب ألمنيوم ثقيل مقاوم للاختراق بمتعدد نقاط قفل، مناسب للمداخل الرئيسية والمشاريع التجارية.",
      descriptionEn: "Heavy-duty impact-resistant aluminum door with multi-point locking, ideal for main entrances and commercial projects.",
      categoryId: aluminum.id,
      material: "ALUMINUM",
      price: 4200,
      featured: true,
      images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200"]
    },
    {
      slug: "aluminum-architectural-door",
      nameAr: "باب ألمنيوم معماري فاخر",
      nameEn: "Aluminum Architectural Door",
      descriptionAr: "تصميم معماري مميز بطلاء إلكتروستاتيك، يجمع بين القوة والهيبة الجمالية لواجهات العقارات الفاخرة.",
      descriptionEn: "Distinctive architectural design with electrostatic coating, combining strength with aesthetic prestige for premium property facades.",
      categoryId: aluminum.id,
      material: "ALUMINUM",
      price: 5100,
      featured: false,
      images: ["https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200"]
    }
  ];

  for (const p of products) {
    const { images, ...rest } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: rest,
      create: rest
    });

    const existingImages = await prisma.productImage.count({
      where: { productId: product.id }
    });
    if (existingImages === 0) {
      await prisma.productImage.createMany({
        data: images.map((url, i) => ({
          url,
          alt: p.nameEn,
          position: i,
          productId: product.id
        }))
      });
    }
  }

  // --- Starter knowledge base for the AI assistant ---
  const knowledgeEntries = [
    {
      category: "faq",
      title: "مدة التوصيل والتركيب",
      content:
        "مدة التوصيل والتركيب عادة بين 7 إلى 14 يوم عمل حسب نوع الباب والكمية والموقع، ونأكد الموعد الدقيق مع العميل بعد تأكيد الطلب."
    },
    {
      category: "faq",
      title: "الضمان",
      content:
        "كل منتجات سكاب مغطاة بضمان شامل يبدأ من تاريخ التركيب (المدة تختلف حسب نوع الباب: WPC، UPVC، أو ألمنيوم)، ويغطي عيوب الصناعة والتركيب."
    },
    {
      category: "policy",
      title: "مناطق التغطية",
      content:
        "نغطي كل إمارات الدولة (أبوظبي، دبي، الشارقة، العين وغيرها) بالإضافة إلى سوريا (دمشق وصحنايا). فروعنا الرئيسية: أبوظبي (مدينة محمد بن زايد)، العين (شركات النود)، ودمشق-صحنايا."
    },
    {
      category: "product",
      title: "الفرق بين WPC و UPVC والألمنيوم",
      content:
        "أبواب WPC: مقاومة عالية جداً للرطوبة بمظهر خشبي طبيعي، مناسبة للمداخل والمناطق الرطبة. أبواب UPVC: خفيفة، عازلة حرارياً وصوتياً، اقتصادية. أبواب الألمنيوم: أعلى درجات الأمان والمتانة، مناسبة للمداخل الرئيسية والمشاريع التجارية والفلل الفاخرة."
    }
  ];

  for (const entry of knowledgeEntries) {
    const existing = await prisma.knowledgeEntry.findFirst({ where: { title: entry.title } });
    if (!existing) {
      await prisma.knowledgeEntry.create({ data: entry });
    }
  }

  // --- Site content CMS defaults (one row per homepage/footer section) ---
  for (const [key, value] of Object.entries(SITE_SETTING_DEFAULTS)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value: JSON.stringify(value) }
    });
  }

  // --- Default admin user ---
  // No password is hardcoded in source control. Set DEFAULT_ADMIN_USERNAME /
  // DEFAULT_ADMIN_PASSWORD in .env to choose your own on first seed;
  // otherwise a strong one-time random password is generated and printed
  // ONCE below — copy it immediately, then change it from /admin after
  // logging in (it is not recoverable afterwards; re-seeding an existing
  // admin never overwrites their password).
  const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || randomBytes(9).toString("base64url");
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: defaultUsername }
  });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await prisma.admin.create({
      data: { username: defaultUsername, passwordHash, role: "SUPER_ADMIN" }
    });
    console.log(
      `\nCreated default admin user:\n  username: ${defaultUsername}\n  password: ${defaultPassword}\n` +
        `⚠️  Save this now — it will not be shown again. Change it from /admin immediately after logging in.\n`
    );
  } else {
    console.log(`Admin user "${defaultUsername}" already exists — skipped (password left untouched).`);
  }

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

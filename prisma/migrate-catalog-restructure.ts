import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Ecobond -> Alucobond rename (same real line, corrected English name)
  const renamed = await prisma.$executeRawUnsafe(
    `UPDATE "Product" SET "productLine" = 'ALUMINUM_ALUCOBOND' WHERE "productLine" = 'ALUMINUM_ECOBOND';`
  );
  console.log("Renamed ALUMINUM_ECOBOND -> ALUMINUM_ALUCOBOND on", renamed, "product(s)");

  // 2. Untagged products default to "Doors" for their material, so nothing
  // becomes invisible under the new sub-line browsing (WPC/COMPOSITE/
  // ALUMINUM all have a *_DOORS line now).
  const wpcTagged = await prisma.product.updateMany({
    where: { material: "WPC", productLine: null },
    data: { productLine: "WPC_DOORS" }
  });
  const compositeTagged = await prisma.product.updateMany({
    where: { material: "UPVC", productLine: null },
    data: { productLine: "COMPOSITE_DOORS" }
  });
  const aluminumTagged = await prisma.product.updateMany({
    where: { material: "ALUMINUM", productLine: null },
    data: { productLine: "ALUMINUM_DOORS" }
  });
  console.log(
    "Default-tagged as Doors:",
    wpcTagged.count, "WPC,",
    compositeTagged.count, "COMPOSITE,",
    aluminumTagged.count, "ALUMINUM"
  );

  // 3. Homepage "services" section hrefs — only touch them if they still
  // hold the old defaults exactly, so a real admin customization isn't
  // silently overwritten.
  const OLD_HREFS: Record<string, string> = { "/aluminum": "/catalog/aluminum", "/composite": "/catalog/composite", "/wpc": "/catalog/wpc" };
  const servicesSetting = await prisma.siteSetting.findUnique({ where: { key: "services" } });
  if (servicesSetting) {
    const value = JSON.parse(servicesSetting.value);
    let changed = false;
    if (Array.isArray(value.items)) {
      for (const item of value.items) {
        if (typeof item.href === "string" && OLD_HREFS[item.href]) {
          item.href = OLD_HREFS[item.href];
          changed = true;
        }
      }
    }
    if (changed) {
      await prisma.siteSetting.update({ where: { key: "services" }, data: { value: JSON.stringify(value) } });
      console.log("Updated homepage services hrefs to /catalog/...");
    } else {
      console.log("Homepage services hrefs already customized or already migrated — left as-is");
    }
  } else {
    console.log("No services SiteSetting row found — nothing to migrate there");
  }
}

main()
  .catch((e) => {
    console.error("MIGRATION_ERROR:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

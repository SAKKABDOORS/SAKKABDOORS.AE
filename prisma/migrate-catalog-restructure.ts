// One-time script: update the already-stored "services" SiteSetting row's
// hrefs to the new dedicated /wpc, /aluminum, /composite sections (was
// /products?material=... and a generic /products), and relabel the
// "doors" tile to COMPOSITE. Wired into package.json's build script for a
// single deploy, then removed. New Product rows/fields (productLine) need
// no migration — it's a nullable addition.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HREF_FIXES: Record<string, string> = {
  "/products?material=ALUMINUM": "/aluminum",
  "/products?material=WPC": "/wpc",
  "/products": "/composite" // the old generic "doors" tile
};

async function main() {
  const row = await prisma.siteSetting.findUnique({ where: { key: "services" } });
  if (!row) {
    console.log("No stored services row — nothing to migrate (fresh defaults already correct).");
    return;
  }

  const value = JSON.parse(row.value);
  let changed = false;

  for (const item of value.items ?? []) {
    if (item.href in HREF_FIXES) {
      console.log(`services item "${item.key}": ${item.href} -> ${HREF_FIXES[item.href]}`);
      item.href = HREF_FIXES[item.href];
      changed = true;
    }
    if (item.key === "doors" && (item.label?.ar === "أبواب" || item.label?.en === "Doors")) {
      item.label = { ar: "COMPOSITE", en: "COMPOSITE" };
      changed = true;
      console.log('services item "doors": relabeled to COMPOSITE');
    }
  }

  if (changed) {
    await prisma.siteSetting.update({ where: { key: "services" }, data: { value: JSON.stringify(value) } });
    console.log("Updated stored services row.");
  } else {
    console.log("Stored services row already up to date.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

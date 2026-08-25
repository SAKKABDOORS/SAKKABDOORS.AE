import "server-only";
import { prisma } from "./prisma";
import { DEFAULT_ROLE_PAGES, PAGE_KEYS, isPageKey, type AdminRole, type PageKey } from "./adminRoles";

// SUPER_ADMIN is intentionally not stored here — it always has every page,
// unconditionally, regardless of any row in this table.
export async function getAllowedPages(role: Exclude<AdminRole, "SUPER_ADMIN">): Promise<PageKey[]> {
  const row = await prisma.rolePermission.findUnique({ where: { role } }).catch(() => null);
  if (!row) return DEFAULT_ROLE_PAGES[role];

  try {
    const parsed = JSON.parse(row.pages);
    if (Array.isArray(parsed)) {
      const pages = parsed.filter((p): p is PageKey => typeof p === "string" && isPageKey(p));
      return pages;
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_ROLE_PAGES[role];
}

export async function isPageAllowed(role: AdminRole, page: PageKey): Promise<boolean> {
  if (role === "SUPER_ADMIN") return true;
  const allowed = await getAllowedPages(role);
  return allowed.includes(page);
}

export async function getAllRolePermissions(): Promise<Record<Exclude<AdminRole, "SUPER_ADMIN">, PageKey[]>> {
  const [manager, employee] = await Promise.all([getAllowedPages("MANAGER"), getAllowedPages("EMPLOYEE")]);
  return { MANAGER: manager, EMPLOYEE: employee };
}

export async function saveRolePermissions(role: Exclude<AdminRole, "SUPER_ADMIN">, pages: PageKey[]) {
  const cleaned = PAGE_KEYS.filter((p) => pages.includes(p));
  await prisma.rolePermission.upsert({
    where: { role },
    update: { pages: JSON.stringify(cleaned) },
    create: { role, pages: JSON.stringify(cleaned) }
  });
}

// Single source of truth for how an order's status renders in the admin
// panel (dashboard "recent orders" + the full orders table) — labels are
// Arabic-only since the admin UI is intentionally Arabic-only (see
// app/(admin-app)/admin/layout.tsx). Display-only: doesn't change what
// statuses exist or how they're set.
export const ORDER_STATUS_INFO: Record<string, { label: string; badgeClass: string }> = {
  NEW: { label: "جديد", badgeClass: "badge-warning" },
  CONTACTED: { label: "تم التواصل", badgeClass: "badge-neutral" },
  CONFIRMED: { label: "مؤكد", badgeClass: "badge-success" },
  CANCELLED: { label: "ملغى", badgeClass: "badge-danger" }
};

export function getOrderStatusInfo(status: string) {
  return ORDER_STATUS_INFO[status] ?? { label: status, badgeClass: "badge-neutral" };
}

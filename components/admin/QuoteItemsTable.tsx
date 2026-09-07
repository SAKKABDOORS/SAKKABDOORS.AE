import type { CustomerType, Product } from "@prisma/client";
import { computeLineTotal, type QuoteItemInput } from "@/lib/quotes";

const emptyItem: QuoteItemInput = {
  productId: null,
  descriptionAr: "",
  descriptionEn: "",
  quantity: 1,
  unitPrice: 0,
  customerTypeId: null,
  discountPercent: 0
};

export { emptyItem };

export default function QuoteItemsTable({
  items,
  onChange,
  products,
  customerTypes
}: {
  items: QuoteItemInput[];
  onChange: (items: QuoteItemInput[]) => void;
  products: Product[];
  customerTypes: CustomerType[];
}) {
  function updateItem(index: number, patch: Partial<QuoteItemInput>) {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function handleProductPick(index: number, productId: string) {
    if (!productId) {
      updateItem(index, { productId: null });
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateItem(index, {
      productId: product.id,
      descriptionAr: product.nameAr,
      descriptionEn: product.nameEn,
      unitPrice: product.price
    });
  }

  function handleCustomerTypePick(index: number, customerTypeId: string) {
    if (!customerTypeId) {
      updateItem(index, { customerTypeId: null });
      return;
    }
    const type = customerTypes.find((c) => c.id === customerTypeId);
    if (!type) return;
    updateItem(index, { customerTypeId: type.id, discountPercent: type.discountPercent });
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-2 text-start font-semibold">المنتج</th>
              <th className="p-2 text-start font-semibold">الوصف</th>
              <th className="p-2 text-start font-semibold">الكمية</th>
              <th className="p-2 text-start font-semibold">السعر</th>
              <th className="p-2 text-start font-semibold">نوع العميل</th>
              <th className="p-2 text-start font-semibold">خصم %</th>
              <th className="p-2 text-start font-semibold">المجموع</th>
              <th className="p-2"><span className="sr-only">حذف</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {items.map((item, i) => (
              <tr key={i}>
                <td className="p-2">
                  <select
                    className="input"
                    value={item.productId ?? ""}
                    onChange={(e) => handleProductPick(i, e.target.value)}
                  >
                    <option value="">سطر يدوي</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.nameAr}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    className="input"
                    value={item.descriptionAr}
                    placeholder="الوصف (عربي)"
                    onChange={(e) => updateItem(i, { descriptionAr: e.target.value })}
                  />
                  <input
                    className="input mt-1"
                    dir="ltr"
                    value={item.descriptionEn}
                    placeholder="Description (English)"
                    onChange={(e) => updateItem(i, { descriptionEn: e.target.value })}
                  />
                </td>
                <td className="p-2">
                  <input
                    className="input w-20"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, { quantity: Number(e.target.value) || 1 })}
                  />
                </td>
                <td className="p-2">
                  <input
                    className="input w-24"
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="p-2">
                  <select
                    className="input"
                    value={item.customerTypeId ?? ""}
                    onChange={(e) => handleCustomerTypePick(i, e.target.value)}
                  >
                    <option value="">بدون</option>
                    {customerTypes.map((ct) => (
                      <option key={ct.id} value={ct.id}>{ct.nameAr} ({ct.discountPercent}%)</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    className="input w-20"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={item.discountPercent}
                    onChange={(e) => updateItem(i, { discountPercent: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="p-2 whitespace-nowrap font-semibold text-ink-900">
                  {computeLineTotal(item).toFixed(2)}
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => onChange([...items, { ...emptyItem }])}
        className="btn-secondary"
      >
        + إضافة سطر
      </button>
    </div>
  );
}

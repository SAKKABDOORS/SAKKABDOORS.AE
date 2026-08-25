"use client";

import { useState } from "react";

type Entry = {
  id: string;
  category: string;
  title: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
};

const CATEGORIES = ["general", "faq", "policy", "product"] as const;

const emptyForm = { category: "faq" as string, title: "", content: "", isActive: true };

export default function KnowledgeManager({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setForm({ category: entry.category, title: entry.title, content: entry.content, isActive: entry.isActive });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editingId ? `/api/admin/knowledge/${editingId}` : "/api/admin/knowledge";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setSaving(false);

    if (!res.ok) {
      setError("تعذر الحفظ، تحقق من الحقول.");
      return;
    }

    const saved = await res.json();
    setEntries((prev) =>
      editingId ? prev.map((e) => (e.id === editingId ? saved : e)) : [saved, ...prev]
    );
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("متأكد من حذف هذه المعلومة؟")) return;
    await fetch(`/api/admin/knowledge/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={handleSubmit} className="card h-fit space-y-4 p-5">
        <h2 className="font-bold text-ink-900">
          {editingId ? "تعديل معلومة" : "إضافة معلومة جديدة"}
        </h2>

        <div>
          <label className="label">التصنيف</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">العنوان</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">المحتوى (هذا ما سيعتمد عليه المساعد الذكي في إجابته)</label>
          <textarea
            className="input"
            rows={5}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          مفعّلة (يستخدمها المساعد الذكي)
        </label>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "..." : editingId ? "حفظ التعديل" : "إضافة"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              إلغاء
            </button>
          )}
        </div>
      </form>

      <div className="card divide-y divide-brand-100">
        {entries.length === 0 && (
          <p className="p-5 text-sm text-ink-800/60">
            لا توجد معلومات مضافة بعد — أضف أول معلومة من النموذج الموجود على اليسار.
          </p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  {entry.category}
                </span>
                <h3 className="mt-1 font-semibold text-ink-900">{entry.title}</h3>
                <p className="mt-1 text-sm text-ink-800/70">{entry.content}</p>
                {!entry.isActive && (
                  <span className="mt-1 inline-block text-xs font-medium text-red-500">معطّلة</span>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(entry)}
                  className="rounded-lg border border-brand-200 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

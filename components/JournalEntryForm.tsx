"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Account } from "@prisma/client";
import JournalEntryLinesTable, { emptyLine } from "@/components/accounting/JournalEntryLinesTable";
import { journalEntryInputSchema, isBalanced, type JournalLineInput } from "@/lib/journalEntries";

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function JournalEntryForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [date, setDate] = useState(todayInputValue());
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<JournalLineInput[]>([{ ...emptyLine }, { ...emptyLine }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isBalanced(lines)) {
      setError("القيد غير متوازن — مجموع المدين لازم يساوي مجموع الدائن");
      return;
    }

    const payload = journalEntryInputSchema.safeParse({ date, description, reference: reference || undefined, lines });
    if (!payload.success) {
      setError("تحقق من الحقول — في بيانات ناقصة أو غير صحيحة");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/accounting/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.data)
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error === "unbalanced" ? "القيد غير متوازن" : "تعذر حفظ القيد. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }

    router.push("/entries");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">التاريخ</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">الوصف</label>
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div>
            <label className="label">مرجع (اختياري)</label>
            <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">سطور القيد</h2>
        <JournalEntryLinesTable lines={lines} onChange={setLines} accounts={accounts} />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ القيد"}
      </button>
    </form>
  );
}

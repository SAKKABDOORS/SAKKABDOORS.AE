"use client";

import { useEffect } from "react";
import Image from "next/image";

type JobApplicationPrintData = {
  id: string;
  createdAt: string;
  jobTitle: string;
  applicantName: string;
  phone: string;
  yearsExperience: string;
  reasonJoining: string;
  previousWorkplaces: string | null;
  certificates: string | null;
  extraMessage: string | null;
};

// Mirrors components/admin/OrderPrintView.tsx (same auto-print-on-open
// behavior, same branding) but kept as its own component — a job
// application has different fields and no items table.
export default function JobApplicationPrintView({ application }: { application: JobApplicationPrintData }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-2xl p-6 print:p-0">
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <button onClick={() => window.print()} className="btn-primary py-2 px-4 text-sm">
          طباعة
        </button>
        <button onClick={() => window.close()} className="btn-secondary py-2 px-4 text-sm">
          إغلاق
        </button>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-8 print:rounded-none print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b-2 border-brand-700 pb-4">
          <div>
            <h1 className="text-lg font-bold text-brand-700">طلب توظيف جديد</h1>
            <p className="text-xs text-ink-800/60">#{application.id.slice(-6).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-brand-700">SAKKAB DOORS</span>
            <Image src="/images/logo-mark.png" alt="" width={32} height={32} className="rounded" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Field label="التاريخ" value={new Date(application.createdAt).toLocaleString("ar-AE")} />
          <Field label="الوظيفة" value={application.jobTitle} />
          <Field label="الاسم" value={application.applicantName} />
          <Field label="الهاتف" value={application.phone} />
          <Field label="سنوات الخبرة" value={application.yearsExperience} />
          {application.previousWorkplaces && (
            <Field label="أماكن العمل السابقة" value={application.previousWorkplaces} />
          )}
        </div>

        <div className="mt-4">
          <p className="mb-1 text-sm font-bold text-brand-700">سبب الانضمام</p>
          <p className="whitespace-pre-line text-sm text-ink-900">{application.reasonJoining}</p>
        </div>

        {application.certificates && (
          <div className="mt-4">
            <p className="mb-1 text-sm font-bold text-brand-700">الشهادات</p>
            <p className="whitespace-pre-line text-sm text-ink-900">{application.certificates}</p>
          </div>
        )}

        {application.extraMessage && (
          <div className="mt-4">
            <p className="mb-1 text-sm font-bold text-brand-700">ملاحظات إضافية</p>
            <p className="whitespace-pre-line text-sm text-ink-900">{application.extraMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 gap-1">
      <span className="shrink-0 font-bold text-brand-700">{label}:</span>
      <span className="min-w-0 break-words text-ink-900">{value}</span>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteJobButton from "@/components/DeleteJobButton";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function AdminJobsPage() {
  await requirePageRole(["SUPER_ADMIN", "MANAGER"]);

  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">الوظائف الشاغرة</h1>
        <Link href="/admin/jobs/new" className="btn-primary">إضافة وظيفة</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">الوظيفة</th>
              <th className="p-3 text-start font-semibold">الموقع</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {jobs.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-ink-800/60">
                  لا يوجد وظائف شاغرة حالياً
                </td>
              </tr>
            )}
            {jobs.map((j) => (
              <tr key={j.id}>
                <td className="p-3 font-medium text-ink-900">{j.titleAr}</td>
                <td className="p-3 text-ink-800/70">{j.locationAr}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/jobs/${j.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                      تعديل
                    </Link>
                    <DeleteJobButton jobId={j.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

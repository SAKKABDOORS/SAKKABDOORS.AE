import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function AdminJobApplicationsPage() {
  await requirePageRole("jobApplications");

  const applications = await prisma.jobApplication.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">طلبات التوظيف</h1>

      {applications.length === 0 ? (
        <p className="text-sm text-ink-800/60">لا يوجد طلبات توظيف بعد</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-100 bg-brand-50 text-start">
              <tr>
                <th className="p-3 text-start font-semibold">التاريخ</th>
                <th className="p-3 text-start font-semibold">المتقدم</th>
                <th className="p-3 text-start font-semibold">الهاتف</th>
                <th className="p-3 text-start font-semibold">الوظيفة</th>
                <th className="p-3 text-start font-semibold">الخبرة</th>
                <th className="p-3 text-start font-semibold">إيميل</th>
                <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {applications.map((a) => (
                <tr key={a.id}>
                  <td className="p-3 whitespace-nowrap text-ink-800/70">
                    {new Date(a.createdAt).toLocaleString("ar-AE")}
                  </td>
                  <td className="p-3 font-medium text-ink-900">{a.applicantName}</td>
                  <td className="p-3">{a.phone}</td>
                  <td className="p-3">{a.jobTitle}</td>
                  <td className="p-3">{a.yearsExperience}</td>
                  <td className="p-3">{a.emailedOk ? "✅" : "⚠️"}</td>
                  <td className="p-3">
                    <a
                      href={`/admin/job-applications/${a.id}/print`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary whitespace-nowrap py-1.5 px-3 text-xs"
                    >
                      طباعة مباشرة
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

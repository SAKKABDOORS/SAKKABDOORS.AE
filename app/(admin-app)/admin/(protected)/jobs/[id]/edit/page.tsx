import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import JobForm from "@/components/JobForm";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function EditJobPage({ params }: { params: { id: string } }) {
  await requirePageRole(["SUPER_ADMIN", "MANAGER"]);

  const job = await prisma.job.findUnique({ where: { id: params.id } });

  if (!job) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">تعديل الوظيفة</h1>
      <JobForm job={job} />
    </div>
  );
}

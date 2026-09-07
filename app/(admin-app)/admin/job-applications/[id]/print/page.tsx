import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/requirePageRole";
import JobApplicationPrintView from "@/components/admin/JobApplicationPrintView";

// Deliberately outside admin/(protected) — see app/(admin-app)/admin/orders/[id]/print
// for why. Still gated by the same requirePageRole() check as the rest of
// /admin/job-applications.
export default async function JobApplicationPrintPage({ params }: { params: { id: string } }) {
  await requirePageRole("jobApplications");

  const application = await prisma.jobApplication.findUnique({ where: { id: params.id } });

  if (!application) {
    notFound();
  }

  return (
    <JobApplicationPrintView
      application={{
        id: application.id,
        createdAt: application.createdAt.toISOString(),
        jobTitle: application.jobTitle,
        applicantName: application.applicantName,
        phone: application.phone,
        yearsExperience: application.yearsExperience,
        reasonJoining: application.reasonJoining,
        previousWorkplaces: application.previousWorkplaces,
        certificates: application.certificates,
        extraMessage: application.extraMessage
      }}
    />
  );
}

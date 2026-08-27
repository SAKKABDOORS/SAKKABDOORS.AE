"use client";

import { useRef, useState } from "react";
import { Briefcase, MapPin } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Job } from "@/lib/types";
import JobApplyForm from "./JobApplyForm";
import Reveal from "./motion/Reveal";

export default function CareersView({
  jobs,
  dict,
  locale
}: {
  jobs: Job[];
  dict: Dictionary;
  locale: Locale;
}) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function handleApply(job: Job) {
    setSelectedJob(job);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (jobs.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 p-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <Briefcase className="h-6 w-6" />
        </span>
        <p className="text-ink-800/60">{dict.careers.no_results}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, i) => {
          const title = locale === "ar" ? job.titleAr : job.titleEn;
          const location = locale === "ar" ? job.locationAr : job.locationEn;
          const description = locale === "ar" ? job.descriptionAr : job.descriptionEn;
          return (
            <Reveal key={job.id} delay={Math.min((i % 6) * 0.06, 0.3)}>
              <div className="card-interactive flex h-full flex-col p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Briefcase className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink-900">{title}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-800/60">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {location}
                </div>
                <p className="mt-3 flex-1 whitespace-pre-line text-sm text-ink-800/80">{description}</p>
                <button
                  type="button"
                  onClick={() => handleApply(job)}
                  className="btn-pill-solid mt-5 self-start"
                >
                  {dict.careers.apply_now}
                </button>
              </div>
            </Reveal>
          );
        })}
      </div>

      {selectedJob && (
        <div ref={formRef} className="mx-auto max-w-xl scroll-mt-24">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-900">
              {dict.careers.apply_message}: {locale === "ar" ? selectedJob.titleAr : selectedJob.titleEn}
            </p>
            <button
              type="button"
              onClick={() => setSelectedJob(null)}
              className="text-sm font-medium text-ink-800/60 hover:text-ink-900"
            >
              {dict.careers.cancel}
            </button>
          </div>
          <JobApplyForm
            dict={dict}
            jobTitle={locale === "ar" ? selectedJob.titleAr : selectedJob.titleEn}
            onSuccess={() => setSelectedJob(null)}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/getDictionary";

// Separate from OrderForm on purpose — a job application collects different
// information (experience, motivation, work history, certificates) and
// deliberately never asks for an email, only a phone number. Posts to its
// own /api/job-applications endpoint (a JobApplication row, not an Order)
// so candidates get their own admin list/print/email instead of being mixed
// in with product orders and quote requests.
export default function JobApplyForm({
  dict,
  jobTitle,
  onSuccess
}: {
  dict: Dictionary;
  jobTitle: string;
  onSuccess?: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);

    const field = (name: string) => String(data.get(name) || "").trim();

    const payload = {
      jobTitle,
      applicantName: field("customerName"),
      phone: field("phone"),
      yearsExperience: field("yearsExperience"),
      reasonJoining: field("reasonJoining"),
      previousWorkplaces: field("previousWorkplaces") || undefined,
      certificates: field("certificates") || undefined,
      extraMessage: field("extraMessage") || undefined
    };

    try {
      const res = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("request_failed");
      setStatus("success");
      form.reset();
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
        {dict.order_form.success}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="customerName">{dict.order_form.name}</label>
          <input className="input" id="customerName" name="customerName" required />
        </div>
        <div>
          <label className="label" htmlFor="phone">{dict.order_form.phone}</label>
          <input className="input" id="phone" name="phone" type="tel" required />
        </div>
        <div>
          <label className="label" htmlFor="yearsExperience">{dict.careers.years_experience}</label>
          <input className="input" id="yearsExperience" name="yearsExperience" required />
        </div>
        <div>
          <label className="label" htmlFor="previousWorkplaces">{dict.careers.previous_workplaces}</label>
          <input className="input" id="previousWorkplaces" name="previousWorkplaces" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="reasonJoining">{dict.careers.reason_joining}</label>
        <textarea className="input" id="reasonJoining" name="reasonJoining" rows={3} required />
      </div>

      <div>
        <label className="label" htmlFor="certificates">{dict.careers.certificates}</label>
        <textarea className="input" id="certificates" name="certificates" rows={2} />
      </div>

      <div>
        <label className="label" htmlFor="extraMessage">{dict.careers.extra_message}</label>
        <textarea className="input" id="extraMessage" name="extraMessage" rows={3} />
      </div>

      {status === "error" && (
        <p className="text-sm font-medium text-red-600">{dict.order_form.error}</p>
      )}

      <button type="submit" disabled={status === "submitting"} className="btn-primary w-full">
        {status === "submitting" ? dict.order_form.submitting : dict.order_form.submit}
      </button>
    </form>
  );
}

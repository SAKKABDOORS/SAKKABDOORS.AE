import { requireSystemRole } from "@/lib/requireSystemRole";
import { getSiteSetting } from "@/lib/siteContent";
import QuoteForm from "@/components/QuoteForm";

export default async function NewSystemQuotePage() {
  await requireSystemRole("quotes");

  const defaultTerms = await getSiteSetting("quoteTerms");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">عرض سعر جديد</h1>
      <QuoteForm
        defaultTerms={defaultTerms}
        apiBase="/api/system/quotes"
        customerTypesApiBase="/api/system/customer-types"
        redirectTo="/quotes"
        enableCustomerLink
      />
    </div>
  );
}

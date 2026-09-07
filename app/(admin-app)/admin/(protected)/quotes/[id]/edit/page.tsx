import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/requirePageRole";
import { getSiteSetting } from "@/lib/siteContent";
import QuoteForm from "@/components/QuoteForm";
import { formatQuoteNumber } from "@/lib/quotes";

export default async function EditQuotePage({ params }: { params: { id: string } }) {
  await requirePageRole("quotes");

  const quote = await prisma.quote.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!quote) notFound();

  const defaultTerms = await getSiteSetting("quoteTerms");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">تعديل عرض السعر #{formatQuoteNumber(quote.quoteNumber)}</h1>
      <QuoteForm quote={quote} defaultTerms={defaultTerms} />
    </div>
  );
}

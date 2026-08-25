import { Award, Handshake, Leaf, Sparkles } from "lucide-react";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import Reveal from "@/components/motion/Reveal";

export default async function AboutPage({
  params
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const values = [
    { icon: Award, label: dict.about.value_1 },
    { icon: Sparkles, label: dict.about.value_2 },
    { icon: Leaf, label: dict.about.value_3 },
    { icon: Handshake, label: dict.about.value_4 }
  ];

  return (
    <div className="container-page max-w-3xl py-16">
      <Reveal>
        <span className="eyebrow">{dict.about.eyebrow}</span>
        <h1 className="font-display mb-6 mt-2 text-3xl text-ink-900 sm:text-5xl">{dict.about.title}</h1>
        <p className="text-lg leading-relaxed text-ink-800/80">{dict.about.body}</p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 rounded-xl2 bg-sand-300 p-6 sm:p-8">
          <span className="eyebrow text-brand-800">{dict.about.vision_eyebrow}</span>
          <p className="mt-2 text-base leading-relaxed text-ink-900">{dict.about.vision_body}</p>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <h2 className="mb-4 mt-10 text-xl font-bold text-ink-900">{dict.about.values_title}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {values.map((v, i) => (
            <div key={i} className="card flex flex-col items-center gap-2 p-5 text-center">
              <v.icon className="h-6 w-6 text-brand-700" strokeWidth={1.75} />
              <span className="text-sm font-semibold text-ink-900">{v.label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

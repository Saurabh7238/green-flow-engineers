import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return { title: "Enquiry", description: t("subtitle") };
}

export default async function EnquiryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="border-b border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Green Flow Engineers</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Send an Enquiry</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">Tell us about your requirement and our team will get back to you.</p>
        </div>
      </section>
      <div className="bg-orange-50/60 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:p-6">
          <ContactForm />
        </div>
      </div>
    </>
  );
}

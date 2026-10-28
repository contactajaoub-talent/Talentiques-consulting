import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiagnosticIntake } from "@/components/crm/DiagnosticIntake";
export const metadata: Metadata = {
  title: "Diagnostic CV ATS",
  description:
    "Un diagnostic CV examiné par notre équipe, avec des recommandations personnalisées.",
};
export default function CVDiagnosisPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <Navbar />
      <section className="mx-auto max-w-3xl px-5 pb-20 pt-36">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#133960]">
          Diagnostic offert
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-[#133960] sm:text-5xl">
          Un regard professionnel sur votre CV.
        </h1>
        <p className="mb-9 mt-5 leading-7 text-slate-600">
          Précisez votre objectif. Notre équipe examinera votre CV et vous
          transmettra ses recommandations personnalisées.
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9">
          <DiagnosticIntake />
        </div>
      </section>
      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiagnosticIntake } from "@/components/crm/DiagnosticIntake";

export const metadata: Metadata = {
  title: "Diagnostic du profil professionnel offert",
  description:
    "Faites examiner votre profil professionnel et votre objectif par notre équipe. Recevez des recommandations personnalisées et des priorités concrètes.",
};

const benefits = [
  { icon: Sparkles, text: "Analyse humaine" },
  { icon: Check, text: "Priorités identifiées" },
  { icon: ShieldCheck, text: "Données confidentielles" },
];

export default function CVDiagnosisPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="relative isolate overflow-hidden bg-[linear-gradient(155deg,#edf8ff_0%,#ffffff_44%,#f6faff_100%)] px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[350px] w-[700px] max-w-[100vw] -translate-x-1/2 rounded-full bg-[#dceffb]/50 blur-[85px]"
        />
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#087fc2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0dd7ea]" aria-hidden="true" />
              Diagnostic professionnel offert
            </p>
            <h1 className="font-heading text-[2.3rem] font-semibold leading-[1.11] tracking-[-0.035em] text-[#133960] sm:text-[3.4rem]">
              Un regard expert sur votre{" "}
              <span className="text-[#087fc2] md:whitespace-nowrap">profil professionnel.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-[#64748b] sm:text-base">
              Partagez votre situation et votre objectif. Notre équipe examine
              votre profil pour identifier vos priorités et vous transmettre
              des recommandations personnalisées.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {benefits.map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#48627c] sm:text-sm"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e4f4fe] text-[#0783c7]">
                    <Icon aria-hidden="true" size={13} strokeWidth={2.2} />
                  </span>
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div data-diagnostic-card className="mx-auto mt-8 max-w-[760px] overflow-hidden rounded-[22px] border border-[#e3ebf3] bg-white px-5 py-6 shadow-[0_24px_75px_-44px_rgba(19,57,96,0.32)] [overflow-anchor:none] sm:mt-9 sm:px-9 sm:py-7">
            <DiagnosticIntake>
            <div className="mb-6 border-b border-[#edf1f6] pb-5 sm:pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0783c7]">
                    Votre demande
                  </p>
                  <h2 className="mt-1 font-heading text-xl font-semibold tracking-tight text-[#133960] sm:text-2xl">
                    Parlez-nous de votre projet
                  </h2>
                </div>
                <span className="rounded-full border border-[#dcecf8] bg-[#f2f9ff] px-3 py-1.5 text-xs font-semibold text-[#087fc2]">
                  Gratuit · Sans engagement
                </span>
              </div>
            </div>
            </DiagnosticIntake>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Accompaniment } from '@/components/Accompaniment';
import { Process } from '@/components/Process';

export const metadata = {
  title: 'Accompagnement carrière francophone',
  description: 'Accompagnement personnalisé pour structurer votre recherche d’emploi, d’alternance ou votre projet de carrière sur les marchés francophones.',
};

export default function AccompanimentPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-36 pb-16 px-4 text-center">
        <span className="text-brand-700 font-bold uppercase tracking-widest text-sm">France · Belgique · Suisse · Luxembourg · Canada francophone</span>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mt-4 font-heading">Accompagnement carrière francophone</h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto mt-5">Un parcours personnalisé pour clarifier votre objectif, renforcer votre dossier et organiser vos candidatures sur le marché ciblé.</p>
      </section>
      <Accompaniment />
      <Process />
      <Footer />
    </main>
  );
}

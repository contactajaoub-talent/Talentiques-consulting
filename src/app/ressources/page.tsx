import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Resources } from '@/components/Resources';

export const metadata = {
  title: 'Ressources carrière gratuites et payantes',
  description: 'Modèles, checklists, guides et futurs kits TalentiQues pour améliorer votre CV, LinkedIn et votre recherche d’emploi.',
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-36 pb-6 text-center px-4">
        <span className="text-brand-700 font-bold uppercase tracking-widest text-sm">Bibliothèque TalentiQues</span>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mt-4 font-heading">Ressources carrière</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-5">Des contenus pratiques pour avancer en autonomie. Les premières ressources seront ajoutées progressivement.</p>
      </section>
      <Resources />
      <Footer />
    </main>
  );
}

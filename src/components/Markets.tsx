import React from 'react';
import { Globe2 } from 'lucide-react';
import { content } from '@/lib/content';

export const Markets = () => (
  <section className="py-20 bg-white border-y border-slate-100">
    <div className="container mx-auto px-4 md:px-6 max-w-6xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-brand-700 font-bold text-sm uppercase tracking-widest"><Globe2 size={17}/>Marchés ciblés</div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 font-heading">Une expertise centrée sur les marchés francophones</h2>
        <p className="text-slate-600 mt-4 max-w-2xl mx-auto">Les recommandations et les supports sont adaptés au marché visé, sans appliquer la même logique à tous les pays.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{content.accompaniment.markets.map((market) => <div key={market} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center font-semibold text-slate-800">{market}</div>)}</div>
    </div>
  </section>
);

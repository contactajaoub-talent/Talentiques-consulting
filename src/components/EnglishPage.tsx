import type { ReactNode } from 'react';
import { EnglishHeader, EnglishFooter } from './store/EnglishStore';

export default function EnglishPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return <><EnglishHeader /><main className="bg-white text-[#0F172A]"><header className="bg-gradient-to-b from-sky-50 to-white px-5 py-16 sm:py-24"><div className="mx-auto max-w-5xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0683C9]">TalentiQues</p><h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">{title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{intro}</p></div></header><div className="mx-auto max-w-5xl space-y-14 px-5 pb-20">{children}</div></main><EnglishFooter /></>;
}

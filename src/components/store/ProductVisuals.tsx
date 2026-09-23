import Image from 'next/image';
import { FileCheck2, Layers3, Linkedin } from 'lucide-react';

function ResumeCard({ index }: { index: number }) {
  return (
    <div
      className="absolute h-[210px] w-[145px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,.14)]"
      style={{
        right: `${index * 13}px`,
        top: `${index * 8}px`,
        transform: `rotate(${(index - 1.5) * 4}deg)`,
      }}
    >
      <div className="h-4 w-20 rounded bg-slate-900" />
      <div className="mt-2 h-2 w-12 rounded bg-sky-400" />
      <div className="mt-5 grid grid-cols-[1fr_42px] gap-2">
        <div className="space-y-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-1.5 rounded-full bg-slate-200" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-1.5 rounded-full bg-sky-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroProductVisual() {
  return (
    <div className="relative mx-auto mt-8 h-[330px] w-full max-w-6xl sm:h-[390px] lg:h-[420px]">
      <div className="absolute -left-4 top-20 hidden w-[33%] -rotate-3 overflow-hidden rounded-3xl border border-sky-300/20 bg-white p-2 shadow-[0_25px_80px_rgba(14,165,233,.20)] lg:block">
        <div className="mb-2 px-2 pt-1 text-left text-[11px] font-black text-slate-900">
          Toutes vos opportunités
        </div>
        <Image
          src="/store/tracker-opportunities.png"
          alt="Aperçu du suivi des opportunités dans Opportunity Tracker Pro"
          width={900}
          height={210}
          className="h-[190px] w-full rounded-2xl object-cover object-left"
          priority
        />
      </div>

      <div className="absolute left-1/2 top-1 z-20 w-[94%] -translate-x-1/2 sm:w-[78%] lg:w-[59%]">
        <div className="rounded-[30px] border border-slate-600 bg-gradient-to-b from-slate-800 to-slate-950 p-2.5 shadow-[0_35px_110px_rgba(14,165,233,.30)]">
          <div className="overflow-hidden rounded-[23px] bg-white">
            <Image
              src="/store/tracker-dashboard.png"
              alt="Dashboard Opportunity Tracker Pro TalentiQues"
              width={1600}
              height={900}
              className="aspect-[16/9] w-full object-cover object-top"
              priority
            />
          </div>
        </div>
        <div className="mx-auto h-3.5 w-[78%] rounded-b-[24px] bg-gradient-to-b from-slate-600 to-slate-800 shadow-2xl" />
        <div className="mx-auto h-1.5 w-[28%] rounded-b-full bg-slate-500/70" />
      </div>

      <div className="absolute -right-3 top-10 hidden w-[30%] lg:block">
        <div className="relative h-[300px]">
          {[3, 2, 1, 0].map((index) => (
            <ResumeCard key={index} index={index} />
          ))}

          <div className="absolute bottom-0 right-24 z-30 w-[112px] rotate-[-4deg] overflow-hidden rounded-2xl border border-sky-300/20 bg-slate-950 shadow-2xl">
            <Image
              src="/store/cv-guide-cover.png"
              alt="Guide CV ATS TalentiQues"
              width={350}
              height={500}
              className="h-[160px] w-full object-cover object-top"
            />
          </div>

          <div className="absolute bottom-0 right-0 z-40 w-[118px] rotate-[4deg] overflow-hidden rounded-2xl border border-sky-300/20 bg-slate-950 shadow-2xl">
            <Image
              src="/store/linkedin-guide-cover.png"
              alt="Guide LinkedIn TalentiQues"
              width={350}
              height={500}
              className="h-[168px] w-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 z-30 flex -translate-x-1/2 gap-3 lg:hidden">
        <div className="w-[90px] -rotate-3 overflow-hidden rounded-xl border border-white/15 shadow-2xl sm:w-[112px]">
          <Image
            src="/store/cv-guide-cover.png"
            alt="Guide CV ATS TalentiQues"
            width={280}
            height={400}
            className="h-auto w-full"
          />
        </div>
        <div className="w-[90px] rotate-3 overflow-hidden rounded-xl border border-white/15 shadow-2xl sm:w-[112px]">
          <Image
            src="/store/linkedin-guide-cover.png"
            alt="Guide LinkedIn TalentiQues"
            width={280}
            height={400}
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}

export function TrackerVisual() {
  return (
    <div className="relative mx-auto h-[290px] max-w-xl sm:h-[330px]">
      <div className="absolute left-0 top-14 w-[86%] -rotate-2 overflow-hidden rounded-2xl border border-sky-100 bg-white p-2 shadow-xl">
        <Image
          src="/store/tracker-opportunities.png"
          alt="Tableau des opportunités Opportunity Tracker Pro"
          width={1100}
          height={260}
          className="h-[150px] w-full object-cover object-left sm:h-[175px]"
        />
      </div>
      <div className="absolute right-0 top-0 z-10 w-[86%] rotate-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_22px_60px_rgba(15,23,42,.16)]">
        <Image
          src="/store/tracker-dashboard.png"
          alt="Dashboard de pilotage Opportunity Tracker Pro"
          width={1200}
          height={700}
          className="aspect-[16/9] w-full object-cover object-top"
        />
      </div>
      <div className="absolute bottom-0 left-5 z-20 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white shadow-lg">
        <Layers3 className="h-4 w-4 text-sky-300" /> Tracker + automatisations
      </div>
    </div>
  );
}

export function AtsVisual() {
  return (
    <div className="relative mx-auto h-[315px] max-w-xl">
      <div className="absolute left-4 top-4 h-[225px] w-[180px] -rotate-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:left-12">
        <div className="h-5 w-28 rounded bg-slate-900" />
        <div className="mt-2 h-2 w-16 rounded bg-violet-400" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full ${i % 4 === 0 ? 'w-3/4 bg-slate-400' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute left-[94px] top-2 h-[235px] w-[185px] rotate-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:left-[145px]">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-28 rounded bg-slate-900" />
            <div className="mt-2 h-2 w-16 rounded bg-sky-400" />
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-100" />
        </div>
        <div className="mt-6 grid grid-cols-[1fr_48px] gap-3">
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-1.5 rounded-full bg-slate-200" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-1.5 rounded-full bg-violet-100" />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-5 top-9 h-[220px] w-[175px] rotate-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:right-12">
        <div className="h-5 w-24 rounded bg-slate-900" />
        <div className="mt-2 h-2 w-20 rounded bg-violet-400" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full ${i % 3 === 0 ? 'w-4/5 bg-slate-400' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-5 z-30 w-[112px] -rotate-3 overflow-hidden rounded-xl border border-violet-200 shadow-xl sm:left-20 sm:w-[125px]">
        <Image
          src="/store/cv-guide-cover.png"
          alt="Guide CV ATS complet"
          width={300}
          height={430}
          className="h-[160px] w-full object-cover object-top sm:h-[178px]"
        />
      </div>

      <div className="absolute bottom-0 right-5 z-30 w-[112px] rotate-3 overflow-hidden rounded-xl border border-violet-200 shadow-xl sm:right-20 sm:w-[125px]">
        <Image
          src="/store/linkedin-guide-cover.png"
          alt="Guide LinkedIn offert"
          width={300}
          height={430}
          className="h-[160px] w-full object-cover object-top sm:h-[178px]"
        />
      </div>

      <div className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-2 text-xs font-black text-white shadow-lg">
        7 modèles ATS
      </div>
    </div>
  );
}

'use client';

import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function calculate(target?: string): TimeLeft | null {
  if (!target) return null;
  const end = new Date(target).getTime();
  if (Number.isNaN(end)) return null;

  const raw = end - Date.now();
  const diff = Math.max(0, raw);

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: raw <= 0,
  };
}

export default function LaunchCountdown({ target }: { target?: string }) {
  const [time, setTime] = useState<TimeLeft | null>(() => calculate(target));

  useEffect(() => {
    if (!target) return;
    const refresh = () => setTime(calculate(target));
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (!time) {
    return (
      <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-2xl border border-sky-300/20 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-slate-200 backdrop-blur-xl">
        <Clock3 className="h-4 w-4 text-sky-300" />
        Tarif de lancement actuellement disponible
      </div>
    );
  }

  if (time.expired) {
    return (
      <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] px-4 py-3 text-sm font-semibold text-amber-100 backdrop-blur-xl">
        <Clock3 className="h-4 w-4" />
        La période de lancement est arrivée à son terme
      </div>
    );
  }

  const units = [
    ['Jours', time.days],
    ['Heures', time.hours],
    ['Minutes', time.minutes],
    ['Secondes', time.seconds],
  ] as const;

  return (
    <div className="mx-auto mt-7 w-fit rounded-3xl border border-sky-400/25 bg-slate-950/55 p-3 shadow-[0_18px_70px_rgba(14,165,233,0.16)] backdrop-blur-xl sm:p-4">
      <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-sky-100/90 sm:text-xs">
        <Clock3 className="h-4 w-4 text-sky-300" />
        Tarif de lancement se termine dans
      </div>
      <div className="grid grid-cols-4 gap-2">
        {units.map(([label, value]) => (
          <div
            key={label}
            className="min-w-[62px] rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-2.5 text-center sm:min-w-[80px] sm:px-3"
          >
            <div className="text-xl font-black tabular-nums text-white sm:text-2xl">
              {String(value).padStart(2, '0')}
            </div>
            <div className="mt-0.5 text-[9px] font-medium text-slate-400 sm:text-[11px]">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

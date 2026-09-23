'use client';

import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';

const SESSION_DURATION_MS = 10 * 60 * 1000;
const STORAGE_KEY = 'talentiques-store-fr-session-deadline-v1';

type TimeLeft = {
  minutes: number;
  seconds: number;
  expired: boolean;
};

function calculate(deadline: number): TimeLeft {
  const raw = deadline - Date.now();
  const diff = Math.max(0, raw);

  return {
    minutes: Math.floor(diff / 60_000),
    seconds: Math.floor((diff / 1000) % 60),
    expired: raw <= 0,
  };
}

function resolveDeadline() {
  const stored = Number(window.sessionStorage.getItem(STORAGE_KEY));
  if (Number.isFinite(stored) && stored > 0) return stored;

  const next = Date.now() + SESSION_DURATION_MS;
  window.sessionStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

export default function LaunchCountdown({ compact = false }: { compact?: boolean }) {
  const [time, setTime] = useState<TimeLeft>({
    minutes: 10,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const deadline = resolveDeadline();
    const refresh = () => setTime(calculate(deadline));

    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (time.expired) {
    return (
      <div
        className={`mx-auto flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 font-semibold text-slate-200 backdrop-blur-xl ${
          compact ? 'text-xs' : 'mt-7 text-sm'
        }`}
      >
        <Clock3 className="h-4 w-4 text-sky-300" />
        Session de 10 minutes écoulée — vous pouvez toujours consulter l’offre.
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-fit rounded-[24px] border border-sky-400/25 bg-slate-950/70 shadow-[0_18px_70px_rgba(14,165,233,.18)] backdrop-blur-xl ${
        compact ? 'p-2.5' : 'mt-7 p-3 sm:p-4'
      }`}
    >
      <div className="mb-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-sky-100/90 sm:text-[11px]">
        <Clock3 className="h-4 w-4 text-sky-300" />
        Session de lancement
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="min-w-[70px] rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-center">
          <div className="text-2xl font-black tabular-nums text-white sm:text-3xl">
            {String(time.minutes).padStart(2, '0')}
          </div>
          <div className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
            Minutes
          </div>
        </div>
        <div className="text-2xl font-black text-sky-300">:</div>
        <div className="min-w-[70px] rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-center">
          <div className="text-2xl font-black tabular-nums text-white sm:text-3xl">
            {String(time.seconds).padStart(2, '0')}
          </div>
          <div className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
            Secondes
          </div>
        </div>
      </div>
      {!compact && (
        <p className="mt-2 max-w-[290px] text-center text-[10px] leading-4 text-slate-400">
          Le compteur suit votre session et ne modifie pas automatiquement le prix affiché.
        </p>
      )}
    </div>
  );
}

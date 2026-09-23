import Image from 'next/image';

const premiumImageClass =
  'h-auto w-full rounded-[28px] object-cover shadow-[0_30px_100px_rgba(2,132,199,.20)]';

export function HeroProductVisual() {
  return (
    <div className="relative mx-auto mt-8 max-w-6xl">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[42px] bg-[radial-gradient(circle_at_50%_55%,rgba(14,165,233,.18),transparent_62%)] blur-2xl" />
      <Image
        src="/store/premium/hero-fr.png"
        alt="Career Search System TalentiQues : Opportunity Tracker, modèles CV ATS et guide LinkedIn"
        width={1672}
        height={941}
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
        className={premiumImageClass}
      />
    </div>
  );
}

export function TrackerVisual() {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-sky-200/70 bg-[#021127] shadow-[0_30px_80px_rgba(2,132,199,.16)]">
      <Image
        src="/store/premium/tracker-fr.png"
        alt="Opportunity Tracker Pro : dashboard, candidatures, relances, entretiens et suivi recruteurs"
        width={1448}
        height={1086}
        sizes="(max-width: 1024px) 100vw, 560px"
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

export function AtsVisual() {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-violet-200/70 bg-[#03122c] shadow-[0_30px_80px_rgba(124,58,237,.14)]">
      <Image
        src="/store/premium/ats-fr.png"
        alt="CV ATS System : 7 modèles ATS, guide CV complet et guide LinkedIn offert"
        width={1448}
        height={1086}
        sizes="(max-width: 1024px) 100vw, 560px"
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

export function BundleVisual() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-sky-300/25 bg-[#020b1f] shadow-[0_35px_100px_rgba(37,99,235,.24)]">
      <Image
        src="/store/premium/bundle-fr.png"
        alt="Career Search Bundle : Opportunity Tracker Pro, 7 modèles CV ATS et guide LinkedIn"
        width={1672}
        height={941}
        sizes="(max-width: 1024px) 100vw, 1100px"
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

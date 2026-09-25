import Image from 'next/image';

const premiumImageClass =
  'h-auto w-full object-contain sm:rounded-2xl sm:shadow-[0_30px_100px_rgba(2,132,199,.20)]';

export function HeroProductVisual() {
  return (
    <div className="relative -mx-4 w-[calc(100%+2rem)] sm:mx-auto sm:w-full sm:max-w-[800px]">
      <div className="pointer-events-none absolute -inset-6 -z-10 hidden rounded-[42px] bg-[radial-gradient(circle_at_50%_55%,rgba(14,165,233,.18),transparent_62%)] blur-2xl sm:block" />
      <picture>
        <source
          media="(max-width: 639px)"
          srcSet="/store/premium/hero-fr-mobile.webp"
          width="1086"
          height="1448"
        />
        <Image
          src="/store/premium/hero-fr-desktop.webp"
          alt="Career Search System TalentiQues : Opportunity Tracker, modèles CV ATS et guide LinkedIn"
          width={592}
          height={451}
          priority
          sizes="(max-width: 639px) 100vw, (max-width: 863px) calc(100vw - 64px), 800px"
          className={premiumImageClass}
        />
      </picture>
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

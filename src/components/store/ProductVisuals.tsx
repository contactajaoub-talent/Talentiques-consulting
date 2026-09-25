import Image from 'next/image';

export function TrackerVisual() {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-sky-200/70 bg-[#021127] shadow-[0_30px_80px_rgba(2,132,199,.16)]">
      <Image
        src="/store/premium/tracker-fr.png"
        alt="Tracker Candidatures Pro : dashboard, candidatures, relances, entretiens et suivi recruteurs"
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
        alt="CV ATS & LinkedIn Pro : 7 modèles ATS, guide CV complet et guide LinkedIn"
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
        alt="Career Search Bundle : Tracker Candidatures Pro, 7 modèles CV ATS et guide LinkedIn"
        width={1672}
        height={941}
        sizes="(max-width: 1024px) 100vw, 1100px"
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

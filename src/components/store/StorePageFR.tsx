import {
  BarChart3,
  Check,
  Clock3,
  CreditCard,
  FileCheck2,
  Gift,
  Globe2,
  Infinity as InfinityIcon,
  Linkedin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import RecentPurchaseToast from '@/components/store/RecentPurchaseToast';
import StoreCTA from '@/components/store/StoreCTA';
import StoreLanguageSwitcher from '@/components/store/StoreLanguageSwitcher';
import {
  AtsVisual,
  BundleVisual,
  TrackerVisual,
} from '@/components/store/ProductVisuals';
import { STORE_EN_PRODUCTS, STORE_FR_PRODUCTS, type StoreMarket } from '@/lib/store/catalog';
import { getStoreDetailHrefFR } from '@/lib/store/product-details-fr';
import { getStoreDetailHrefEN } from '@/lib/store/product-details-en';

const trackerFeatures = [
  'Suivi des candidatures, statuts, relances et entretiens',
  'Dashboard avec statistiques et priorités',
  'Mini CRM recruteurs / contacts',
  'Scoring des opportunités',
  '2 guides premium inclus',
];

const atsFeatures = [
  '7 modèles CV ATS professionnels et modifiables',
  'Guide CV complet FR + EN',
  'Méthode de personnalisation selon l’offre',
  'Guide LinkedIn offert FR + EN',
  'Réutilisable à chaque nouvelle candidature',
];

const bundleFeatures = [
  'Tracker Candidatures Pro',
  '2 guides premium de recherche & suivi',
  '7 modèles CV ATS',
  'Guide CV ATS complet',
  'Guide LinkedIn offert',
  'Versions FR + EN incluses',
];

const trustItems: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [CreditCard, 'Paiement unique', 'Aucun abonnement'],
  [Zap, 'Accès immédiat', 'Après paiement'],
  [InfinityIcon, 'Réutilisable', 'À vie, sur vos propres recherches'],
  [Globe2, 'FR + EN inclus', 'Ressources bilingues'],
];

const offerFeatures: Record<'tracker' | 'ats' | 'bundle', string[]> = {
  tracker: [
    'Suivi des candidatures et statuts',
    'Tableau de bord clair et priorités',
    'Relances automatiques (J+5)',
    'Entretiens et contacts',
    'Compatible Google Sheets',
  ],
  bundle: [
    'Tracker Candidatures Pro',
    'Modèles CV ATS professionnels',
    'Optimisation LinkedIn',
    '2 guides pratiques',
    'Ressources FR + EN',
  ],
  ats: [
    '7 modèles CV ATS professionnels',
    'Guide CV complet FR + EN',
    'Méthode de personnalisation selon l’offre',
    'Guide LinkedIn FR + EN',
  ],
};

const offerVisuals = {
  tracker: '/store/premium/tracker-fr.png',
  bundle: '/store/premium/bundle-fr.png',
  ats: '/store/premium/ats-fr.png',
} as const;

const benefitItems: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [Clock3, 'Gagnez du temps', 'Vous partez d’un système déjà structuré au lieu de reconstruire votre méthode à chaque recherche.'],
  [Target, 'Restez organisé', 'Candidatures, relances et prochaines actions restent au même endroit.'],
  [TrendingUp, 'Renforcez vos candidatures', 'CV ATS, LinkedIn et suivi travaillent ensemble au lieu d’être des outils isolés.'],
  [RefreshCw, 'Gardez-le dans le temps', 'Vous pouvez réutiliser les fichiers lorsque votre prochaine opportunité arrive.'],
];

const englishTrackerFeatures = ['Application and status tracking', 'Clear dashboard and priorities', 'Recruiter and contact mini CRM', 'Opportunity scoring', '2 premium guides included'];
const englishAtsFeatures = ['7 professional ATS resume templates', 'Complete ATS resume guide', 'Job-specific tailoring method', 'LinkedIn optimization guide', 'Reusable for every future application'];
const englishBundleFeatures = ['Application Tracker Pro', '2 practical guides', '7 professional ATS resume templates', 'Complete ATS resume guide', 'LinkedIn optimization guide', 'English resources'];
const englishOfferFeatures = {
  tracker: ['Application and status tracking', 'Clear dashboard and priorities', 'Automated follow-ups (D+5)', 'Interviews and contacts', 'Google Sheets compatible'],
  bundle: ['Application Tracker Pro', 'Professional ATS resume templates', 'LinkedIn optimization', '2 practical guides', 'English resources'],
  ats: ['7 professional ATS resume templates', 'Complete ATS resume guide', 'Job-specific tailoring method', 'LinkedIn optimization guide'],
};
const englishTrustItems: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [CreditCard, 'One-time payment', 'No subscription'], [Zap, 'Instant access', 'After payment'], [InfinityIcon, 'Reusable', 'For future searches'], [Globe2, 'English edition', 'English resources'],
];
const englishBenefitItems: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [Clock3, 'SAVE TIME', 'Start with a structured system instead of rebuilding your process for every new search.'],
  [Target, 'STAY ORGANIZED', 'Keep applications, follow-ups and next actions in one place.'],
  [TrendingUp, 'STRENGTHEN YOUR APPLICATIONS', 'Make your ATS resume, LinkedIn profile and application process work together.'],
  [RefreshCw, 'USE IT AGAIN', 'Reuse the same resources when your next career opportunity comes up.'],
];

function formatDelta(value: number) {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

function CheckItem({
  children,
  tone = 'sky',
}: {
  children: React.ReactNode;
  tone?: 'sky' | 'violet';
}) {
  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-slate-600">
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white ${
          tone === 'sky' ? 'bg-sky-500' : 'bg-violet-500'
        }`}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span>{children}</span>
    </li>
  );
}

function OfferCard({
  id,
  title,
  description,
  price,
  featured = false,
  compareAt,
  savings,
  bonus,
  bonusDetail,
  market,
  features,
}: {
  id: 'tracker' | 'ats' | 'bundle';
  title: string;
  description: string;
  price: string;
  featured?: boolean;
  compareAt?: string;
  savings?: string;
  bonus?: string;
  bonusDetail?: string;
  market: StoreMarket;
  features: string[];
}) {
  const href = market === 'fr' ? getStoreDetailHrefFR(id) : getStoreDetailHrefEN(id);

  return (
    <article
      className={`relative flex h-full flex-col rounded-[26px] border p-5 text-left transition sm:p-6 ${
        featured
          ? 'z-10 border-sky-400 bg-gradient-to-b from-sky-500/15 to-[#06142d] shadow-[0_0_0_1px_rgba(56,189,248,.28),0_25px_80px_rgba(14,165,233,.30)] lg:-translate-y-3'
          : 'border-white/10 bg-[#07152d] shadow-[0_18px_50px_rgba(0,0,0,.22)]'
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg">
          ★ {market === 'fr' ? 'Offre recommandée' : 'Recommended offer'}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            featured
              ? 'bg-violet-500/20 text-violet-200'
              : 'bg-sky-400/10 text-sky-300'
          }`}
        >
          {id === 'tracker' ? (
            <BarChart3 className="h-5 w-5" />
          ) : id === 'ats' ? (
            <FileCheck2 className="h-5 w-5" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-black leading-tight text-white">{title}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-sky-400/15 bg-[#020b1f]">
        <Image
          src={offerVisuals[id]}
          alt=""
          width={id === 'bundle' ? 1672 : 1448}
          height={id === 'bundle' ? 941 : 1086}
          sizes="(max-width: 1023px) calc(100vw - 72px), 350px"
          className="aspect-[16/9] w-full object-cover"
        />
      </div>

      <div className="mt-6">
        <div className="text-4xl font-black tracking-[-0.04em] text-white">
          {price}
        </div>
        {compareAt && (
          <div className="mt-1 text-xs text-slate-500 line-through">{compareAt}</div>
        )}
        {savings && (
          <div className="mt-2 inline-flex rounded-full bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-sky-200">
            {savings}
          </div>
        )}
      </div>

      <StoreCTA
        href={href}
        productId={id}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-black transition ${
          featured
            ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-[0_12px_35px_rgba(14,165,233,.34)] hover:-translate-y-0.5'
            : 'bg-white text-slate-950 hover:bg-sky-50'
        }`}
      >
        {featured
          ? market === 'fr' ? 'Obtenir le système complet' : 'Get the complete system'
          : id === 'tracker'
            ? market === 'fr' ? 'Organiser ma recherche' : 'Organize my search'
            : market === 'fr' ? 'Renforcer ma candidature' : 'Strengthen my application'}
      </StoreCTA>

      <ul className="mt-6 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-xs leading-5 text-slate-300 sm:text-sm">
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sky-500 text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {bonus && (
        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3.5 text-xs font-black text-sky-100">
            <Gift className="mr-2 inline h-4 w-4 text-sky-400" /> {bonus}
            {bonusDetail && (
              <span className="mt-1 block pl-6 text-[10px] font-medium leading-4 text-slate-400">
                {bonusDetail}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default function StorePageFR({ market = 'fr' }: { market?: StoreMarket }) {
  const isFr = market === 'fr';
  const products = isFr ? STORE_FR_PRODUCTS : STORE_EN_PRODUCTS;
  const detailHref = isFr ? getStoreDetailHrefFR : getStoreDetailHrefEN;
  const selectedTrackerFeatures = isFr ? trackerFeatures : englishTrackerFeatures;
  const selectedAtsFeatures = isFr ? atsFeatures : englishAtsFeatures;
  const selectedBundleFeatures = isFr ? bundleFeatures : englishBundleFeatures;
  const selectedOfferFeatures = isFr ? offerFeatures : englishOfferFeatures;
  const selectedTrustItems = isFr ? trustItems : englishTrustItems;
  const selectedBenefitItems = isFr ? benefitItems : englishBenefitItems;
  const trackerToBundleDelta = isFr ? formatDelta(Number(products.bundle.amount) - Number(products.tracker.amount)) : `$${(Number(products.bundle.amount) - Number(products.tracker.amount)).toFixed(2)}`;
  const atsToBundleDelta = isFr ? formatDelta(Number(products.bundle.amount) - Number(products.ats.amount)) : `$${(Number(products.bundle.amount) - Number(products.ats.amount)).toFixed(2)}`;
  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-24 text-slate-950 md:pb-0">
      <section className="relative overflow-hidden bg-[#020b1f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(14,165,233,.22),transparent_34%),radial-gradient(circle_at_8%_40%,rgba(37,99,235,.16),transparent_28%),radial-gradient(circle_at_94%_44%,rgba(124,58,237,.12),transparent_30%)]" />

        <header className="relative z-40 border-b border-white/[0.07] bg-[#020b1f]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5 sm:px-8">
            <Link href={isFr ? '/' : '/en'} className="text-xl font-black tracking-tight text-white">
              TalentiQues
            </Link>
            <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex">
              <a href="#produits" className="transition hover:text-white">{isFr ? 'Produits' : 'Products'}</a>
              <a href="#bundle" className="transition hover:text-white">Bundle</a>
              <a href="#faq" className="transition hover:text-white">FAQ</a>
            </nav>
            <div className="flex items-center gap-3">
              <StoreLanguageSwitcher market={market} />
            <a
              href="#offres"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_30px_rgba(14,165,233,.28)] sm:px-5 sm:text-sm"
            >
              {isFr ? 'Voir les offres' : 'View offers'} <Zap className="h-4 w-4" />
            </a>
            </div>
          </div>
        </header>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 text-center sm:px-8">
          <div className="mx-auto max-w-4xl pt-9 sm:pt-11">
            <h1 className="text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              Career Search <span className="block text-sky-400 sm:inline">Bundle</span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-[17px] font-bold leading-7 text-slate-100 sm:text-xl">
              {isFr ? 'Le système complet pour structurer votre recherche d’opportunités professionnelles.' : 'The complete system to structure your search for career opportunities.'}
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {isFr ? 'Tracker de candidatures, CV ATS, LinkedIn et guides pratiques réunis pour mieux cibler, candidater et relancer.' : 'Track your opportunities, strengthen your ATS resume, optimize LinkedIn and follow a clear process — all in one place.'}
            </p>
            <p className="mt-3 text-xs font-bold text-sky-200 sm:text-sm">
              {isFr ? 'Paiement unique · Accès immédiat · Réutilisable à vie' : 'One-time payment · Instant access · Reusable for every future search'}
            </p>
          </div>

          <div className="relative mx-auto mt-7 max-w-[960px]">
            <div className="pointer-events-none absolute -inset-5 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,.22),transparent_68%)] blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-sky-400/35 bg-[#03122e] p-1.5 shadow-[0_22px_70px_rgba(14,165,233,.20)] sm:rounded-3xl sm:p-2">
              <div className="aspect-video overflow-hidden rounded-xl bg-black sm:rounded-2xl">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube-nocookie.com/embed/wG9k307FZR8?playsinline=1&rel=0"
                  title={isFr ? 'Présentation du Career Search Bundle TalentiQues' : 'TalentiQues Career Search Bundle presentation'}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 h-4 max-w-6xl bg-gradient-to-b from-transparent to-[#020b1f] sm:h-6" />

          <div
            id="offres"
            className="mx-auto grid max-w-6xl gap-5 text-left lg:grid-cols-3 lg:items-stretch"
          >
            <OfferCard
              id="tracker"
              title={isFr ? 'Tracker Candidatures Pro' : 'Application Tracker Pro'}
              description={isFr ? 'Gardez vos candidatures, relances, entretiens et priorités sous contrôle depuis un seul tableau de bord.' : 'Keep every application, follow-up, interview and priority under control from one dashboard.'}
              price={products.tracker.displayPrice}
              bonus={isFr ? '2 guides premium inclus' : '2 premium guides included'}
              bonusDetail={isFr ? 'Identifier, qualifier et suivre vos opportunités.' : 'Find, qualify and follow your career opportunities.'}
              market={market}
              features={selectedOfferFeatures.tracker}
            />
            <OfferCard
              id="bundle"
              title="Career Search Bundle"
              description={isFr ? 'Réunissez votre organisation, votre CV, votre profil LinkedIn et votre suivi dans un seul système.' : 'Bring your search strategy, resume, LinkedIn profile and follow-up process together in one complete system.'}
              price={products.bundle.displayPrice}
              featured
              compareAt={products.bundle.compareAt}
              savings={products.bundle.savings}
              market={market}
              features={selectedOfferFeatures.bundle}
            />
            <OfferCard
              id="ats"
              title={isFr ? 'CV ATS & LinkedIn Pro' : 'ATS Resume & LinkedIn Pro'}
              description={isFr ? 'Construisez un CV plus adapté aux offres et un profil LinkedIn plus cohérent avec votre recherche.' : 'Build a stronger ATS-friendly resume and a LinkedIn profile aligned with the opportunities you are targeting.'}
              price={products.ats.displayPrice}
              bonus={isFr ? 'Guide LinkedIn inclus' : 'LinkedIn Guide included'}
              bonusDetail={isFr ? 'Une méthode claire pour renforcer votre profil professionnel.' : 'A practical method to strengthen your professional profile.'}
              market={market}
              features={selectedOfferFeatures.ats}
            />
          </div>

          <div className="mx-auto mt-7 grid max-w-6xl grid-cols-2 gap-3 text-left lg:grid-cols-4">
            {selectedTrustItems.map(([Icon, title, detail]) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-[#07152d] p-3.5"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                <div>
                  <div className="text-xs font-black text-white sm:text-sm">{title}</div>
                  <div className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <RecentPurchaseToast hasMobileStickyCta market={market} />

      <section className="bg-white px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">
              {isFr ? 'Pourquoi cet investissement est utile' : 'WHY THIS INVESTMENT STAYS USEFUL'}
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              {isFr ? 'Ce que vous gagnez ne s’arrête pas à une seule candidature.' : 'Built for more than one application.'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              {isFr ? 'Les fichiers sont pensés pour être conservés, adaptés et repris lorsque votre situation professionnelle évolue.' : 'These resources are designed to be kept, adapted and reused as your career goals and opportunities evolve.'}
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {selectedBenefitItems.map(([Icon, title, copy]) => (
              <article
                key={title}
                className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 shadow-[0_14px_45px_rgba(15,23,42,.05)]"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="produits" className="bg-slate-50 px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">
              {isFr ? 'Choisissez votre point de départ' : 'CHOOSE YOUR STARTING POINT'}
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              {isFr ? 'Choisissez votre outil — ou passez au système complet.' : 'Choose your tool — or get the complete system.'}
            </h2>
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[34px] border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1.5 text-xs font-black text-sky-700">
                    <BarChart3 className="h-4 w-4" /> {isFr ? 'Pilotez votre recherche' : 'Take control of your search'}
                  </div>
                  <h3 className="mt-4 text-2xl font-black">{isFr ? 'Tracker Candidatures Pro' : 'Application Tracker Pro'}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    {isFr ? 'Votre centre de contrôle pour garder vos candidatures, vos relances et vos entretiens sous contrôle.' : 'Your control center for keeping applications, follow-ups and interviews organized.'}
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-sky-600 px-4 py-2 text-lg font-black text-white shadow-lg">
                  {products.tracker.displayPrice}
                </div>
              </div>

              <div className="mt-6"><TrackerVisual /></div>
              <ul className="mt-6 space-y-2.5">
                {selectedTrackerFeatures.map((feature) => <CheckItem key={feature}>{feature}</CheckItem>)}
              </ul>

              <div className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-white p-4">
                <div className="flex items-center gap-2 font-black text-sky-800">
                  <Gift className="h-5 w-5" /> {isFr ? '2 guides premium inclus' : '2 premium guides included'}
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {isFr ? 'Identifier & qualifier les opportunités + suivi, relances et entretiens.' : 'Find, qualify and follow your career opportunities.'}
                </p>
              </div>

              <StoreCTA
                href={detailHref('tracker')}
                productId="tracker"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3.5 text-sm font-black text-sky-700 transition hover:bg-sky-50"
              >
                {isFr ? 'Voir le produit en détail' : 'Explore the Tracker'}
              </StoreCTA>
              <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                {isFr ? <>Pour seulement <span className="font-black text-slate-900">+{trackerToBundleDelta}</span>, passez au Bundle et ajoutez tout le système CV.</> : <>Add the complete resume system for only <span className="font-black text-slate-900">+{trackerToBundleDelta}</span>.</>}
              </p>
            </article>

            <article className="rounded-[34px] border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-700">
                    <FileCheck2 className="h-4 w-4" /> {isFr ? 'Renforcez votre candidature' : 'Strengthen your application'}
                  </div>
                  <h3 className="mt-4 text-2xl font-black">{isFr ? 'CV ATS & LinkedIn Pro' : 'ATS Resume & LinkedIn Pro'}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    {isFr ? 'Des modèles professionnels + une méthode complète pour construire et adapter votre candidature.' : 'Professional templates and a clear method to build and tailor stronger applications.'}
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-violet-600 px-4 py-2 text-lg font-black text-white shadow-lg">
                  {products.ats.displayPrice}
                </div>
              </div>

              <div className="mt-6"><AtsVisual /></div>
              <ul className="mt-6 space-y-2.5">
                {selectedAtsFeatures.map((feature) => <CheckItem key={feature} tone="violet">{feature}</CheckItem>)}
              </ul>

              <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-white p-4">
                <div className="flex items-center gap-2 font-black text-violet-800">
                  <Linkedin className="h-5 w-5" /> {isFr ? 'Guide LinkedIn offert' : 'LinkedIn Guide included'}
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {isFr ? 'Un guide dédié pour renforcer le profil qui accompagne vos candidatures.' : 'A practical method to strengthen your professional profile.'}
                </p>
              </div>

              <StoreCTA
                href={detailHref('ats')}
                productId="ats"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-violet-200 bg-white px-5 py-3.5 text-sm font-black text-violet-700 transition hover:bg-violet-50"
              >
                {isFr ? 'Voir le produit en détail' : 'Explore the ATS system'}
              </StoreCTA>
              <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                {isFr ? <>Pour seulement <span className="font-black text-slate-900">+{atsToBundleDelta}</span>, passez au Bundle et ajoutez le Tracker + ses guides.</> : <>Add the Application Tracker Pro and its guides for only <span className="font-black text-slate-900">+{atsToBundleDelta}</span>.</>}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="bundle" className="bg-white px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[40px] border border-sky-200 bg-[#020b1f] p-4 shadow-[0_35px_100px_rgba(37,99,235,.18)] sm:p-6 lg:p-8">
            <BundleVisual />

            <div className="mt-7 grid gap-6 text-white lg:grid-cols-[1fr_340px] lg:items-center">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-sky-300">
                  {isFr ? 'Offre recommandée' : 'RECOMMENDED'}
                </div>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                  {isFr ? 'Tout votre système de recherche. Une seule offre.' : 'Your complete career-search system. One offer.'}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  {isFr ? 'Le Tracker, les modèles CV ATS et les guides fonctionnent ensemble : vous structurez la recherche, améliorez la candidature et suivez les opportunités sans multiplier les outils.' : 'Connect your application, tracking, LinkedIn profile and follow-up process in one reusable system.'}
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {selectedBundleFeatures.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-200">
                      <Check className="h-4 w-4 shrink-0 text-sky-300" /> {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-sky-400/25 bg-white/[0.06] p-6 text-center backdrop-blur-xl">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-sky-300">{isFr ? 'Système complet' : 'Complete system'}</div>
                <div className="mt-2 text-5xl font-black">{products.bundle.displayPrice}</div>
                <div className="mt-1 text-sm text-slate-500 line-through">{products.bundle.compareAt}</div>
                <div className="mt-3 inline-flex rounded-full bg-sky-400/10 px-3 py-1.5 text-xs font-black text-sky-200">{products.bundle.savings}</div>
                <StoreCTA
                  href={detailHref('bundle')}
                  productId="bundle"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-4 text-sm font-black text-white shadow-[0_15px_45px_rgba(14,165,233,.35)]"
                >
                  {isFr ? 'Voir le Bundle en détail' : 'Get the complete system'}
                </StoreCTA>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-slate-50 px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">{isFr ? 'Avant de décider' : 'BEFORE YOU DECIDE'}</div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">{isFr ? 'Questions fréquentes' : 'Frequently asked questions'}</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(isFr ? [
              ['Est-ce un abonnement ?', 'Non. Chaque achat est un paiement unique.'],
              ['Comment vais-je recevoir les fichiers ?', 'Après confirmation du paiement, une page d’accès est débloquée et les accès sont aussi envoyés par e-mail.'],
              ['Puis-je réutiliser les outils ?', 'Oui. Les fichiers sont conçus pour être conservés et adaptés à vos futures recherches.'],
              ['Le Bundle est-il obligatoire ?', 'Non. Les deux produits peuvent être achetés séparément. Le Bundle réunit simplement les deux à un prix plus avantageux.'],
            ] : [
              ['Is this a subscription?', 'No. Every purchase is a one-time payment with no recurring fee.'],
              ['How does access work?', 'Payment confirmation unlocks a secure access page, and your resources are also sent by email.'],
              ['What software do I need?', 'The Tracker works with Google Sheets, and the editable resume templates can be customized in Canva.'],
              ['Can I reuse the resources?', 'Yes. Keep and adapt them for future applications and career opportunities.'],
            ]).map(([question, answer]) => (
              <article key={question} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black text-slate-950">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#020b1f] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(14,165,233,.24),transparent_24%),radial-gradient(circle_at_22%_20%,rgba(59,130,246,.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            {isFr ? 'Investissez une fois.' : 'Invest once.'}{' '}
            <span className="text-sky-400">{isFr ? 'Réutilisez le système à chaque nouvelle opportunité.' : 'Reuse your system for every new career opportunity.'}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            {isFr ? 'Commencez avec l’outil dont vous avez besoin ou choisissez le Bundle pour réunir toute votre recherche dans un seul système.' : 'Start with the tool you need today, or choose the Bundle to bring your entire search process into one system.'}
          </p>
          <StoreCTA
            href={detailHref('bundle')}
            productId="bundle"
            className="mx-auto mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-7 py-4 text-sm font-black text-white shadow-[0_14px_45px_rgba(14,165,233,.35)] transition hover:-translate-y-0.5"
          >
            {isFr ? 'Obtenir le Career Search Bundle' : 'Get the Career Search Bundle'} — {products.bundle.displayPrice}
          </StoreCTA>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            {isFr ? <><span>Paiement unique</span><span>Accès après confirmation</span><span>Aucun abonnement</span><span>FR + EN inclus</span></> : <><span>One-time payment</span><span>No subscription</span><span>Instant access</span></>}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-white/10 bg-[#03122e]/95 p-3 shadow-[0_16px_50px_rgba(2,6,23,.36)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-300">{isFr ? 'Offre recommandée' : 'Recommended offer'}</div>
            <div className="text-sm font-black text-white">Career Search Bundle · {products.bundle.displayPrice}</div>
          </div>
          <StoreCTA
            href={detailHref('bundle')}
            productId="bundle"
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-xs font-black text-white"
            arrow={false}
          >
            {isFr ? 'Voir l’offre' : 'View offer'}
          </StoreCTA>
        </div>
      </div>
    </main>
  );
}

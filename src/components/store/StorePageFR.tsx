import {
  Check,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import RecentPurchaseToast from '@/components/store/RecentPurchaseToast';
import StoreCTA from '@/components/store/StoreCTA';
import StoreLanguageSwitcher from '@/components/store/StoreLanguageSwitcher';
import { BundleVisual } from '@/components/store/ProductVisuals';
import { STORE_EN_PRODUCTS, STORE_FR_PRODUCTS, type StoreMarket } from '@/lib/store/catalog';
import { getStoreDetailHrefFR } from '@/lib/store/product-details-fr';
import { getStoreDetailHrefEN } from '@/lib/store/product-details-en';

const bundleFeatures = [
  'Opportunity Management System',
  '2 guides premium de recherche & suivi',
  '7 modèles CV ATS',
  'Guide CV ATS complet',
  'Guide LinkedIn offert',
  'Versions FR + EN incluses',
];

const benefitItems: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [Clock3, 'Gagnez du temps', 'Vous partez d’un système déjà structuré au lieu de reconstruire votre méthode à chaque recherche.'],
  [Target, 'Restez organisé', 'Candidatures, relances et prochaines actions restent au même endroit.'],
  [TrendingUp, 'Renforcez vos candidatures', 'CV ATS, LinkedIn et suivi travaillent ensemble au lieu d’être des outils isolés.'],
  [RefreshCw, 'Gardez-le dans le temps', 'Vous pouvez réutiliser les fichiers lorsque votre prochaine opportunité arrive.'],
];

const englishBundleFeatures = ['Opportunity Management System', '2 practical guides', '7 professional ATS resume templates', 'Complete ATS resume guide', 'LinkedIn optimization guide', 'English resources'];
const englishBenefitItems: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [Clock3, 'SAVE TIME', 'Start with a structured system instead of rebuilding your process for every new search.'],
  [Target, 'STAY ORGANIZED', 'Keep applications, follow-ups and next actions in one place.'],
  [TrendingUp, 'STRENGTHEN YOUR APPLICATIONS', 'Make your ATS resume, LinkedIn profile and application process work together.'],
  [RefreshCw, 'USE IT AGAIN', 'Reuse the same resources when your next career opportunity comes up.'],
];

export default function StorePageFR({ market = 'fr' }: { market?: StoreMarket }) {
  const isFr = market === 'fr';
  const products = isFr ? STORE_FR_PRODUCTS : STORE_EN_PRODUCTS;
  const detailHref = isFr ? getStoreDetailHrefFR : getStoreDetailHrefEN;
  const selectedBundleFeatures = isFr ? bundleFeatures : englishBundleFeatures;
  const selectedBenefitItems = isFr ? benefitItems : englishBenefitItems;
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
              <a href="#bundle" className="transition hover:text-white">Career Search 360</a>
              <a href="#faq" className="transition hover:text-white">FAQ</a>
            </nav>
            <div className="flex items-center gap-3">
              <StoreLanguageSwitcher market={market} />
            <a
              href="#bundle"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_30px_rgba(14,165,233,.28)] sm:px-5 sm:text-sm"
            >
              {isFr ? 'Voir l’offre' : 'View offer'} <Zap className="h-4 w-4" />
            </a>
            </div>
          </div>
        </header>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 text-center sm:px-8">
          <div className="mx-auto max-w-4xl pt-9 sm:pt-11">
            <h1 className="text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              Career Search <span className="block text-sky-400 sm:inline">360</span>
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
                  title={isFr ? 'Présentation du Career Search 360 TalentiQues' : 'TalentiQues Career Search 360 presentation'}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 h-4 max-w-6xl bg-gradient-to-b from-transparent to-[#020b1f] sm:h-6" />

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

      <section id="bundle" className="bg-white px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[40px] border border-sky-200 bg-[#020b1f] p-4 shadow-[0_35px_100px_rgba(37,99,235,.18)] sm:p-6 lg:p-8">
            <BundleVisual market={market} />

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
                  {isFr ? 'Voir Career Search 360 en détail' : 'Get Career Search 360'}
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
              ['Que contient Career Search 360 ?', 'Le système réunit le suivi des opportunités, les modèles CV ATS et les guides CV et LinkedIn dans une seule offre.'],
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
            {isFr ? 'Career Search 360 réunit toute votre recherche dans un seul système.' : 'Career Search 360 brings your entire search process into one system.'}
          </p>
          <StoreCTA
            href={detailHref('bundle')}
            productId="bundle"
            className="mx-auto mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-7 py-4 text-sm font-black text-white shadow-[0_14px_45px_rgba(14,165,233,.35)] transition hover:-translate-y-0.5"
          >
            {isFr ? 'Obtenir Career Search 360' : 'Get Career Search 360'} — {products.bundle.displayPrice}
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
            <div className="text-sm font-black text-white">Career Search 360 · {products.bundle.displayPrice}</div>
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

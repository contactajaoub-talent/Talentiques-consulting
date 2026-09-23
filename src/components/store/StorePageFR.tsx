import {
  BarChart3,
  BriefcaseBusiness,
  Check,
  Clock3,
  CreditCard,
  FileCheck2,
  Gift,
  Globe2,
  Infinity as InfinityIcon,
  Layers3,
  Linkedin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import LaunchCountdown from '@/components/store/LaunchCountdown';
import StoreCTA from '@/components/store/StoreCTA';
import {
  AtsVisual,
  HeroProductVisual,
  TrackerVisual,
} from '@/components/store/ProductVisuals';
import { STORE_FR_PRODUCTS } from '@/lib/store/catalog';

const trackerFeatures = [
  'Suivi des candidatures, statuts, relances et entretiens',
  'Dashboard avec statistiques et indicateurs utiles',
  'Base de contacts / mini CRM recruteurs',
  'Scoring des opportunités et priorisation',
  'Actions, historique et vues d’analyse',
];

const atsFeatures = [
  '7 modèles CV ATS professionnels et modifiables',
  'Guide CV complet : structure, rédaction et mots-clés',
  'Guide LinkedIn offert',
  'Versions françaises et anglaises incluses',
  'Réutilisable pour chaque nouvelle candidature',
];

const bundleFeatures = [
  'Opportunity Tracker Pro',
  '2 guides premium : opportunités, suivi, relances & entretiens',
  '7 modèles CV ATS',
  'Guide CV ATS complet',
  'Guide LinkedIn offert',
  'Versions FR + EN incluses',
];

const products = STORE_FR_PRODUCTS;

function formatEuroDelta(value: number) {
  const fixed = value.toFixed(2);
  const compact = fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed.replace('.', ',');
  return `${compact} €`;
}

const trackerToBundleDelta = formatEuroDelta(
  Number(products.bundle.amount) - Number(products.tracker.amount)
);
const atsToBundleDelta = formatEuroDelta(
  Number(products.bundle.amount) - Number(products.ats.amount)
);
const bundleSeparateTotal = formatEuroDelta(
  Number(products.tracker.amount) + Number(products.ats.amount)
);

const trustItems: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [CreditCard, 'Paiement unique', 'aucun abonnement'],
  [Zap, 'Accès immédiat', 'après paiement'],
  [ShieldCheck, 'Vous gardez vos fichiers', 'réutilisables'],
  [Globe2, 'FR + EN inclus', 'sur la page française'],
];

const benefitItems: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [Clock3, 'Gagnez du temps', 'Une structure prête à l’emploi pour arrêter de reconstruire votre organisation à chaque recherche.'],
  [Target, 'Restez concentré', 'Vos opportunités, actions et relances sont regroupées au même endroit.'],
  [TrendingUp, 'Renforcez vos candidatures', 'CV ATS, LinkedIn et suivi travaillent ensemble pour une candidature plus cohérente.'],
  [RefreshCw, 'Réutilisez-le', 'Gardez les ressources et reprenez-les à chaque nouvelle étape de votre carrière.'],
];

const bundleBadges: ReadonlyArray<readonly [LucideIcon, string]> = [
  [Zap, 'Accès immédiat'],
  [CreditCard, 'Paiement unique'],
  [InfinityIcon, 'Réutilisable pendant votre carrière'],
];

function CheckItem({
  children,
  tone = 'sky',
}: {
  children: React.ReactNode;
  tone?: 'sky' | 'violet';
}) {
  const circle =
    tone === 'sky' ? 'bg-sky-500 text-white' : 'bg-violet-500 text-white';

  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-slate-600">
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${circle}`}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span>{children}</span>
    </li>
  );
}

function HeroPriceCard({
  id,
  title,
  copy,
  price,
  value,
  featured = false,
  compareAt,
  savings,
}: {
  id: 'tracker' | 'ats' | 'bundle';
  title: string;
  copy: string;
  price: string;
  value: number;
  featured?: boolean;
  compareAt?: string;
  savings?: string;
}) {
  const href = `/outils/checkout?product=${id}`;

  return (
    <article
      className={`relative rounded-[26px] border p-5 text-left transition sm:p-6 ${
        featured
          ? 'z-10 border-sky-400/80 bg-gradient-to-b from-sky-500/15 to-indigo-500/10 shadow-[0_0_0_1px_rgba(56,189,248,.22),0_25px_80px_rgba(14,165,233,.26)] lg:-translate-y-3'
          : 'border-white/10 bg-white/[0.055] shadow-[0_18px_50px_rgba(0,0,0,.18)]'
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg">
          ★ Meilleure valeur
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
            <Layers3 className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-black leading-tight text-white">{title}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">{copy}</p>
        </div>
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
        productName={title}
        value={value}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-black transition ${
          featured
            ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-[0_12px_35px_rgba(14,165,233,.34)] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(14,165,233,.40)]'
            : 'bg-white text-slate-950 hover:bg-sky-50'
        }`}
      >
        {featured
          ? 'Accéder au système complet'
          : id === 'tracker'
            ? 'Découvrir le Tracker'
            : 'Découvrir le système CV'}
      </StoreCTA>
    </article>
  );
}

export default function StorePageFR() {
  const launchEndAt = process.env.NEXT_PUBLIC_STORE_LAUNCH_END_AT || '';

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <section className="relative overflow-hidden bg-[#020b1f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,.20),transparent_35%),radial-gradient(circle_at_8%_34%,rgba(37,99,235,.16),transparent_25%),radial-gradient(circle_at_94%_42%,rgba(59,130,246,.15),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-[36%] h-[360px] bg-[linear-gradient(90deg,transparent,rgba(14,165,233,.07),transparent)] blur-3xl" />

        <header className="relative z-40 border-b border-white/[0.07] bg-[#020b1f]/65 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5 sm:px-8">
            <a href="/" className="text-xl font-black tracking-tight text-white">
              TalentiQues
            </a>
            <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex">
              <a href="#produits" className="transition hover:text-white">
                Outils
              </a>
              <a href="#bundle" className="transition hover:text-white">
                Bundle
              </a>
              <a href="#faq" className="transition hover:text-white">
                FAQ
              </a>
            </nav>
            <a
              href="#offres"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_30px_rgba(14,165,233,.28)] sm:px-5 sm:text-sm"
            >
              Accès immédiat <Zap className="h-4 w-4" />
            </a>
          </div>
        </header>

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 text-center sm:px-8 sm:pt-14 lg:pt-16">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-400/[0.08] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-sky-200 sm:text-xs">
            <Sparkles className="h-4 w-4" /> Outils carrière • paiement unique
          </div>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[1.03] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            Le système simple pour structurer votre recherche et{' '}
            <span className="text-sky-400">accélérer vos opportunités.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Organisez vos candidatures, construisez un CV optimisé ATS,
            améliorez votre profil LinkedIn et gardez le contrôle sur vos
            prochaines actions.
          </p>
          <p className="mx-auto mt-2 max-w-3xl text-sm font-black text-white sm:text-base">
            Un investissement unique que vous pouvez réutiliser tout au long de
            votre carrière.
          </p>

          <HeroProductVisual />
          <LaunchCountdown target={launchEndAt} />

          <div
            id="offres"
            className="mx-auto mt-9 grid max-w-6xl gap-4 text-left lg:grid-cols-3 lg:items-stretch"
          >
            <HeroPriceCard
              id="tracker"
              title={products.tracker.name}
              copy="Suivi des candidatures, relances, entretiens, dashboard et analytics."
              price={products.tracker.displayPrice}
              value={Number(products.tracker.amount)}
            />
            <HeroPriceCard
              id="bundle"
              title={products.bundle.name}
              copy="Le système complet pour mieux chercher, candidater, suivre et relancer."
              price={products.bundle.displayPrice}
              value={Number(products.bundle.amount)}
              featured
              compareAt={products.bundle.compareAt}
              savings={products.bundle.savings}
            />
            <HeroPriceCard
              id="ats"
              title={products.ats.name}
              copy="7 modèles CV ATS, guide complet CV et guide LinkedIn offert."
              price={products.ats.displayPrice}
              value={Number(products.ats.amount)}
            />
          </div>

          <div className="mx-auto mt-7 grid max-w-5xl grid-cols-2 gap-3 text-left sm:grid-cols-4">
            {trustItems.map(([Icon, title, detail]) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3.5"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                <div>
                  <div className="text-xs font-black text-white sm:text-sm">
                    {title}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
                    {detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">
              Votre retour sur investissement
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              Ce que vous gagnez dépasse le prix payé.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Vous n’achetez pas un fichier à utiliser une fois : vous vous
              équipez d’un système réutilisable pour vos prochaines recherches.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefitItems.map(([Icon, title, copy]) => (
              <article
                key={title}
                className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 shadow-[0_14px_45px_rgba(15,23,42,.05)]"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-black text-slate-950">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="produits" className="bg-slate-50 px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">
              Choisissez votre point de départ
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              Deux systèmes. Un même objectif : mieux agir.
            </h2>
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[34px] border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1.5 text-xs font-black text-sky-700">
                    <BarChart3 className="h-4 w-4" /> Pilotez votre recherche
                  </div>
                  <h3 className="mt-4 text-2xl font-black">Opportunity Tracker Pro</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Votre centre de contrôle pour ne plus perdre une opportunité,
                    une relance ou une prochaine action.
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-sky-600 px-4 py-2 text-lg font-black text-white shadow-lg">
                  {products.tracker.displayPrice}
                </div>
              </div>

              <div className="mt-6">
                <TrackerVisual />
              </div>

              <ul className="mt-6 space-y-2.5">
                {trackerFeatures.map((feature) => (
                  <CheckItem key={feature}>{feature}</CheckItem>
                ))}
              </ul>

              <div className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-white p-4">
                <div className="flex items-center gap-2 font-black text-sky-800">
                  <Gift className="h-5 w-5" /> 2 guides premium inclus
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Identifier & qualifier les opportunités + suivi, relances et
                  entretiens.
                </p>
              </div>

              <StoreCTA
                href="/outils/checkout?product=tracker"
                productId="tracker"
                productName="Opportunity Tracker Pro"
                value={Number(products.tracker.amount)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3.5 text-sm font-black text-sky-700 transition hover:bg-sky-50"
              >
                Découvrir le Tracker
              </StoreCTA>
              <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                Passez au Bundle pour seulement{' '}
                <span className="font-black text-slate-900">+{trackerToBundleDelta}</span> et
                obtenez aussi le système CV complet.
              </p>
            </article>

            <article className="rounded-[34px] border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-700">
                    <FileCheck2 className="h-4 w-4" /> Renforcez votre candidature
                  </div>
                  <h3 className="mt-4 text-2xl font-black">CV ATS System</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Des modèles structurés + une méthode complète pour adapter
                    votre CV aux offres et renforcer votre profil LinkedIn.
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-violet-600 px-4 py-2 text-lg font-black text-white shadow-lg">
                  {products.ats.displayPrice}
                </div>
              </div>

              <div className="mt-6">
                <AtsVisual />
              </div>

              <ul className="mt-6 space-y-2.5">
                {atsFeatures.map((feature) => (
                  <CheckItem key={feature} tone="violet">
                    {feature}
                  </CheckItem>
                ))}
              </ul>

              <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-white p-4">
                <div className="flex items-center gap-2 font-black text-violet-800">
                  <Linkedin className="h-5 w-5" /> Guide LinkedIn offert
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Optimisez votre profil pour être mieux trouvé, compris et
                  contacté.
                </p>
              </div>

              <StoreCTA
                href="/outils/checkout?product=ats"
                productId="ats"
                productName="CV ATS System"
                value={Number(products.ats.amount)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-violet-200 bg-white px-5 py-3.5 text-sm font-black text-violet-700 transition hover:bg-violet-50"
              >
                Découvrir le système CV
              </StoreCTA>
              <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                Passez au Bundle pour seulement{' '}
                <span className="font-black text-slate-900">+{atsToBundleDelta}</span> et
                obtenez aussi le Tracker + 2 guides supplémentaires.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="bundle" className="bg-white px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[38px] border border-blue-400/25 bg-[#04122d] p-6 text-white shadow-[0_32px_110px_rgba(30,64,175,.19)] sm:p-10">
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.12fr_.88fr]">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-2 text-xs font-black text-white shadow-lg">
                ★ OFFRE RECOMMANDÉE
              </div>
              <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Tout votre système de recherche d’emploi{' '}
                <span className="text-sky-400">dans une seule offre.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                De l’organisation de vos opportunités à la qualité de votre CV,
                vous disposez d’un ensemble cohérent que vous pourrez reprendre
                à chaque nouvelle recherche.
              </p>

              <div className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {bundleFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-200"
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sky-500">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {bundleBadges.map(([Icon, label]) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-300"
                  >
                    <Icon className="h-4 w-4 text-sky-300" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-[30px] border border-sky-400/30 bg-gradient-to-b from-sky-500/10 to-indigo-500/10 p-6 text-center shadow-[inset_0_1px_rgba(255,255,255,.08)] sm:p-8">
              <div className="mx-auto w-fit rounded-full bg-sky-400/15 px-4 py-1.5 text-xs font-black text-sky-200">
                {products.bundle.savings}
              </div>
              <div className="mt-5 text-sm font-semibold text-slate-300">
                Valeur des deux systèmes séparément
              </div>
              <div className="mt-1 text-sm text-slate-500 line-through">
                {bundleSeparateTotal}
              </div>
              <div className="mt-2 text-6xl font-black tracking-[-0.055em]">
                {products.bundle.displayPrice}
              </div>
              <div className="mt-1 text-xs font-semibold text-sky-200">
                une seule fois
              </div>

              <StoreCTA
                href="/outils/checkout?product=bundle"
                productId="bundle"
                productName="Career Search Bundle"
                value={Number(products.bundle.amount)}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-5 py-4 text-sm font-black text-white shadow-[0_14px_45px_rgba(14,165,233,.35)] transition hover:-translate-y-0.5"
              >
                Je veux le Bundle
              </StoreCTA>
              <p className="mt-4 text-[11px] leading-5 text-slate-400">
                Aucun abonnement • Accès immédiat • FR + EN inclus
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-slate-50 px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">
              Avant de passer à l’action
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">
              Questions fréquentes
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Est-ce un abonnement ?', 'Non. Vous payez une seule fois et vous gardez vos ressources.'],
              ['Quand vais-je recevoir mon accès ?', 'Immédiatement après confirmation du paiement, avec une copie envoyée par e-mail.'],
              ['Pour quels profils ?', 'Étudiant, jeune diplômé, demandeur d’emploi ou professionnel : les outils s’adaptent à votre cible.'],
              ['Puis-je les réutiliser ?', 'Oui. Reprenez-les pour vos futures candidatures et nouvelles étapes de carrière.'],
            ].map(([question, answer]) => (
              <article
                key={question}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500/10 text-sky-600">
                  <TimerReset className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-sm font-black">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#020b1f] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_65%,rgba(14,165,233,.28),transparent_20%),radial-gradient(circle_at_22%_25%,rgba(59,130,246,.15),transparent_26%)]" />
        <div
          className="pointer-events-none absolute bottom-0 left-[-5%] h-32 w-[70%] bg-slate-950/90"
          style={{ clipPath: 'polygon(0 78%, 18% 38%, 35% 70%, 50% 22%, 72% 68%, 100% 28%, 100% 100%, 0 100%)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-[-8%] h-44 w-[65%] bg-slate-900/85"
          style={{ clipPath: 'polygon(0 72%, 22% 42%, 40% 64%, 62% 12%, 76% 52%, 100% 28%, 100% 100%, 0 100%)' }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
            <BriefcaseBusiness className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            Faites un investissement utile aujourd’hui.{' '}
            <span className="text-sky-400">
              Réutilisez-le à chaque opportunité demain.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Des outils concrets pour chercher avec plus de structure, présenter
            une candidature plus solide et garder votre progression sous
            contrôle.
          </p>
          <StoreCTA
            href="/outils/checkout?product=bundle"
            productId="bundle"
            productName="Career Search Bundle"
            value={Number(products.bundle.amount)}
            className="mx-auto mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-7 py-4 text-sm font-black text-white shadow-[0_14px_45px_rgba(14,165,233,.35)] transition hover:-translate-y-0.5"
          >
            Accéder au système complet — {products.bundle.displayPrice}
          </StoreCTA>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span>Paiement unique</span>
            <span>Accès immédiat</span>
            <span>Aucun abonnement</span>
            <span>FR + EN inclus</span>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-white/10 bg-[#03122e]/95 p-3 shadow-[0_16px_50px_rgba(2,6,23,.36)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-300">
              Offre recommandée
            </div>
            <div className="text-sm font-black text-white">
              Bundle • {products.bundle.displayPrice}
            </div>
          </div>
          <StoreCTA
            href="/outils/checkout?product=bundle"
            productId="bundle"
            productName="Career Search Bundle"
            value={Number(products.bundle.amount)}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-xs font-black text-white"
            arrow={false}
          >
            J’y accède
          </StoreCTA>
        </div>
      </div>
    </main>
  );
}

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
import LaunchCountdown from '@/components/store/LaunchCountdown';
import StoreCTA from '@/components/store/StoreCTA';
import {
  AtsVisual,
  BundleVisual,
  HeroProductVisual,
  TrackerVisual,
} from '@/components/store/ProductVisuals';
import { STORE_FR_PRODUCTS } from '@/lib/store/catalog';
import { getStoreDetailHrefFR } from '@/lib/store/product-details-fr';

const products = STORE_FR_PRODUCTS;

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
  'Opportunity Tracker Pro',
  '2 guides premium de recherche & suivi',
  '7 modèles CV ATS',
  'Guide CV ATS complet',
  'Guide LinkedIn offert',
  'Versions FR + EN incluses',
];

const trustItems: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [CreditCard, 'Paiement unique', 'aucun abonnement'],
  [Zap, 'Accès immédiat', 'après confirmation'],
  [InfinityIcon, 'Réutilisable', 'pour vos futures recherches'],
  [Globe2, 'FR + EN inclus', 'sur la version française'],
];

const benefitItems: ReadonlyArray<readonly [LucideIcon, string, string]> = [
  [Clock3, 'Gagnez du temps', 'Vous partez d’un système déjà structuré au lieu de reconstruire votre méthode à chaque recherche.'],
  [Target, 'Restez organisé', 'Candidatures, relances et prochaines actions restent au même endroit.'],
  [TrendingUp, 'Renforcez vos candidatures', 'CV ATS, LinkedIn et suivi travaillent ensemble au lieu d’être des outils isolés.'],
  [RefreshCw, 'Gardez-le dans le temps', 'Vous pouvez réutiliser les fichiers lorsque votre prochaine opportunité arrive.'],
];

function formatDelta(value: number) {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

const trackerToBundleDelta = formatDelta(
  Number(products.bundle.amount) - Number(products.tracker.amount)
);
const atsToBundleDelta = formatDelta(
  Number(products.bundle.amount) - Number(products.ats.amount)
);

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
}: {
  id: 'tracker' | 'ats' | 'bundle';
  title: string;
  description: string;
  price: string;
  featured?: boolean;
  compareAt?: string;
  savings?: string;
}) {
  const href = getStoreDetailHrefFR(id);

  return (
    <article
      className={`relative rounded-[28px] border p-5 text-left transition sm:p-6 ${
        featured
          ? 'z-10 border-sky-400/80 bg-gradient-to-b from-sky-500/15 to-indigo-500/10 shadow-[0_0_0_1px_rgba(56,189,248,.22),0_25px_80px_rgba(14,165,233,.28)] lg:-translate-y-3'
          : 'border-white/10 bg-white/[0.055] shadow-[0_18px_50px_rgba(0,0,0,.18)]'
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg">
          ★ Offre recommandée
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
        value={Number(products[id].amount)}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-black transition ${
          featured
            ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-[0_12px_35px_rgba(14,165,233,.34)] hover:-translate-y-0.5'
            : 'bg-white text-slate-950 hover:bg-sky-50'
        }`}
      >
        {featured
          ? 'Voir le système complet'
          : id === 'tracker'
            ? 'Voir les détails du Tracker'
            : 'Voir les détails du système CV'}
      </StoreCTA>
    </article>
  );
}

export default function StorePageFR() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <section className="relative overflow-hidden bg-[#020b1f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(14,165,233,.22),transparent_34%),radial-gradient(circle_at_8%_40%,rgba(37,99,235,.16),transparent_28%),radial-gradient(circle_at_94%_44%,rgba(124,58,237,.12),transparent_30%)]" />

        <header className="relative z-40 border-b border-white/[0.07] bg-[#020b1f]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5 sm:px-8">
            <a href="/" className="text-xl font-black tracking-tight text-white">
              TalentiQues
            </a>
            <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex">
              <a href="#produits" className="transition hover:text-white">Produits</a>
              <a href="#bundle" className="transition hover:text-white">Bundle</a>
              <a href="#faq" className="transition hover:text-white">FAQ</a>
            </nav>
            <a
              href="#offres"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_30px_rgba(14,165,233,.28)] sm:px-5 sm:text-sm"
            >
              Voir les offres <Zap className="h-4 w-4" />
            </a>
          </div>
        </header>

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 text-center sm:px-8 sm:pt-14 lg:pt-16">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-400/[0.08] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-sky-200 sm:text-xs">
            <Sparkles className="h-4 w-4" /> Outils carrière • paiement unique
          </div>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[1.03] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            Structurez votre recherche. Renforcez vos candidatures.{' '}
            <span className="text-sky-400">Gardez le système pour la suite.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Tracker, CV ATS, LinkedIn et guides pratiques réunis pour vous aider à mieux agir aujourd’hui — et à réutiliser la même base lors de vos prochaines opportunités.
          </p>
          <p className="mx-auto mt-2 max-w-3xl text-sm font-black text-white sm:text-base">
            Un investissement unique. Aucun abonnement. Accès après paiement.
          </p>

          <HeroProductVisual />
          <LaunchCountdown />

          <div
            id="offres"
            className="mx-auto mt-9 grid max-w-6xl gap-4 text-left lg:grid-cols-3 lg:items-stretch"
          >
            <OfferCard
              id="tracker"
              title={products.tracker.name}
              description="Suivi des candidatures, relances, entretiens, dashboard et analytics."
              price={products.tracker.displayPrice}
            />
            <OfferCard
              id="bundle"
              title={products.bundle.name}
              description="Le système complet pour organiser, candidater, suivre et relancer."
              price={products.bundle.displayPrice}
              featured
              compareAt={products.bundle.compareAt}
              savings={products.bundle.savings}
            />
            <OfferCard
              id="ats"
              title={products.ats.name}
              description="7 modèles CV ATS, guide CV complet et guide LinkedIn offert."
              price={products.ats.displayPrice}
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
                  <div className="text-xs font-black text-white sm:text-sm">{title}</div>
                  <div className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">{detail}</div>
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
              Pourquoi cet investissement est utile
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              Ce que vous gagnez ne s’arrête pas à une seule candidature.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Les fichiers sont pensés pour être conservés, adaptés et repris lorsque votre situation professionnelle évolue.
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
              Choisissez votre point de départ
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              Deux produits séparés. Un Bundle qui réunit tout.
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
                    Votre centre de contrôle pour garder vos candidatures, vos relances et vos entretiens sous contrôle.
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-sky-600 px-4 py-2 text-lg font-black text-white shadow-lg">
                  {products.tracker.displayPrice}
                </div>
              </div>

              <div className="mt-6"><TrackerVisual /></div>
              <ul className="mt-6 space-y-2.5">
                {trackerFeatures.map((feature) => <CheckItem key={feature}>{feature}</CheckItem>)}
              </ul>

              <div className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-white p-4">
                <div className="flex items-center gap-2 font-black text-sky-800">
                  <Gift className="h-5 w-5" /> 2 guides premium inclus
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Identifier & qualifier les opportunités + suivi, relances et entretiens.
                </p>
              </div>

              <StoreCTA
                href={getStoreDetailHrefFR('tracker')}
                productId="tracker"
                productName="Opportunity Tracker Pro"
                value={Number(products.tracker.amount)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3.5 text-sm font-black text-sky-700 transition hover:bg-sky-50"
              >
                Voir le produit en détail
              </StoreCTA>
              <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                Pour seulement <span className="font-black text-slate-900">+{trackerToBundleDelta}</span>, passez au Bundle et ajoutez tout le système CV.
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
                    Des modèles professionnels + une méthode complète pour construire et adapter votre candidature.
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-violet-600 px-4 py-2 text-lg font-black text-white shadow-lg">
                  {products.ats.displayPrice}
                </div>
              </div>

              <div className="mt-6"><AtsVisual /></div>
              <ul className="mt-6 space-y-2.5">
                {atsFeatures.map((feature) => <CheckItem key={feature} tone="violet">{feature}</CheckItem>)}
              </ul>

              <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-white p-4">
                <div className="flex items-center gap-2 font-black text-violet-800">
                  <Linkedin className="h-5 w-5" /> Guide LinkedIn offert
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Un guide dédié pour renforcer le profil qui accompagne vos candidatures.
                </p>
              </div>

              <StoreCTA
                href={getStoreDetailHrefFR('ats')}
                productId="ats"
                productName="CV ATS System"
                value={Number(products.ats.amount)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-violet-200 bg-white px-5 py-3.5 text-sm font-black text-violet-700 transition hover:bg-violet-50"
              >
                Voir le produit en détail
              </StoreCTA>
              <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                Pour seulement <span className="font-black text-slate-900">+{atsToBundleDelta}</span>, passez au Bundle et ajoutez le Tracker + ses guides.
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
                  Offre recommandée
                </div>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                  Tout votre système de recherche dans une seule offre.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Le Tracker, les modèles CV ATS et les guides fonctionnent ensemble : vous structurez la recherche, améliorez la candidature et suivez les opportunités sans multiplier les outils.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {bundleFeatures.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-200">
                      <Check className="h-4 w-4 shrink-0 text-sky-300" /> {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-sky-400/25 bg-white/[0.06] p-6 text-center backdrop-blur-xl">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-sky-300">Système complet</div>
                <div className="mt-2 text-5xl font-black">14,90 €</div>
                <div className="mt-1 text-sm text-slate-500 line-through">17,80 € séparément</div>
                <div className="mt-3 inline-flex rounded-full bg-sky-400/10 px-3 py-1.5 text-xs font-black text-sky-200">Économisez 2,90 €</div>
                <StoreCTA
                  href={getStoreDetailHrefFR('bundle')}
                  productId="bundle"
                  productName="Career Search Bundle"
                  value={Number(products.bundle.amount)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-4 text-sm font-black text-white shadow-[0_15px_45px_rgba(14,165,233,.35)]"
                >
                  Voir le Bundle en détail
                </StoreCTA>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-slate-50 px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">Avant de décider</div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">Questions fréquentes</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Est-ce un abonnement ?', 'Non. Chaque achat est un paiement unique.'],
              ['Comment vais-je recevoir les fichiers ?', 'Après confirmation du paiement, une page d’accès est débloquée et les accès sont aussi envoyés par e-mail.'],
              ['Puis-je réutiliser les outils ?', 'Oui. Les fichiers sont conçus pour être conservés et adaptés à vos futures recherches.'],
              ['Le Bundle est-il obligatoire ?', 'Non. Les deux produits peuvent être achetés séparément. Le Bundle réunit simplement les deux à un prix plus avantageux.'],
            ].map(([question, answer]) => (
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
            Faites l’investissement une fois.{' '}
            <span className="text-sky-400">Réutilisez le système à chaque nouvelle opportunité.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Choisissez le produit dont vous avez besoin aujourd’hui — ou prenez le Bundle si vous voulez tout réunir dès maintenant.
          </p>
          <StoreCTA
            href={getStoreDetailHrefFR('bundle')}
            productId="bundle"
            productName="Career Search Bundle"
            value={Number(products.bundle.amount)}
            className="mx-auto mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-7 py-4 text-sm font-black text-white shadow-[0_14px_45px_rgba(14,165,233,.35)] transition hover:-translate-y-0.5"
          >
            Découvrir le Bundle — {products.bundle.displayPrice}
          </StoreCTA>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span>Paiement unique</span><span>Accès après confirmation</span><span>Aucun abonnement</span><span>FR + EN inclus</span>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-white/10 bg-[#03122e]/95 p-3 shadow-[0_16px_50px_rgba(2,6,23,.36)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-300">Offre recommandée</div>
            <div className="text-sm font-black text-white">Bundle • {products.bundle.displayPrice}</div>
          </div>
          <StoreCTA
            href={getStoreDetailHrefFR('bundle')}
            productId="bundle"
            productName="Career Search Bundle"
            value={Number(products.bundle.amount)}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-xs font-black text-white"
            arrow={false}
          >
            Voir l’offre
          </StoreCTA>
        </div>
      </div>
    </main>
  );
}

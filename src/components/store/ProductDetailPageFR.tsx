import {
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Gift,
  Infinity as InfinityIcon,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import LaunchCountdown from '@/components/store/LaunchCountdown';
import RecentPurchaseToast from '@/components/store/RecentPurchaseToast';
import StoreCTA from '@/components/store/StoreCTA';
import StoreLanguageSwitcher from '@/components/store/StoreLanguageSwitcher';
import {
  AtsVisual,
  BundleVisual,
  TrackerVisual,
} from '@/components/store/ProductVisuals';
import { STORE_EN_PRODUCTS, STORE_FR_PRODUCTS, type StoreMarket, type StoreProductId } from '@/lib/store/catalog';
import {
  STORE_PRODUCT_DETAILS_FR,
  getStoreDetailHrefFR,
} from '@/lib/store/product-details-fr';
import { STORE_PRODUCT_DETAILS_EN, getStoreDetailHrefEN } from '@/lib/store/product-details-en';

function ProductVisual({ id }: { id: StoreProductId }) {
  if (id === 'tracker') return <TrackerVisual />;
  if (id === 'ats') return <AtsVisual />;
  return <BundleVisual />;
}

function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-slate-600">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sky-500 text-white">
        <Check className="h-3.5 w-3.5" />
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function ProductDetailPageFR({ productId, market = 'fr' }: { productId: StoreProductId; market?: StoreMarket }) {
  const isFr = market === 'fr';
  const products = isFr ? STORE_FR_PRODUCTS : STORE_EN_PRODUCTS;
  const product = products[productId];
  const detail = isFr ? STORE_PRODUCT_DETAILS_FR[productId] : STORE_PRODUCT_DETAILS_EN[productId];
  const detailHref = isFr ? getStoreDetailHrefFR : getStoreDetailHrefEN;
  const isBundle = productId === 'bundle';
  const upgradeDelta =
    productId === 'tracker'
      ? Number(products.bundle.amount) - Number(product.amount)
      : productId === 'ats'
        ? Number(products.bundle.amount) - Number(product.amount)
        : 0;

  const upgradeLabel = isFr ? upgradeDelta.toFixed(2).replace('.', ',') : upgradeDelta.toFixed(2);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden bg-[#020b1f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,.20),transparent_34%),radial-gradient(circle_at_10%_40%,rgba(37,99,235,.16),transparent_28%),radial-gradient(circle_at_90%_45%,rgba(124,58,237,.14),transparent_28%)]" />

        <header className="relative border-b border-white/[0.07] bg-[#020b1f]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5 sm:px-8">
            <Link href={isFr ? '/' : '/en'} className="text-xl font-black tracking-tight">
              TalentiQues
            </Link>
            <div className="flex items-center gap-4">
              <StoreLanguageSwitcher market={market} />
            <a
              href={isFr ? '/outils' : '/en/tools'}
              className="text-sm font-bold text-slate-300 transition hover:text-white"
            >
              ← {isFr ? 'Retour aux outils' : 'Back to tools'}
            </a>
            </div>
          </div>
        </header>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-400/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-sky-200">
              <Sparkles className="h-4 w-4" /> {detail.eyebrow}
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              {detail.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              {detail.subheadline}
            </p>

            <div className="mt-7 flex flex-wrap items-end gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  {isFr ? 'Tarif de lancement' : 'Launch price'}
                </div>
                <div className="mt-1 text-5xl font-black tracking-[-0.05em]">
                  {product.displayPrice}
                </div>
                {product.compareAt && (
                  <div className="mt-1 text-sm text-slate-500 line-through">
                    {product.compareAt}
                  </div>
                )}
              </div>
              {product.savings && (
                <div className="mb-1 rounded-full bg-sky-400/10 px-4 py-2 text-sm font-black text-sky-200">
                  {product.savings}
                </div>
              )}
            </div>

            <div className="mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [CreditCard, isFr ? 'Paiement unique' : 'One-time payment'],
                [Zap, isFr ? 'Accès immédiat' : 'Instant access'],
                [InfinityIcon, isFr ? 'Réutilisable' : 'Reusable'],
                [ShieldCheck, isFr ? 'Paiement sécurisé' : 'Secure payment'],
              ].map(([Icon, label]) => {
                const IconComponent = Icon as typeof CreditCard;
                return (
                  <div
                    key={label as string}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-xs font-bold text-slate-200"
                  >
                    <IconComponent className="mb-2 h-5 w-5 text-sky-300" />
                    {label as string}
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <StoreCTA
                href={`${isFr ? '/outils' : '/en/tools'}/checkout?product=${productId}`}
                productId={productId}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-7 py-4 text-sm font-black text-white shadow-[0_16px_45px_rgba(14,165,233,.35)] transition hover:-translate-y-0.5"
              >
                {isFr ? 'Accéder maintenant' : 'Get instant access'} — {product.displayPrice}
              </StoreCTA>
              <div className="text-xs leading-5 text-slate-400">
                {isFr ? <>Aucun abonnement.<br />Vos fichiers restent à vous.</> : <>No subscription.<br />Keep your files.</>}
              </div>
            </div>

            <LaunchCountdown compact />
          </div>

          <div className="lg:pl-2">
            <ProductVisual id={productId} />
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.95fr]">
          <article className="rounded-[32px] border border-slate-100 bg-slate-50/70 p-6 sm:p-8">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-sky-600">
              {isFr ? 'Ce que vous gagnez' : 'WHAT YOU GAIN'}
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">
              {isFr ? 'Un outil que vous pouvez réutiliser au-delà de votre recherche actuelle.' : 'A system you can reuse beyond your current search.'}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {detail.outcome}
            </p>
            <ul className="mt-6 space-y-3">
              {detail.benefits.map((item) => (
                <CheckLine key={item}>{item}</CheckLine>
              ))}
            </ul>
          </article>

          <article className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,.07)] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-black text-sky-700">
              <Gift className="h-5 w-5" /> {isFr ? 'Tout ce que vous recevez' : 'Everything you receive'}
            </div>
            <ul className="mt-5 space-y-3">
              {detail.includes.map((item) => (
                <CheckLine key={item}>{item}</CheckLine>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {!isBundle && (
        <section className="px-5 pb-14 sm:px-8 sm:pb-16">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-sky-300/20 bg-[#03122e] text-white shadow-[0_35px_100px_rgba(14,165,233,.20)]">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.15em] text-sky-300">
                  {isFr ? 'Avant de payer, comparez' : 'Complete your system'}
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
                  {isFr ? 'Passez au système complet' : 'Complete your system'}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  {productId === 'tracker'
                    ? isFr ? `Ajoutez le CV ATS & LinkedIn Pro et tous les guides pour seulement +${upgradeLabel} €.` : `Add ATS Resume & LinkedIn Pro and all guides for only +$${upgradeLabel}.`
                    : isFr ? `Ajoutez le Tracker Candidatures Pro et ses guides pour seulement +${upgradeLabel} €.` : `Add Application Tracker Pro and its guides for only +$${upgradeLabel}.`}
                </p>
              </div>
              <StoreCTA
                href={detailHref('bundle')}
                productId="bundle"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-7 py-4 text-sm font-black text-white shadow-[0_15px_45px_rgba(14,165,233,.35)]"
              >
                {isFr ? 'Choisir le Bundle' : 'Choose the Bundle'} — {products.bundle.displayPrice}
              </StoreCTA>
            </div>
          </div>
        </section>
      )}

      <section className="bg-slate-50 px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-sky-600">
              {isFr ? 'Après votre paiement' : 'AFTER PAYMENT'}
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              {isFr ? 'Comment allez-vous recevoir votre achat ?' : 'How will you receive your purchase?'}
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {detail.delivery.map((step, index) => {
              const icons = [CreditCard, CheckCircle2, Mail, Download];
              const Icon = icons[index] || CheckCircle2;
              return (
                <article
                  key={step}
                  className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,.05)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-black text-slate-100">0{index + 1}</div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{step}</p>
                </article>
              );
            })}
          </div>

          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-sky-100 bg-sky-50 p-4 text-center text-sm font-semibold leading-6 text-slate-700">
            {detail.note}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.14em] text-sky-600">
              {isFr ? 'Pour qui ?' : 'WHO IS IT FOR?'}
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">
              {isFr ? 'Conçu pour rester utile quand votre prochaine opportunité arrive.' : 'Designed to stay useful when your next opportunity comes up.'}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {isFr ? 'L’objectif n’est pas de vous vendre un téléchargement isolé, mais de vous donner une base que vous pourrez reprendre, mettre à jour et réutiliser.' : 'This is more than a one-off download: it is a practical foundation you can update, adapt and reuse.'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {detail.idealFor.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-500" />
                <span className="text-sm font-bold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#020b1f] px-5 py-16 text-white sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,.20),transparent_35%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="text-xs font-black uppercase tracking-[0.15em] text-sky-300">
            {isFr ? 'Paiement unique • accès immédiat' : 'One-time payment • instant access'}
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            {isFr ? 'Faites l’investissement une fois. Réutilisez le système à chaque nouvelle opportunité.' : 'Invest once. Reuse your system for every new career opportunity.'}
          </h2>
          <StoreCTA
            href={`${isFr ? '/outils' : '/en/tools'}/checkout?product=${productId}`}
            productId={productId}
            className="mx-auto mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-8 py-4 text-sm font-black text-white shadow-[0_16px_45px_rgba(14,165,233,.35)]"
          >
            {isFr ? 'Continuer vers le paiement' : 'Continue to checkout'} — {product.displayPrice}
          </StoreCTA>
          <div className="mt-4 text-xs text-slate-400">
            {isFr ? 'PayPal sécurisé • aucun abonnement • accès envoyé après confirmation' : 'Secure PayPal checkout • no subscription • access sent after confirmation'}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-white/10 bg-[#03122e]/95 p-3 shadow-[0_16px_50px_rgba(2,6,23,.36)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-300">
              {isBundle ? (isFr ? 'Offre recommandée' : 'Recommended offer') : (isFr ? 'Paiement unique' : 'One-time payment')}
            </div>
            <div className="text-sm font-black text-white">
              {isFr ? (productId === 'tracker'
                ? 'Tracker Candidatures Pro'
                : productId === 'ats'
                  ? 'CV ATS & LinkedIn Pro'
                  : 'Career Search Bundle') : product.name}{' '}
              • {product.displayPrice}
            </div>
          </div>
          <StoreCTA
            href={`${isFr ? '/outils' : '/en/tools'}/checkout?product=${productId}`}
            productId={productId}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-xs font-black text-white"
            arrow={false}
          >
            {isFr ? 'J’y accède' : 'Get access'}
          </StoreCTA>
        </div>
      </div>
      <RecentPurchaseToast hasMobileStickyCta market={market} />
    </main>
  );
}

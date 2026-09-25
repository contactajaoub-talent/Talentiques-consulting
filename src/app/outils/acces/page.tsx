import type { Metadata } from 'next';
import { CheckCircle2, Download, Mail, ShieldCheck } from 'lucide-react';
import { getDeliveryItems } from '@/lib/store/delivery';
import {
  getStoreProduct,
  isStoreMarket,
  isStoreProductId,
} from '@/lib/store/catalog';
import { findStoreOrderByAccessToken } from '@/lib/store/supabase-rest';
import StoreLanguageSwitcher from '@/components/store/StoreLanguageSwitcher';
import type { StoreMarket } from '@/lib/store/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Votre accès | TalentiQues',
  robots: { index: false, follow: false },
};

export async function StoreAccessContent({
  searchParams,
  market = 'fr',
}: {
  searchParams: Promise<{ token?: string }>;
  market?: StoreMarket;
}) {
  const isFr = market === 'fr';
  const { token = '' } = await searchParams;
  const order = token ? await findStoreOrderByAccessToken(token) : null;

  if (
    !order ||
    order.status !== 'paid' ||
    !isStoreProductId(order.product_id) ||
    !isStoreMarket(order.market)
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#020b1f] px-5 text-white">
        <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/[0.06] p-8 text-center backdrop-blur-xl">
          <div className="mb-5 flex justify-end"><StoreLanguageSwitcher market={market} /></div>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-3xl font-black">
            {isFr ? 'Accès non disponible' : 'Access unavailable'}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {isFr ? 'Le lien est invalide ou le paiement n’est pas encore confirmé. Si vous venez de payer, attendez quelques secondes puis actualisez.' : 'This link is invalid or payment has not been confirmed yet. If you just paid, wait a few seconds and refresh the page.'}
          </p>

          <a
            href={isFr ? '/outils' : '/en/tools'}
            className="mt-6 inline-flex rounded-full bg-sky-500 px-6 py-3 text-sm font-black text-white"
          >
            {isFr ? 'Retour aux outils' : 'Back to tools'}
          </a>
        </div>
      </main>
    );
  }

  const product = getStoreProduct(order.product_id, order.market);

  let items: ReturnType<typeof getDeliveryItems> = [];
  let deliveryReady = true;

  try {
    items = getDeliveryItems(
      order.product_id,
      order.market,
      token
    );
  } catch {
    deliveryReady = false;
  }

  return (
    <main className="min-h-screen bg-[#020b1f] px-5 py-12 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between"><a href={isFr ? '/' : '/en'} className="text-2xl font-black tracking-tight">TalentiQues</a><StoreLanguageSwitcher market={market} /></div>

        <div className="mt-10 rounded-[36px] border border-sky-400/20 bg-white p-6 text-slate-900 shadow-[0_30px_100px_rgba(14,165,233,.20)] sm:p-10">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
            {isFr ? 'Paiement confirmé' : 'Payment confirmed'}
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            {isFr ? 'Votre accès à' : 'Your access to'} {product.name} {isFr ? 'est prêt.' : 'is ready.'}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            {isFr ? 'Ces ressources restent à votre disposition et peuvent être réutilisées à chaque nouvelle recherche ou opportunité professionnelle.' : 'Keep these resources and reuse them for every future application or career opportunity.'}
          </p>

          {deliveryReady ? (
            <div className="mt-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-black text-slate-950">
                      {item.label}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <a
                    href={item.url}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700"
                  >
                    <Download className="h-4 w-4" />
                    {isFr ? 'Télécharger' : 'Download'}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              {isFr ? 'Le paiement est bien confirmé. La livraison automatique n’est pas encore configurée sur cet environnement. Votre commande reste enregistrée et peut être renvoyée dès que les liens sont activés.' : 'Payment is confirmed, but automatic delivery is not configured in this environment yet. Your order is saved and can be resent once the delivery links are active.'}
            </div>
          )}

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-slate-600">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />

            {isFr ? 'Une copie de vos accès est également envoyée à l’adresse e-mail de votre paiement PayPal lorsque la livraison automatique est activée.' : 'A copy of your access links is also sent to your checkout email when automatic delivery is enabled.'}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StoreAccessPage(props: { searchParams: Promise<{ token?: string }> }) {
  return <StoreAccessContent {...props} />;
}

import Link from 'next/link';
import type { StoreMarket } from '@/lib/store/catalog';
import { CheckCircle2, Download, Mail, ShieldCheck } from 'lucide-react';
import { getDeliveryItems } from '@/lib/store/delivery';
import {
  getStoreProduct,
  isStoreMarket,
  isStoreProductId,
} from '@/lib/store/catalog';
import { findStoreOrderByAccessToken } from '@/lib/store/supabase-rest';

export default async function StoreAccessPage({
  searchParams,
  market = 'fr',
}: {
  searchParams: Promise<{ token?: string }>;
  market?: StoreMarket;
}) {
  const en = market === 'en';
  const t = (fr: string, english: string) => en ? english : fr;
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
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-3xl font-black">
            {t('Accès non disponible', 'Access unavailable')}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {t('Le lien est invalide ou le paiement n’est pas encore confirmé. Si vous venez de payer, attendez quelques secondes puis actualisez.', 'This link is invalid or payment has not yet been confirmed. If you just paid, wait a moment and refresh this page.')}
          </p>

          <a
            href={en ? '/en/tools' : '/outils'}
            className="mt-6 inline-flex rounded-full bg-sky-500 px-6 py-3 text-sm font-black text-white"
          >
            {t('Retour aux outils', 'Back to tools')}
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
        <Link
          href={en ? '/en' : '/'}
          className="text-2xl font-black tracking-tight"
        >
          TalentiQues
        </Link>

        <div className="mt-10 rounded-[36px] border border-sky-400/20 bg-white p-6 text-slate-900 shadow-[0_30px_100px_rgba(14,165,233,.20)] sm:p-10">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
            {t('Paiement confirmé', 'Payment confirmed')}
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            {en ? `Your ${product.name} resources are ready.` : `Votre accès à ${product.name} est prêt.`}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            {t('Ces ressources restent à votre disposition et peuvent être réutilisées à chaque nouvelle recherche ou opportunité professionnelle.', 'Download your resources and keep them for your next career move. One-time payment. No subscription.')}
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
                      {en && order.market === 'fr' ? 'French and English editions included with your purchase.' : item.description}
                    </p>
                  </div>

                  <a
                    href={item.url}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700"
                  >
                    <Download className="h-4 w-4" />
                    {t('Télécharger', 'Download')}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              {t('Le paiement est bien confirmé. Votre commande reste enregistrée. Contactez notre équipe si vos ressources ne sont pas disponibles.', 'Your payment is confirmed and your order is saved. Please contact our team if your downloads are unavailable.')}
            </div>
          )}

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-slate-600">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />

            <span>{t('Vos accès sont également envoyés à l’adresse e-mail enregistrée lors de votre commande. Besoin d’aide ?', 'Your access link is also sent to the email recorded with your order. Need help?')}{' '}<a href="mailto:talentiques@gmail.com" className="underline">talentiques@gmail.com</a></span>
          </div>
        </div>
      </div>
    </main>
  );
}

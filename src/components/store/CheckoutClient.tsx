'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import type { StoreProduct, StoreTracking } from '@/lib/store/catalog';
import { STORE_TRACKING_KEYS } from '@/lib/store/catalog';



const assuranceItems: ReadonlyArray<readonly [string, LucideIcon]> = [
  ['Paiement unique', CreditCard],
  ['Accès immédiat', CheckCircle2],
  ['Paiement sécurisé', ShieldCheck],
];

function getTrackingFromLocation(): StoreTracking {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const tracking: StoreTracking = {};

  for (const key of STORE_TRACKING_KEYS) {
    const value = params.get(key);
    if (value) tracking[key] = value.slice(0, 500);
  }

  return tracking;
}

export default function CheckoutClient({
  product,
  clientId,
}: {
  product: StoreProduct;
  clientId: string;
}) {
  const rendered = useRef(false);
  const consentRef = useRef(false);
  const [digitalConsent, setDigitalConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    consentRef.current = digitalConsent;
  }, [digitalConsent]);

  async function renderPayPal() {
    if (!window.paypal || rendered.current) return;
    rendered.current = true;

    try {
      await window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            shape: 'pill',
            label: 'paypal',
            height: 48,
          },
          createOrder: async () => {
            if (!consentRef.current) {
              setStatus('error');
              setError(
                'Pour recevoir le contenu immédiatement après paiement, confirmez d’abord votre demande d’accès immédiat.'
              );
              throw new Error('Consentement au contenu numérique requis');
            }

            setStatus('processing');
            setError('');

            window.fbq?.('track', 'InitiateCheckout', {
              value: Number(product.amount),
              currency: product.currency,
              content_name: product.name,
              content_ids: [product.id],
              content_type: 'product',
            });
            window.gtag?.('event', 'begin_checkout', {
              currency: product.currency,
              value: Number(product.amount),
              items: [
                {
                  item_id: product.id,
                  item_name: product.name,
                  price: Number(product.amount),
                  quantity: 1,
                },
              ],
            });

            const response = await fetch('/api/store/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: product.id,
                market: product.market,
                tracking: getTrackingFromLocation(),
                digitalContentConsent: true,
              }),
            });

            const payload = await response.json();
            if (!response.ok || !payload?.id) {
              throw new Error(payload?.error || 'Paiement indisponible');
            }

            return payload.id;
          },
          onApprove: async (data: { orderID?: string }) => {
            if (!data.orderID) throw new Error('Référence PayPal manquante');
            setStatus('processing');

            const response = await fetch('/api/store/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID }),
            });

            const payload = await response.json();
            if (!response.ok || !payload?.ok || !payload?.accessToken) {
              throw new Error(
                payload?.error || 'La confirmation du paiement a échoué'
              );
            }

            window.fbq?.('track', 'Purchase', {
              value: Number(payload.amount || product.amount),
              currency: payload.currency || product.currency,
              content_name: product.name,
              content_ids: [product.id],
              content_type: 'product',
            });
            window.gtag?.('event', 'purchase', {
              transaction_id: data.orderID,
              currency: payload.currency || product.currency,
              value: Number(payload.amount || product.amount),
              items: [
                {
                  item_id: product.id,
                  item_name: product.name,
                  price: Number(payload.amount || product.amount),
                  quantity: 1,
                },
              ],
            });

            window.location.assign(
              `/outils/acces?token=${encodeURIComponent(payload.accessToken)}`
            );
          },
          onCancel: () => {
            setStatus('idle');
          },
          onError: (reason: unknown) => {
            console.error('PayPal checkout error', reason);
            setStatus('error');
            setError(
              'Le paiement n’a pas pu être finalisé. Vous pouvez réessayer sans être débité deux fois.'
            );
          },
        })
        .render('#talentiques-paypal-buttons');

      setStatus('idle');
    } catch (reason) {
      console.error('PayPal render error', reason);
      setStatus('error');
      setError('Le module de paiement PayPal est momentanément indisponible.');
    }
  }

  return (
    <div className="min-h-screen bg-[#020b1f] px-5 py-10 text-white sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="pt-3">
          <a
            href="/outils"
            className="text-2xl font-black tracking-tight text-white"
          >
            TalentiQues
          </a>

          <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-200">
            <LockKeyhole className="h-4 w-4" /> Paiement sécurisé
          </div>

          <h1 className="mt-5 max-w-xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Finalisez votre accès à{' '}
            <span className="text-sky-400">{product.name}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Paiement unique. Aucun abonnement. Après confirmation, votre accès
            est disponible immédiatement et envoyé par e-mail.
          </p>

          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {assuranceItems.map(([label, Icon]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-semibold text-slate-200"
              >
                <Icon className="mb-3 h-5 w-5 text-sky-300" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white p-6 text-slate-900 shadow-[0_35px_100px_rgba(14,165,233,.18)] sm:p-8">
          <div className="text-sm font-bold uppercase tracking-[0.12em] text-sky-600">
            Votre commande
          </div>
          <h2 className="mt-3 text-2xl font-black">{product.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {product.description}
          </p>

          <div className="my-6 h-px bg-slate-200" />

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-400">
                Total à payer
              </div>
              <div className="mt-1 text-4xl font-black tracking-tight text-slate-950">
                {product.displayPrice}
              </div>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
              Aucun abonnement
            </div>
          </div>

          {product.compareAt && (
            <div className="mt-2 text-sm text-slate-400">
              <span className="line-through">{product.compareAt}</span>
              {product.savings && (
                <span className="ml-2 font-bold text-sky-700">
                  {product.savings}
                </span>
              )}
            </div>
          )}

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-600">
              <input
                type="checkbox"
                checked={digitalConsent}
                onChange={(event) => {
                  setDigitalConsent(event.target.checked);
                  setError('');
                  if (status === 'error') setStatus('idle');
                }}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                Je demande l’accès immédiat au contenu numérique avant la fin du
                délai de rétractation et reconnais qu’une fois l’accès fourni, je
                perdrai mon droit de rétractation applicable à ce contenu.{' '}
                <a
                  href="/conditions-generales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sky-700 underline underline-offset-2"
                >
                  Conditions générales
                </a>
                .
              </span>
            </label>
          </div>

          <div className="mt-5 min-h-[160px]">
            {clientId ? (
              <>
                <div
                  className={digitalConsent ? 'block' : 'hidden'}
                  id="talentiques-paypal-buttons"
                />
                {!digitalConsent && (
                  <div className="grid min-h-[120px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm font-semibold leading-6 text-slate-500">
                    Cochez la confirmation ci-dessus pour afficher le paiement PayPal.
                  </div>
                )}
                <Script
                  src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
                    clientId
                  )}&currency=${product.currency}&intent=capture&components=buttons`}
                  strategy="afterInteractive"
                  onLoad={renderPayPal}
                  onError={() => {
                    setStatus('error');
                    setError('Impossible de charger PayPal. Réessayez dans un instant.');
                  }}
                />
              </>
            ) : (
              <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Le paiement n’est pas encore configuré sur cet environnement.
              </div>
            )}
          </div>

          {status === 'processing' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Confirmation en
              cours…
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
              {error}
            </div>
          )}

          <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
            Le montant du produit est fixé côté serveur. Aucune donnée bancaire
            n’est enregistrée par TalentiQues.
          </p>
        </div>
      </div>
    </div>
  );
}

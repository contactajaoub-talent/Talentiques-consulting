'use client';

import Script from 'next/script';
import { readStoreAttribution } from '@/lib/store/attribution';
import { useEffect, useRef, useState } from 'react';
import {
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { StoreProduct, StoreTracking } from '@/lib/store/catalog';
import {
  trackStoreCheckoutStarted,
  trackStorePurchaseOnce,
} from '@/lib/store/analytics';
import {
  STORE_CUSTOMER_STATUSES,
  validateStoreCustomerInput,
  type StoreCustomerField,
  type StoreCustomerInput,
} from '@/lib/store/customer';

const assuranceItems: ReadonlyArray<readonly [string, LucideIcon]> = [
  ['Paiement unique', CreditCard],
  ['Accès immédiat', CheckCircle2],
  ['Paiement sécurisé', ShieldCheck],
];

const emptyCustomer: StoreCustomerInput = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  currentStatus: '',
};

const inputClassName =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10';

function getTrackingFromLocation(): StoreTracking {
  return readStoreAttribution();
}

export default function CheckoutClient({
  product,
  clientId,
}: {
  product: StoreProduct;
  clientId: string;
}) {
  const en = product.market === 'en';
  const t = (fr: string, english: string) => en ? english : fr;
  const englishStatuses = ['Student', 'Recent graduate', 'Job seeker', 'Employed', 'Career changer', 'Freelancer / Self-employed', 'Other'];
  const englishErrors: Record<StoreCustomerField, string> = {
    fullName: 'Enter your full name.', email: 'Enter a valid email address.',
    phone: 'Enter a valid phone number.', country: 'Enter your country.', currentStatus: 'Select your current situation.',
  };
  const rendered = useRef(false);
  const consentRef = useRef(false);
  const customerRef = useRef<StoreCustomerInput>(emptyCustomer);
  const checkoutStartedRef = useRef(false);
  const [customer, setCustomer] =
    useState<StoreCustomerInput>(emptyCustomer);
  const [touched, setTouched] = useState<
    Partial<Record<StoreCustomerField, boolean>>
  >({});
  const [digitalConsent, setDigitalConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    consentRef.current = digitalConsent;
  }, [digitalConsent]);

  useEffect(() => {
    customerRef.current = customer;
  }, [customer]);

  const customerValidation = validateStoreCustomerInput(customer);
  const customerIsValid = customerValidation.success;
  const canPay = customerIsValid && digitalConsent;

  function updateCustomer(field: StoreCustomerField, value: string) {
    setCustomer((current) => {
      const next = { ...current, [field]: value };
      customerRef.current = next;
      return next;
    });
    setError('');
    if (status === 'error') setStatus('idle');
  }

  function finishCustomerField(field: StoreCustomerField) {
    setTouched((current) => ({ ...current, [field]: true }));
    setCustomer((current) => {
      const next = {
        ...current,
        [field]:
        field === 'email'
          ? current[field].trim().toLowerCase()
          : current[field].trim(),
      };
      customerRef.current = next;
      return next;
    });
  }

  function fieldError(field: StoreCustomerField) {
    return touched[field] && !customerValidation.success
      ? (customerValidation.errors[field] ? (en ? englishErrors[field] : customerValidation.errors[field]) : undefined)
      : undefined;
  }

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
            const customerResult = validateStoreCustomerInput(
              customerRef.current
            );

            if (!customerResult.success) {
              setTouched({
                fullName: true,
                email: true,
                phone: true,
                country: true,
                currentStatus: true,
              });
              setStatus('error');
              setError(
                t('Complétez correctement toutes vos informations avant de payer.', 'Complete all your details before paying.')
              );
              throw new Error('Informations client invalides');
            }

            if (!consentRef.current) {
              setStatus('error');
              setError(
                t('Pour recevoir le contenu immédiatement après paiement, confirmez d’abord votre demande d’accès immédiat.', 'Confirm your request for immediate access before paying.')
              );
              throw new Error('Consentement au contenu numérique requis');
            }

            setStatus('processing');
            setError('');

            if (!checkoutStartedRef.current) {
              checkoutStartedRef.current = true;
              trackStoreCheckoutStarted(product);
            }

            const response = await fetch('/api/store/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: product.id,
                market: product.market,
                tracking: getTrackingFromLocation(),
                digitalContentConsent: true,
                customer: customerResult.data,
              }),
            });

            const payload = await response.json();
            if (!response.ok || !payload?.id) {
              throw new Error(en ? 'Payment is currently unavailable.' : payload?.error || 'Paiement indisponible');
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
                en ? 'Payment confirmation failed.' : payload?.error || 'La confirmation du paiement a échoué'
              );
            }

            trackStorePurchaseOnce({
              product,
              transactionId: data.orderID,
              amount: Number(payload.amount || product.amount),
              currency: payload.currency || product.currency,
            });

            window.location.assign(
              `${en ? '/en/tools/access' : '/outils/acces'}?token=${encodeURIComponent(payload.accessToken)}`
            );
          },
          onCancel: () => {
            setStatus('idle');
          },
          onError: (reason: unknown) => {
            console.error('PayPal checkout error', reason);
            setStatus('error');
            setError(
              t('Le paiement n’a pas pu être finalisé. Vous pouvez réessayer sans être débité deux fois.', 'Your payment could not be completed. Please check your payment status before trying again.')
            );
          },
        })
        .render('#talentiques-paypal-buttons');

      setStatus('idle');
    } catch (reason) {
      console.error('PayPal render error', reason);
      setStatus('error');
      setError(t('Le module de paiement PayPal est momentanément indisponible.', 'PayPal is temporarily unavailable. Please try again later.'));
    }
  }

  return (
    <div data-clarity-mask="true" className="min-h-screen bg-[#020b1f] px-5 py-10 text-white sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="pt-3">
          <a
            href={en ? '/en/tools' : '/outils'}
            className="text-2xl font-black tracking-tight text-white"
          >
            TalentiQues
          </a>

          <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-200">
            <LockKeyhole className="h-4 w-4" /> {t('Paiement sécurisé', 'Secure checkout')}
          </div>

          <h1 className="mt-5 max-w-xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            {t('Finalisez votre accès à', 'Get access to')}{' '}
            <span className="text-sky-400">{product.name}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            {t('Paiement unique. Aucun abonnement. Après confirmation, votre accès est disponible immédiatement et envoyé par e-mail.', 'One payment. No subscription. Your resources are available as soon as payment is confirmed, with an access link sent to your email.')}
          </p>

          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {assuranceItems.map(([label, Icon], index) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-semibold text-slate-200"
              >
                <Icon className="mb-3 h-5 w-5 text-sky-300" />
                {en ? ['One-time payment', 'Instant access', 'Secure payment'][index] : label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white p-6 text-slate-900 shadow-[0_35px_100px_rgba(14,165,233,.18)] sm:p-8">
          <div className="text-sm font-bold uppercase tracking-[0.12em] text-sky-600">
            {t('Votre commande', 'Order summary')}
          </div>
          <h2 className="mt-3 text-2xl font-black">{product.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {product.description}
          </p>

          <div className="my-6 h-px bg-slate-200" />

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-400">
                {t('Total à payer', 'Order total (USD)')}
              </div>
              <div className="mt-1 text-4xl font-black tracking-tight text-slate-950">
                {product.displayPrice}
              </div>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
              {t('Aucun abonnement', 'No subscription')}
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

          <div className="mt-7 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-600 text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-950">
                  {t('Vos informations', 'Your information')}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {t('Ces informations nous permettent de préparer votre accès et de vous envoyer vos ressources après le paiement.', 'We use these details to prepare your access and email your resources after payment.')}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-sky-600" /> {t('Nom complet', 'Full name')}
                </span>
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  required
                  maxLength={150}
                  value={customer.fullName}
                  onChange={(event) =>
                    updateCustomer('fullName', event.target.value)
                  }
                  onBlur={() => finishCustomerField('fullName')}
                  placeholder={t('Ex. Marie Dupont', 'e.g. Alex Morgan')}
                  aria-invalid={Boolean(fieldError('fullName'))}
                  className={inputClassName}
                />
                {fieldError('fullName') && (
                  <span className="mt-1.5 block text-xs font-semibold text-red-600">
                    {fieldError('fullName')}
                  </span>
                )}
              </label>

              <label className="block text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-sky-600" /> {t('E-mail', 'Email')}
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={customer.email}
                  onChange={(event) =>
                    updateCustomer('email', event.target.value)
                  }
                  onBlur={() => finishCustomerField('email')}
                  placeholder={t('vous@email.com', 'you@example.com')}
                  aria-invalid={Boolean(fieldError('email'))}
                  className={inputClassName}
                />
                {fieldError('email') && (
                  <span className="mt-1.5 block text-xs font-semibold text-red-600">
                    {fieldError('email')}
                  </span>
                )}
              </label>

              <label className="block text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-sky-600" /> {t('Téléphone / WhatsApp', 'Phone / WhatsApp')}
                </span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  required
                  maxLength={50}
                  value={customer.phone}
                  onChange={(event) =>
                    updateCustomer('phone', event.target.value)
                  }
                  onBlur={() => finishCustomerField('phone')}
                  placeholder={t('+33 6 00 00 00 00', '+1 202 555 0123')}
                  aria-invalid={Boolean(fieldError('phone'))}
                  className={inputClassName}
                />
                {fieldError('phone') && (
                  <span className="mt-1.5 block text-xs font-semibold text-red-600">
                    {fieldError('phone')}
                  </span>
                )}
              </label>

              <label className="block text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-sky-600" /> {t('Pays', 'Country')}
                </span>
                <input
                  type="text"
                  name="country"
                  autoComplete="country-name"
                  required
                  maxLength={100}
                  value={customer.country}
                  onChange={(event) =>
                    updateCustomer('country', event.target.value)
                  }
                  onBlur={() => finishCustomerField('country')}
                  placeholder={t('Ex. France', 'e.g. United States')}
                  aria-invalid={Boolean(fieldError('country'))}
                  className={inputClassName}
                />
                {fieldError('country') && (
                  <span className="mt-1.5 block text-xs font-semibold text-red-600">
                    {fieldError('country')}
                  </span>
                )}
              </label>

              <label className="block text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-sky-600" />
                  {t('Situation actuelle', 'Current situation')}
                </span>
                <select
                  name="currentStatus"
                  required
                  value={customer.currentStatus}
                  onChange={(event) =>
                    updateCustomer('currentStatus', event.target.value)
                  }
                  onBlur={() => finishCustomerField('currentStatus')}
                  aria-invalid={Boolean(fieldError('currentStatus'))}
                  className={inputClassName}
                >
                  <option value="">{t('Sélectionnez votre situation', 'Select your current situation')}</option>
                  {STORE_CUSTOMER_STATUSES.map((option, index) => (
                    <option key={option} value={option}>
                      {en ? englishStatuses[index] : option}
                    </option>
                  ))}
                </select>
                {fieldError('currentStatus') && (
                  <span className="mt-1.5 block text-xs font-semibold text-red-600">
                    {fieldError('currentStatus')}
                  </span>
                )}
              </label>
            </div>
          </div>

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
                {t('Je demande l’accès immédiat au contenu numérique avant la fin du délai de rétractation et reconnais qu’une fois l’accès fourni, je perdrai mon droit de rétractation applicable à ce contenu.', 'I request immediate access to the digital content before the withdrawal period ends and acknowledge that, once access is provided, I lose the applicable right of withdrawal for this content.')}{' '}
                <a
                  href={en ? '/en/terms' : '/conditions-generales'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sky-700 underline underline-offset-2"
                >
                  {t('Conditions générales', 'Terms and conditions')}
                </a>
                .
              </span>
            </label>
          </div>

          <div className="mt-5 min-h-[160px]">
            {clientId ? (
              <>
                <div
                  className={canPay ? 'block' : 'hidden'}
                  id="talentiques-paypal-buttons"
                />
                {!canPay && (
                  <div className="grid min-h-[120px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm font-semibold leading-6 text-slate-500">
                    {customerIsValid
                      ? t('Cochez la confirmation ci-dessus pour afficher le paiement PayPal.', 'Confirm immediate access above to continue with PayPal.')
                      : t('Complétez vos informations pour accéder au paiement PayPal.', 'Complete your information to continue with PayPal.')}
                  </div>
                )}
                <Script
                  src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
                    clientId
                  )}&currency=${product.currency}&intent=capture&components=buttons&locale=${en ? 'en_US' : 'fr_FR'}`}
                  strategy="afterInteractive"
                  onLoad={renderPayPal}
                  onError={() => {
                    setStatus('error');
                    setError(t('Impossible de charger PayPal. Réessayez dans un instant.', 'Unable to load PayPal. Please try again shortly.'));
                  }}
                />
              </>
            ) : (
              <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                {t('Le paiement n’est pas encore configuré sur cet environnement.', 'Checkout is currently unavailable. Please contact support.')}
              </div>
            )}
          </div>

          {status === 'processing' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" /> {t('Confirmation en cours…', 'Confirming your payment…')}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
              {error}
            </div>
          )}

          <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
            {t('Le montant du produit est fixé côté serveur. Aucune donnée bancaire n’est enregistrée par TalentiQues.', 'PayPal processes your payment securely. TalentiQues does not store your card details.')}
          </p>
        </div>
      </div>
    </div>
  );
}

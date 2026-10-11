'use client';

import Script from 'next/script';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, CreditCard, Landmark, LockKeyhole, MessageCircle } from 'lucide-react';
import { getTransferWhatsAppUrl, moroccanBanks, type Locale } from './content';
import s from './career-search.module.css';

type Field = 'name' | 'email' | 'country';
type Status = 'idle' | 'processing' | 'success' | 'error';
type ButtonState = 'loading' | 'ready' | 'unavailable' | 'error';
export default function Checkout({ locale, countries }: { locale: Locale; countries: { code: string; name: string }[] }) {
  const t = (fr: string, en: string) => locale === 'fr' ? fr : en;
  const [customer, setCustomer] = useState({ name: '', email: '', country: '' });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [method, setMethod] = useState<'paypal' | 'card' | 'transfer'>('paypal');
  const [bankId, setBankId] = useState('');
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const [sdkReady, setSdkReady] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const statusRef = useRef<Status>('idle');
  const createPending = useRef(false);
  const capturePending = useRef(false);
  const gate = useRef({ ready: false, method, customer, locale });
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [buttons, setButtons] = useState<Record<'paypal' | 'card', ButtonState>>({ paypal: 'loading', card: 'loading' });
  const nameValid = customer.name.trim().length >= 2 && customer.name.trim().length <= 120;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()) && customer.email.length <= 254;
  const countryValid = countries.some(country => country.code === customer.country);
  const ready = nameValid && emailValid && countryValid;
  const locked = status === 'processing' || status === 'success';
  useEffect(() => { gate.current = { ready, method, customer, locale }; }, [ready, method, customer, locale]);
  useEffect(() => {
    if (!sdkReady) return;
    const paypal = window.paypal;
    if (!paypal?.FUNDING) {
      setButtons({ paypal: 'error', card: 'error' });
      return;
    }
    let disposed = false;
    const instances: ReturnType<typeof paypal.Buttons>[] = [];
    const transition = (next: Status) => {
      statusRef.current = next;
      if (!disposed) setStatus(next);
    };
    const callbacks: PayPalButtonsOptions = {
      createOrder: async () => {
        if (createPending.current || statusRef.current === 'processing' || statusRef.current === 'success') throw new Error('checkout_busy');
        createPending.current = true;
        try {
          if (!gate.current.ready || gate.current.method === 'transfer') {
            setTouched({ name: true, email: true, country: true });
            throw new Error('invalid_request');
          }
          transition('processing');
          const identity = { name: gate.current.customer.name.trim(), email: gate.current.customer.email.trim().toLowerCase(), locale: gate.current.locale };
          const response = await fetch('/api/career-search/paypal/create-order', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(identity), cache: 'no-store',
          });
          const payload = await response.json();
          if (!response.ok || typeof payload?.id !== 'string' || !/^[A-Z0-9-]{6,64}$/i.test(payload.id)) throw new Error('checkout_unavailable');
          setConfirmationEmail(identity.email);
          return payload.id;
        } catch {
          transition('error');
          throw new Error('checkout_unavailable');
        } finally {
          createPending.current = false;
        }
      },
      onApprove: async data => {
        if (capturePending.current || statusRef.current === 'success') return;
        capturePending.current = true;
        transition('processing');
        try {
          if (!data.orderID || !/^[A-Z0-9-]{6,64}$/i.test(data.orderID)) throw new Error('invalid_request');
          const response = await fetch('/api/career-search/paypal/capture-order', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderID }), cache: 'no-store',
          });
          const payload = await response.json();
          if (!response.ok || payload?.ok !== true) throw new Error('payment_failed');
          setEmailSent(payload.emailSent === true);
          transition('success');
        } catch {
          transition('error');
          throw new Error('payment_failed');
        } finally {
          capturePending.current = false;
        }
      },
      onCancel: () => {
        if (!capturePending.current && statusRef.current !== 'success') transition('idle');
      },
      onError: reason => {
        if (createPending.current || capturePending.current || (reason instanceof Error && reason.message === 'checkout_busy')) return;
        if (statusRef.current !== 'success') transition('error');
      },
    };
    for (const [source, fundingSource] of [['paypal', paypal.FUNDING.PAYPAL], ['card', paypal.FUNDING.CARD]] as const) {
      const updateButton = (state: ButtonState) => {
        if (!disposed) setButtons(current => ({ ...current, [source]: state }));
      };
      try {
        const button = paypal.Buttons({ ...callbacks, fundingSource, style: { layout: 'vertical', shape: 'rect', height: 48 } });
        instances.push(button);
        if (!button.isEligible()) {
          updateButton('unavailable');
          continue;
        }
        void button.render(`#career-search-${source}-button`).then(() => updateButton('ready')).catch(() => updateButton('error'));
      } catch {
        updateButton('error');
      }
    }
    return () => {
      disposed = true;
      for (const button of instances) void button.close().catch(() => {});
    };
  }, [sdkReady]);
  const bank = moroccanBanks.find(item => item.id === bankId);
  const errors: Record<Field, string | null> = {
    name: nameValid ? null : t('Indiquez votre nom complet.', 'Enter your full name.'),
    email: emailValid ? null : t('Indiquez une adresse email valide.', 'Enter a valid email address.'),
    country: countryValid ? null : t('Sélectionnez votre pays.', 'Select your country.'),
  };
  function update(field: Field, value: string) {
    setCustomer(current => ({ ...current, [field]: value }));
    if (field === 'country') { setMethod('paypal'); setBankId(''); }
  }
  function chooseMethod(next: typeof method) {
    setMethod(next);
    if (statusRef.current === 'error') { statusRef.current = 'idle'; setStatus('idle'); }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true, country: true });
  }

  return <div className={s.checkout} id="checkout">
    <div className={s.checkoutHeader}><span className={s.checkoutIcon}><LockKeyhole size={19} aria-hidden="true" /></span><div><h3>{t('Votre prochaine étape commence ici.', 'Your next step starts here.')}</h3><p>{t('Vos coordonnées, puis votre mode de paiement.', 'Your details, then your payment method.')}</p></div></div>
    <form onSubmit={submit} noValidate>
      <fieldset className={s.customerFields} disabled={locked}>
      <div className={s.formField}><label htmlFor="cs-name">{t('Nom complet', 'Full name')}</label><input id="cs-name" name="name" autoComplete="name" required maxLength={120} value={customer.name} onChange={e => update('name', e.target.value)} onBlur={() => setTouched(current => ({ ...current, name: true }))} placeholder={t('Votre prénom et votre nom', 'Your first and last name')} aria-invalid={!!(touched.name && errors.name)} aria-describedby={touched.name && errors.name ? 'cs-name-error' : undefined} />{touched.name && errors.name && <p id="cs-name-error" className={s.fieldError}>{errors.name}</p>}</div>
      <div className={s.formField}><label htmlFor="cs-email">Email</label><input id="cs-email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} value={customer.email} onChange={e => update('email', e.target.value)} onBlur={() => setTouched(current => ({ ...current, email: true }))} placeholder={t('vous@exemple.com', 'you@example.com')} aria-invalid={!!(touched.email && errors.email)} aria-describedby={touched.email && errors.email ? 'cs-email-error' : undefined} />{touched.email && errors.email && <p id="cs-email-error" className={s.fieldError}>{errors.email}</p>}</div>
      <div className={s.formField}><label htmlFor="cs-country">{t('Pays', 'Country')}</label><select id="cs-country" name="country" autoComplete="country" required value={customer.country} onChange={e => update('country', e.target.value)} onBlur={() => setTouched(current => ({ ...current, country: true }))} aria-invalid={!!(touched.country && errors.country)} aria-describedby={touched.country && errors.country ? 'cs-country-error' : undefined}><option value="">{t('Sélectionnez votre pays', 'Select your country')}</option>{countries.map(country => <option value={country.code} key={country.code}>{country.name}</option>)}</select>{touched.country && errors.country && <p id="cs-country-error" className={s.fieldError}>{errors.country}</p>}</div>
      </fieldset>
      <div className={s.paymentReveal} aria-live="polite">
        {!ready && status !== 'success' && <p className={s.paymentHint}><span>04</span>{t('Complétez ces trois champs pour choisir votre paiement.', 'Complete these three fields to choose your payment.')}</p>}
        <div className={s.paymentOptions} hidden={!ready || status === 'success'}>
        <fieldset disabled={locked}><legend>{t('Mode de paiement', 'Payment method')}</legend><label className={`${s.paymentChoice} ${method === 'paypal' ? s.choiceSelected : ''}`}><input type="radio" name="payment-method" value="paypal" checked={method === 'paypal'} onChange={() => chooseMethod('paypal')} /><CreditCard size={19} aria-hidden="true" /><span><strong>PayPal</strong><small>{t('Avec votre compte PayPal', 'With your PayPal account')}</small></span><Check size={16} className={s.choiceCheck} aria-hidden="true" /></label>
          <label className={`${s.paymentChoice} ${method === 'card' ? s.choiceSelected : ''}`}><input type="radio" name="payment-method" value="card" checked={method === 'card'} onChange={() => chooseMethod('card')} /><CreditCard size={19} aria-hidden="true" /><span><strong>{t('Carte bancaire', 'Debit or credit card')}</strong><small>{t('Via PayPal · selon les options disponibles', 'Via PayPal · subject to available options')}</small></span><Check size={16} className={s.choiceCheck} aria-hidden="true" /></label>
          {customer.country === 'MA'  && <label className={`${s.paymentChoice} ${method === 'transfer' ? s.choiceSelected : ''}`}><input type="radio" name="payment-method" value="transfer" checked={method === 'transfer'} onChange={() => chooseMethod('transfer')} /><Landmark size={19} aria-hidden="true" /><span><strong>{t('Virement bancaire', 'Bank transfer')}</strong><small>{t('Maroc · validation manuelle', 'Morocco · manual verification')}</small></span><Check size={16} className={s.choiceCheck} aria-hidden="true" /></label>}
        </fieldset>
        <div className={s.paypalContinue} hidden={method === 'transfer'} aria-busy={status === 'processing'}>
          <div id="career-search-paypal-button" hidden={method !== 'paypal'} />
          <div id="career-search-card-button" hidden={method !== 'card'} />
          {!clientId ? <p role="alert">{t('Le paiement en ligne est momentanément indisponible.', 'Online checkout is temporarily unavailable.')}</p> : method !== 'transfer' && <>
            {buttons[method] === 'loading' && <p role="status">{t('Chargement du paiement sécurisé…', 'Loading secure checkout…')}</p>}
            {buttons[method] === 'error' && <p role="alert">{t('Le paiement en ligne est momentanément indisponible. Réessayez dans un instant.', 'Online checkout is temporarily unavailable. Please try again shortly.')}</p>}
            {buttons[method] === 'unavailable' && <p role="status">{method === 'card' ? t('Le paiement par carte n’est pas disponible pour votre navigateur ou votre compte. Vous pouvez choisir PayPal ci-dessus.', 'Card payment is unavailable for your browser or account. You can select PayPal above.') : t('PayPal n’est pas disponible pour votre navigateur ou votre compte.', 'PayPal is unavailable for your browser or account.')}</p>}
          </>}
          {status === 'processing' && <p role="status">{t('Paiement en cours…', 'Payment in progress…')}</p>}
          {status === 'error' && <p role="alert" className={s.fieldError}>{t('Le paiement n’a pas pu être confirmé. Réessayez dans un instant.', 'Payment could not be confirmed. Please try again shortly.')}</p>}
        </div>
        {method === 'transfer' && <div className={s.transferPanel}>
          <fieldset><legend>{t('Choisissez votre banque', 'Choose your bank')}</legend><div className={s.bankChoices}>{moroccanBanks.map(item => <label key={item.id} className={bankId === item.id ? s.bankSelected : ''}><input type="radio" name="bank" value={item.id} checked={bankId === item.id} onChange={() => setBankId(item.id)} />{item.id === 'other' ? t('Autre banque', 'Other bank') : item.name}</label>)}</div></fieldset>
          {bank && <div className={s.bankDetails}>
            {bank.details ? <><p className={s.bankName}>{bank.name}</p><dl><dt>{t('Bénéficiaire', 'Beneficiary')}</dt><dd>{bank.details.beneficiary}</dd><dt>RIB</dt><dd>{bank.details.rib}</dd>{bank.details.iban && <><dt>IBAN</dt><dd>{bank.details.iban}</dd></>}</dl>{bank.details.instructions && <p>{bank.details.instructions}</p>}<p>{t('Après le virement, envoyez votre justificatif sur WhatsApp.', 'After transferring, send your payment proof on WhatsApp.')}</p></> : <p>{t('Contactez notre équipe pour obtenir les coordonnées bancaires vérifiées avant tout virement.', 'Contact our team for verified bank details before making a transfer.')}</p>}
            <a className={s.whatsappLink} href={getTransferWhatsAppUrl(bank.id)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" />{t('Recevoir les coordonnées sur WhatsApp', 'Receive bank details on WhatsApp')}<ArrowRight size={16} aria-hidden="true" /></a><span className={s.contactNumber}>+212 610 778 015</span>
            <ol className={s.transferSteps}>
              <li>{t('Recevez les coordonnées bancaires.', 'Receive the bank details.')}</li>
              <li>{t('Effectuez le virement.', 'Make the bank transfer.')}</li>
              <li>{t('Envoyez la preuve de paiement sur WhatsApp.', 'Send your payment proof on WhatsApp.')}</li>
              <li>{t('Après validation, votre accès Career Search 360 est activé et envoyé par e-mail.', 'After verification, your Career Search 360 access is activated and emailed to you.')}</li>
            </ol>
            <p className={s.pendingNote}><LockKeyhole size={15} aria-hidden="true" />{t('Votre accès est activé après validation du virement.', 'Your access is activated after the transfer is verified.')}</p>
          </div>}
        </div>}
      </div>
      {status === 'success' && <div className={s.paymentSuccess} role="status">
        <strong>{t('Paiement confirmé.', 'Payment confirmed.')}</strong>
        <p>{t('Votre accès Career Search 360 est en cours d’activation.', 'Your Career Search 360 access is being activated.')}</p>
        <p>{emailSent ? t('Nous venons d’envoyer les informations d’accès à :', 'We have just sent your access information to:') : t('Les informations d’accès par e-mail peuvent être retardées. Adresse de votre compte :', 'Your access email may be delayed. Your account email:')}<br /><b className={s.confirmationEmail}>{confirmationEmail}</b></p>
        <p>{t('Consultez votre boîte de réception pour accéder à votre espace. Pour un nouveau compte, utilisez le lien d’invitation pour définir votre mot de passe.', 'Check your inbox to access your workspace. For a new account, use the invitation link to set your password.')}</p>
        <a href="https://app.talentiques.com/fr/acces">{t('Accéder à Career Search 360', 'Access Career Search 360')}<ArrowRight size={16} aria-hidden="true" /></a>
        <p>{t('Vous n’avez rien reçu ? Vérifiez vos spams ou contactez-nous sur WhatsApp.', 'Nothing in your inbox? Check your spam folder or contact us on WhatsApp.')}</p>
        <a href="https://wa.me/212610778015" target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" />WhatsApp</a>
      </div>}
      </div>
    </form>
    <div className={s.checkoutTotal}><span>{t('Total · paiement unique', 'Total · one-time payment')}</span><strong>{t('19,90 €', '€19.90')}</strong></div>
    {clientId && <Script id="career-search-paypal-sdk" src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=EUR&intent=capture&components=buttons`} strategy="afterInteractive" onReady={() => setSdkReady(true)} onError={() => setButtons({ paypal: 'error', card: 'error' })} />}
  </div>;
}

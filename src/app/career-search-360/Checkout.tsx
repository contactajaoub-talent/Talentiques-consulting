'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Check, CreditCard, Landmark, LockKeyhole, MessageCircle } from 'lucide-react';
import { checkoutUrl, getTransferWhatsAppUrl, moroccanBanks, type Locale } from './content';
import s from './career-search.module.css';

type Field = 'name' | 'email' | 'country';
export default function Checkout({ locale, countries }: { locale: Locale; countries: { code: string; name: string }[] }) {
  const t = (fr: string, en: string) => locale === 'fr' ? fr : en;
  const [customer, setCustomer] = useState({ name: '', email: '', country: '' });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [method, setMethod] = useState<'paypal' | 'card' | 'transfer'>('paypal');
  const [bankId, setBankId] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  useEffect(() => {
    const restore = () => setRedirecting(false);
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);
  const nameValid = customer.name.trim().length >= 2 && customer.name.trim().length <= 120;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()) && customer.email.length <= 254;
  const countryValid = countries.some(country => country.code === customer.country);
  const ready = nameValid && emailValid && countryValid;
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
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true, country: true });
    if (!ready || method === 'transfer' || redirecting) return;
    // Preserve the validated app endpoint. Its customer parameter contract is
    // not available in this marketing repo: do not invent query/body fields.
    // The customer confirms their details in the existing payment flow.
    setRedirecting(true);
    window.location.assign(checkoutUrl);
  }

  return <div className={s.checkout} id="checkout">
    <div className={s.checkoutHeader}><span className={s.checkoutIcon}><LockKeyhole size={19} aria-hidden="true" /></span><div><h3>{t('Votre prochaine étape commence ici.', 'Your next step starts here.')}</h3><p>{t('Vos coordonnées, puis votre mode de paiement.', 'Your details, then your payment method.')}</p></div></div>
    <form onSubmit={submit} noValidate>
      <div className={s.formField}><label htmlFor="cs-name">{t('Nom complet', 'Full name')}</label><input id="cs-name" name="name" autoComplete="name" required maxLength={120} value={customer.name} onChange={e => update('name', e.target.value)} onBlur={() => setTouched(current => ({ ...current, name: true }))} placeholder={t('Votre prénom et votre nom', 'Your first and last name')} aria-invalid={!!(touched.name && errors.name)} aria-describedby={touched.name && errors.name ? 'cs-name-error' : undefined} />{touched.name && errors.name && <p id="cs-name-error" className={s.fieldError}>{errors.name}</p>}</div>
      <div className={s.formField}><label htmlFor="cs-email">Email</label><input id="cs-email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} value={customer.email} onChange={e => update('email', e.target.value)} onBlur={() => setTouched(current => ({ ...current, email: true }))} placeholder={t('vous@exemple.com', 'you@example.com')} aria-invalid={!!(touched.email && errors.email)} aria-describedby={touched.email && errors.email ? 'cs-email-error' : undefined} />{touched.email && errors.email && <p id="cs-email-error" className={s.fieldError}>{errors.email}</p>}</div>
      <div className={s.formField}><label htmlFor="cs-country">{t('Pays', 'Country')}</label><select id="cs-country" name="country" autoComplete="country" required value={customer.country} onChange={e => update('country', e.target.value)} onBlur={() => setTouched(current => ({ ...current, country: true }))} aria-invalid={!!(touched.country && errors.country)} aria-describedby={touched.country && errors.country ? 'cs-country-error' : undefined}><option value="">{t('Sélectionnez votre pays', 'Select your country')}</option>{countries.map(country => <option value={country.code} key={country.code}>{country.name}</option>)}</select>{touched.country && errors.country && <p id="cs-country-error" className={s.fieldError}>{errors.country}</p>}</div>
      <div className={s.paymentReveal} aria-live="polite">{!ready ? <p className={s.paymentHint}><span>04</span>{t('Complétez ces trois champs pour choisir votre paiement.', 'Complete these three fields to choose your payment.')}</p> : <div className={s.paymentOptions}>
        <fieldset><legend>{t('Mode de paiement', 'Payment method')}</legend><label className={`${s.paymentChoice} ${method === 'paypal' ? s.choiceSelected : ''}`}><input type="radio" name="payment-method" value="paypal" checked={method === 'paypal'} onChange={() => setMethod('paypal')} /><CreditCard size={19} aria-hidden="true" /><span><strong>PayPal</strong><small>{t('Avec votre compte PayPal', 'With your PayPal account')}</small></span><Check size={16} className={s.choiceCheck} aria-hidden="true" /></label>
          <label className={`${s.paymentChoice} ${method === 'card' ? s.choiceSelected : ''}`}><input type="radio" name="payment-method" value="card" checked={method === 'card'} onChange={() => setMethod('card')} /><CreditCard size={19} aria-hidden="true" /><span><strong>{t('Carte bancaire', 'Debit or credit card')}</strong><small>{t('Via PayPal · selon les options disponibles', 'Via PayPal · subject to available options')}</small></span><Check size={16} className={s.choiceCheck} aria-hidden="true" /></label>
          {customer.country === 'MA'  && <label className={`${s.paymentChoice} ${method === 'transfer' ? s.choiceSelected : ''}`}><input type="radio" name="payment-method" value="transfer" checked={method === 'transfer'} onChange={() => setMethod('transfer')} /><Landmark size={19} aria-hidden="true" /><span><strong>{t('Virement bancaire', 'Bank transfer')}</strong><small>{t('Maroc · validation manuelle', 'Morocco · manual verification')}</small></span><Check size={16} className={s.choiceCheck} aria-hidden="true" /></label>}
        </fieldset>
        {method !== 'transfer' ? <div className={s.paypalContinue}><button type="submit" className={s.purchase} disabled={redirecting}>{redirecting ? t('Redirection…', 'Redirecting…') : method === 'card' ? t('Continuer par carte', 'Continue by card') : t('Continuer vers PayPal', 'Continue to PayPal')}<ArrowRight size={18} aria-hidden="true" /></button><p>{t('Vous confirmerez vos coordonnées dans le parcours de paiement.', 'You will confirm your details in the payment flow.')}</p></div> : <div className={s.transferPanel}>
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
      </div>}</div>
    </form>
    <div className={s.checkoutTotal}><span>{t('Total · paiement unique', 'Total · one-time payment')}</span><strong>{t('19,90 €', '€19.90')}</strong></div>
  </div>;
}

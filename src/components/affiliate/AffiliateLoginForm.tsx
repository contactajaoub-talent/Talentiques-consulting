'use client';

import { FormEvent, useState } from 'react';
import { LoaderCircle, Mail } from 'lucide-react';

export default function AffiliateLoginForm({ locale, invalid = false }: { locale: 'fr' | 'en'; invalid?: boolean }) {
  const [sending, setSending] = useState(false); const [message, setMessage] = useState('');
  const fr = locale === 'fr';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setMessage('');
    const email = String(new FormData(event.currentTarget).get('email') || '');
    const response = await fetch('/api/affiliate/auth/request-link', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, language: locale }),
    });
    const result = await response.json().catch(() => ({}));
    setMessage(typeof result.message === 'string' ? result.message : fr ? 'Vérifiez votre boîte de réception.' : 'Check your inbox.'); setSending(false);
  }
  return <form onSubmit={submit} className="mt-8 space-y-5">
    {invalid && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800" role="alert">{fr ? 'Ce lien est invalide, expiré ou déjà utilisé. Demandez un nouveau lien.' : 'This link is invalid, expired or already used. Request a new link.'}</p>}
    <label className="block"><span className="mb-2 block text-sm font-bold text-slate-800">{fr ? 'Adresse e-mail affiliée' : 'Affiliate email address'}</span><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input className="input pl-12" type="email" name="email" required autoComplete="email" /></div></label>
    <button disabled={sending} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#0683C9] px-6 font-bold text-white hover:bg-sky-700 disabled:opacity-60">{sending && <LoaderCircle className="animate-spin" size={18} />}{fr ? 'Recevoir mon lien de connexion' : 'Email me a login link'}</button>
    {message && <p className="rounded-xl bg-sky-50 p-4 text-sm leading-6 text-sky-900" role="status">{message}</p>}
  </form>;
}


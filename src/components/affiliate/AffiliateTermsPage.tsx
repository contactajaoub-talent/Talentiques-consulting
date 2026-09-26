import Link from 'next/link';

const terms = {
  fr: {
    title: 'Conditions du programme d’affiliation', back: 'Retour au programme', intro: 'Ces conditions encadrent la participation au programme d’affiliation Talentiques et complètent les conditions générales du site.',
    sections: [
      ['Commission et attribution', 'Le taux standard est de 50 % sur les commandes payées et éligibles. L’attribution suit le dernier clic affilié valide pendant 30 jours. Les transactions remboursées, contestées, annulées ou frauduleuses ne donnent pas droit à commission.'],
      ['Paiements', 'Les paiements sont prévus mensuellement, par devise, lorsque le solde disponible atteint au minimum 20 EUR ou 20 USD. Les modalités peuvent dépendre du moyen de paiement et des vérifications nécessaires.'],
      ['Pratiques interdites', 'Les auto-parrainages, déclarations trompeuses, usurpations de l’identité Talentiques, spams, cookie stuffing, faux comptes et transactions frauduleuses sont interdits. Les enchères sur les marques Talentiques dans les campagnes de recherche payante exigent une autorisation écrite.'],
      ['Transparence', 'Les affiliés doivent signaler leur relation d’affiliation lorsque la réglementation ou la plateforme utilisée l’exige. Les contenus doivent rester exacts et ne pas promettre de résultats professionnels ou financiers garantis.'],
      ['Suspension et rapprochement', 'Talentiques peut suspendre un compte en cas d’abus ou de non-respect du programme. Les commissions déjà payées peuvent nécessiter un rapprochement ultérieur en cas de fraude, remboursement ou litige découvert après paiement.'],
      ['Évolution des conditions', 'Le programme et ses conditions peuvent évoluer. Les changements importants seront communiqués avec un préavis raisonnable lorsque cela est possible.'],
    ],
  },
  en: {
    title: 'Affiliate Program Terms', back: 'Back to the program', intro: 'These terms govern participation in the Talentiques Affiliate Program and complement the site’s general terms.',
    sections: [
      ['Commission and attribution', 'The standard rate is 50% on eligible paid orders. Attribution follows the last valid affiliate click for 30 days. Refunded, disputed, cancelled or fraudulent transactions are not commissionable.'],
      ['Payouts', 'Payouts are scheduled monthly, per currency, once the available balance reaches at least EUR 20 or USD 20. Timing may depend on the payout method and required checks.'],
      ['Prohibited practices', 'Self-referrals, misleading claims, impersonating Talentiques, spam, cookie stuffing, fake accounts and fraudulent transactions are prohibited. Bidding on Talentiques trademarks in paid search requires written permission.'],
      ['Disclosure', 'Affiliates must disclose their affiliate relationship where required by law or the platform used. Content must remain accurate and must not promise guaranteed career or financial outcomes.'],
      ['Suspension and reconciliation', 'Talentiques may suspend accounts for abuse or program violations. Previously paid commissions may require later reconciliation when fraud, refunds or disputes are discovered after payment.'],
      ['Changes to these terms', 'The program and these terms may evolve. Material changes will be communicated with reasonable notice where practicable.'],
    ],
  },
};

export default function AffiliateTermsPage({ locale }: { locale: 'fr' | 'en' }) {
  const t = terms[locale]; const back = locale === 'fr' ? '/affiliation' : '/en/affiliate';
  return <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-950 sm:py-24"><article className="mx-auto max-w-4xl"><Link href={back} className="font-bold text-[#0683C9]">← {t.back}</Link><div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 sm:p-12"><p className="text-sm font-bold tracking-[.16em] text-[#0683C9]">TALENTIQUES</p><h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-6xl">{t.title}</h1><p className="mt-6 text-lg leading-8 text-slate-600">{t.intro}</p><div className="mt-12 space-y-10">{t.sections.map(([title, body], index) => <section key={title} className="border-t border-slate-100 pt-8"><h2 className="font-heading text-2xl font-bold"><span className="mr-3 text-[#0683C9]">{String(index + 1).padStart(2, '0')}</span>{title}</h2><p className="mt-4 leading-8 text-slate-600">{body}</p></section>)}</div></div></article></main>;
}


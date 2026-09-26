import { Resend } from 'resend';
import type { ApplicationLanguage } from './application.ts';

type AffiliateEmailData = {
  fullName: string;
  email: string;
  code: string;
  language: ApplicationLanguage;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[char] || char);
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || '';
}

export function affiliateLinks(code: string) {
  return {
    fr: `https://talentiques.com/outils?ref=${encodeURIComponent(code)}`,
    en: `https://talentiques.com/en/tools?ref=${encodeURIComponent(code)}`,
  };
}

export function applicationConfirmationEmail(data: AffiliateEmailData) {
  const name = escapeHtml(firstName(data.fullName));
  const fr = data.language === 'fr';
  const subject = fr
    ? 'Votre candidature au programme d’affiliation Talentiques'
    : 'Your Talentiques Affiliate Program application';
  const text = fr
    ? `Bonjour ${name},\n\nVotre candidature a bien été reçue. Elle est en cours d’examen et aucun lien affilié n’est encore actif. Nous vous contacterons après validation.\n\nL’équipe Talentiques`
    : `Hello ${name},\n\nYour application has been received. It is pending review and no referral link is active yet. We’ll contact you after review.\n\nThe Talentiques team`;
  return { subject, text, html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><p>${text.replaceAll('\n', '<br>')}</p></div>` };
}

export function approvalEmail(data: AffiliateEmailData) {
  const links = affiliateLinks(data.code);
  const name = escapeHtml(firstName(data.fullName));
  const fr = data.language === 'fr';
  const subject = fr
    ? 'Bienvenue dans le programme d’affiliation Talentiques'
    : 'Welcome to the Talentiques Affiliate Program';
  const text = fr
    ? `Bonjour ${name},\n\nVotre candidature a été validée.\n\nLien francophone : ${links.fr}\nLien anglophone : ${links.en}\nCommission : 50 %\nAttribution : 30 jours\nPaiements : mensuels, sous réserve des règles du programme.\n\nCommencer à partager Talentiques : ${links.fr}\nAccéder à mon espace affilié : https://talentiques.com/affiliation/connexion`
    : `Hello ${name},\n\nYour application has been approved.\n\nFrench referral link: ${links.fr}\nEnglish referral link: ${links.en}\nCommission: 50%\nAttribution: 30 days\nPayouts: monthly, subject to the program rules.\n\nStart sharing Talentiques: ${links.en}\nAccess My Affiliate Dashboard: https://talentiques.com/en/affiliate/login`;
  return { subject, text, html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><p>${text.replaceAll('\n', '<br>')}</p></div>` };
}

export function affiliateLoginEmail(data: AffiliateEmailData & { loginUrl: string }) {
  const name = escapeHtml(firstName(data.fullName));
  const fr = data.language === 'fr';
  const subject = fr ? 'Votre lien de connexion — Talentiques Affiliés' : 'Your Talentiques Affiliate Login Link';
  const cta = fr ? 'Accéder à mon espace affilié' : 'Access My Affiliate Dashboard';
  const intro = fr
    ? `Bonjour ${name},\n\nUtilisez le bouton ci-dessous pour accéder à votre espace affilié Talentiques.`
    : `Hello ${name},\n\nUse the button below to access your Talentiques affiliate dashboard.`;
  const note = fr
    ? 'Ce lien est personnel et expire dans 15 minutes. Si vous n’avez pas demandé ce lien, vous pouvez ignorer cet e-mail.'
    : 'This personal link expires in 15 minutes. If you did not request it, you can ignore this email.';
  const text = `${intro}\n\n${cta}: ${data.loginUrl}\n\n${note}`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><p>${intro.replaceAll('\n', '<br>')}</p><p><a href="${escapeHtml(data.loginUrl)}" style="display:inline-block;background:#0683C9;color:#fff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:700">${cta}</a></p><p>${note}</p></div>`;
  return { subject, text, html };
}

export function rejectionEmail(data: AffiliateEmailData) {
  const name = escapeHtml(firstName(data.fullName));
  const fr = data.language === 'fr';
  const subject = fr ? 'Mise à jour de votre candidature Talentiques' : 'Your Talentiques application update';
  const text = fr
    ? `Bonjour ${name},\n\nAprès examen, nous ne pouvons pas activer votre candidature au programme d’affiliation pour le moment. Merci pour votre intérêt.\n\nL’équipe Talentiques`
    : `Hello ${name},\n\nAfter review, we’re unable to activate your affiliate application at this time. Thank you for your interest.\n\nThe Talentiques team`;
  return { subject, text, html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><p>${text.replaceAll('\n', '<br>')}</p></div>` };
}

async function sendEmail(to: string[], email: { subject: string; text: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY missing');
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'TalentiQues <resources@talentiques.com>',
    to,
    ...email,
  });
  if (error) throw new Error(error.message || 'Affiliate email failed');
}

export function sendApplicationConfirmation(data: AffiliateEmailData) {
  return sendEmail([data.email], applicationConfirmationEmail(data));
}

export function sendApprovalEmail(data: AffiliateEmailData) {
  return sendEmail([data.email], approvalEmail(data));
}

export function sendRejectionEmail(data: AffiliateEmailData) {
  return sendEmail([data.email], rejectionEmail(data));
}

export function sendAffiliateLoginEmail(data: AffiliateEmailData & { loginUrl: string }) {
  return sendEmail([data.email], affiliateLoginEmail(data));
}

export function sendAffiliateAdminLoginEmail(email: string, loginUrl: string) {
  const subject = 'Votre accès administrateur — Talentiques Affiliés';
  const text = `Utilisez ce lien personnel pour accéder à l’administration du programme d’affiliation Talentiques :\n\n${loginUrl}\n\nCe lien expire dans 15 minutes. Si vous ne l’avez pas demandé, ignorez cet e-mail.`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><p>Utilisez le bouton ci-dessous pour accéder à l’administration Talentiques Affiliés.</p><p><a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#0683C9;color:#fff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:700">Ouvrir l’administration</a></p><p>Ce lien expire dans 15 minutes. Si vous ne l’avez pas demandé, ignorez cet e-mail.</p></div>`;
  return sendEmail([email], { subject, text, html });
}

export function sendAffiliatePayoutPaidEmail(data: AffiliateEmailData & { amount: string; currency: string; method: string; paymentDate: string }) {
  const fr = data.language === 'fr';
  const subject = fr ? 'Votre commission Talentiques a été payée' : 'Your Talentiques affiliate payout has been sent';
  const text = fr
    ? `Bonjour ${firstName(data.fullName)},\n\nVotre paiement affilié de ${data.amount} ${data.currency} a été confirmé.\nMéthode : ${data.method || 'Non précisée'}\nDate : ${data.paymentDate}\n\nL’équipe Talentiques`
    : `Hello ${firstName(data.fullName)},\n\nYour affiliate payout of ${data.amount} ${data.currency} has been confirmed.\nMethod: ${data.method || 'Not specified'}\nDate: ${data.paymentDate}\n\nThe Talentiques team`;
  return sendEmail([data.email], { subject, text, html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><p>${escapeHtml(text).replaceAll('\n','<br>')}</p></div>` });
}

export function sendAffiliateAdminNotification(data: AffiliateEmailData & Record<string, unknown>) {
  const adminEmail = process.env.AFFILIATE_ADMIN_EMAIL?.trim();
  if (!adminEmail) throw new Error('AFFILIATE_ADMIN_EMAIL missing');
  const lines = [
    `Name: ${data.fullName}`, `Email: ${data.email}`, `Country: ${String(data.country || '')}`,
    `Channel: ${String(data.primaryChannel || '')}`, `Profile: ${String(data.profileUrl || '')}`,
    `Audience: ${String(data.audienceSize || '')}`, `Focus: ${String(data.contentFocus || '')}`,
    `Reserved code: ${data.code}`,
  ];
  const text = lines.join('\n');
  return sendEmail([adminEmail], {
    subject: `New Talentiques affiliate application — ${data.fullName}`,
    text,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><p>${escapeHtml(text).replaceAll('\n', '<br>')}</p></div>`,
  });
}

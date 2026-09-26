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
    ? `Bonjour ${name},\n\nVotre candidature a été validée.\n\nLien francophone : ${links.fr}\nLien anglophone : ${links.en}\nCommission : 50 %\nAttribution : 30 jours\nPaiements : mensuels, sous réserve des règles du programme.\n\nCommencer à partager Talentiques : ${links.fr}`
    : `Hello ${name},\n\nYour application has been approved.\n\nFrench referral link: ${links.fr}\nEnglish referral link: ${links.en}\nCommission: 50%\nAttribution: 30 days\nPayouts: monthly, subject to the program rules.\n\nStart sharing Talentiques: ${links.en}`;
  return { subject, text, html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><p>${text.replaceAll('\n', '<br>')}</p></div>` };
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


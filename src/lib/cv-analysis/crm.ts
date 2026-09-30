import type { CvAnalysisResult } from './types.ts';

export type CvLeadContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  currentStatus: string;
  linkedin: string;
  targetRole: string;
  privacy: boolean;
  marketing: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export function buildCvDiagnosisLeadForm(contact: CvLeadContact, analysis: CvAnalysisResult) {
  const data = new FormData();
  data.set('firstName', contact.firstName.trim());
  data.set('lastName', contact.lastName.trim());
  data.set('email', contact.email.trim());
  data.set('phone', contact.phone.trim());
  data.set('country', contact.country.trim());
  data.set('statutActuel', contact.currentStatus.trim());
  data.set('objectifProfessionnel', contact.targetRole.trim());
  data.set('profilLinkedIn', contact.linkedin.trim());
  data.set('privacy', contact.privacy ? '1' : '0');
  data.set('marketing', contact.marketing ? '1' : '0');
  data.set('typeDemande', 'Diagnostic CV');
  data.set('offreRessource', 'Diagnostic CV');
  data.set('nomRessource', 'Diagnostic CV IA Talentiques');
  data.set('pageOrigine', '/cv-diagnosis');
  data.set('utmSource', contact.utmSource || '');
  data.set('utmMedium', contact.utmMedium || '');
  data.set('utmCampaign', contact.utmCampaign || '');
  data.set('informationsComplementaires', buildCrmSummary(contact, analysis));
  return data;
}

export function buildCrmSummary(contact: CvLeadContact, analysis: CvAnalysisResult) {
  const lines = [
    'Type : Diagnostic CV IA Talentiques',
    '',
    `ATS Readiness : ${analysis.atsReadiness.total}/100`,
  ];
  if (analysis.jobMatch) lines.push(`Job Match : ${analysis.jobMatch.total}/100`);
  if (contact.targetRole.trim()) lines.push('', `Métier cible : ${contact.targetRole.trim()}`);
  if (contact.country.trim()) lines.push(`Pays : ${contact.country.trim()}`);
  lines.push('', 'Priorités :', ...analysis.priorities.slice(0, 3).map((item) => `- ${item.explanation}`));
  lines.push('', 'Recommandation Talentiques :', analysis.recommendation.offerName);
  return lines.join('\n').slice(0, 3000);
}

export async function submitCvDiagnosisLead(
  data: FormData,
  fetchImpl: typeof fetch = fetch,
) {
  try {
    const response = await fetchImpl('/api/salesforce-lead', { method: 'POST', body: data });
    return response.ok;
  } catch {
    return false;
  }
}

export const CAREER_QUOTE = 'career-a-z';
export const MAX_CV_SIZE = 5 * 1024 * 1024;
export const CAREER_QUOTE_CONSENT_VERSION = 'career-quote-2026-11-01';
export const CAREER_QUOTE_CONSENT = 'J’accepte que Talentiques utilise mes informations et mon CV pour étudier ma demande et me recontacter, conformément à la politique de confidentialité.';
export const OPPORTUNITIES = ['Emploi', 'Stage', 'Stage PFE', 'Alternance', 'Mobilité internationale'];
export const SITUATIONS = ['En recherche', 'En poste', 'En transition', 'Étudiant'];
export const EXPERIENCE = ['Étudiant / débutant', '0 à 3 ans', '3 à 10 ans', '+10 ans'];
export const FLEXIBLE_MOBILITY = 'Selon les opportunités';
export const MOBILITY = ['Locale', 'Nationale', 'Internationale', 'À distance', FLEXIBLE_MOBILITY];

export function toggleMobility(current: string[], option: string) {
  if (current.includes(option)) return current.filter(value => value !== option);
  if (option === FLEXIBLE_MOBILITY) return [option];
  return [...current.filter(value => value !== FLEXIBLE_MOBILITY), option];
}

// Generate labels on the server and pass them to the form to avoid ICU hydration differences.
export const COUNTRY_CODES = 'AF AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW'.split(' ');

export function countryOptions() {
  const names = new Intl.DisplayNames(['fr'], { type: 'region' });
  return COUNTRY_CODES.map(code => ({ code, name: names.of(code) || code }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export function quoteDeliveryEnabled(env: { NODE_ENV?: string; VERCEL_ENV?: string; CAREER_QUOTE_ENABLED?: string }) {
  return env.NODE_ENV === 'production' && env.CAREER_QUOTE_ENABLED === 'true'
    && (!env.VERCEL_ENV || env.VERCEL_ENV === 'production');
}

export function validateCareerQuoteDetails(form: FormData) {
  const value = (key: string, label: string, max = 200, required = true) => {
    const raw = form.get(key);
    const text = typeof raw === 'string' ? raw.trim() : '';
    if ((required && !text) || text.length > max) throw new Error(`${label} : veuillez renseigner une valeur valide (${max} caractères maximum).`);
    return text;
  };
  const choice = (key: string, label: string, options: string[]) => {
    const text = value(key, label);
    if (!options.includes(text)) throw new Error(`${label} : sélectionnez une option proposée.`);
    return text;
  };
  const multiple = (key: string, label: string, options?: string[], max = 10) => {
    const raw = form.getAll(key);
    const list = raw.map(v => typeof v === 'string' ? v.trim() : '');
    if (!list.length || list.length > max || list.some(v => !v || v.length > 100 || (options && !options.includes(v))))
      throw new Error(`${label} : vérifiez vos sélections (1 à ${max}).`);
    return [...new Set(list)];
  };
  const fullName = value('fullName', 'Nom complet', 120);
  const email = value('email', 'Email', 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Veuillez renseigner un email valide.');
  const phone = value('phone', 'Numéro WhatsApp', 40);
  if (!/^\+?[\d\s().-]{6,40}$/.test(phone) || phone.replace(/\D/g, '').length < 6)
    throw new Error('Veuillez renseigner un numéro WhatsApp valide avec son indicatif.');
  const country = value('country', 'Pays de résidence', 100);
  const linkedin = value('profilLinkedIn', 'Profil LinkedIn', 300, false);
  if (linkedin) {
    let url: URL;
    try { url = new URL(linkedin); } catch { throw new Error('Le lien LinkedIn doit être une URL https://linkedin.com/in/…'); }
    if (url.protocol !== 'https:' || !/(^|\.)linkedin\.com$/i.test(url.hostname) || url.username || url.password)
      throw new Error('Le lien LinkedIn doit être une URL https://linkedin.com/in/…');
  }
  const returning = choice('ancienClient', 'Ancien client Talentiques', ['Oui', 'Non']);
  const opportunities = multiple('opportunites', 'Type d’opportunité', OPPORTUNITIES, 5);
  const situation = choice('situation', 'Situation actuelle', SITUATIONS);
  const experience = choice('experience', 'Niveau d’expérience', EXPERIENCE);
  const roles = multiple('postes', 'Postes recherchés');
  const sector = value('secteurActivite', 'Secteurs ciblés', 200, false);
  const goal = value('objectifProfessionnel', 'Objectif professionnel', 2000);
  const mobility = multiple('mobilite', 'Mobilité', MOBILITY, MOBILITY.length);
  if (mobility.includes(FLEXIBLE_MOBILITY) && mobility.length > 1)
    throw new Error('Mobilité : « Selon les opportunités » ne peut pas être combiné avec les autres choix.');
  const countries = multiple('paysCibles', 'Pays ciblés', COUNTRY_CODES, 20);
  const comments = value('commentaires', 'Commentaires', 2000, false);
  if (form.get('privacy') !== 'on') throw new Error('Le consentement à la politique de confidentialité est obligatoire.');
  return { fullName, email: email.toLowerCase(), phone, country, linkedin, returning, opportunities, situation, experience, roles, sector, goal, mobility, countries, comments };
}

export function validateCareerQuote(form: FormData) {
  const details = validateCareerQuoteDetails(form);
  const cv = form.get('cv');
  if (!(cv instanceof File) || !cv.size) throw new Error('Veuillez ajouter votre CV actuel.');
  if (cv.size < 100 || cv.size > MAX_CV_SIZE) throw new Error('Le CV doit faire entre 100 octets et 5 Mo.');
  const extension = cv.name.split('.').pop()?.toLowerCase();
  if (!extension || !['pdf', 'docx'].includes(extension)) throw new Error('Formats acceptés : PDF ou DOCX.');

  return { ...details, cv, extension };
}

export function serializeCareerQuote(form: FormData) {
  const fields = ['fullName', 'email', 'phone', 'country', 'profilLinkedIn', 'ancienClient', 'situation', 'experience', 'secteurActivite', 'objectifProfessionnel', 'commentaires', 'privacy', 'pageOrigine', 'utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm'];
  const input: Record<string, unknown> = Object.fromEntries(fields.map(key => [key, form.get(key) || '']));
  for (const key of ['opportunites', 'postes', 'mobilite', 'paysCibles']) input[key] = form.getAll(key);
  return { ...input, consentVersion: CAREER_QUOTE_CONSENT_VERSION };
}

/** Whitelist all public input. Retain snapshots on the request without overwriting an existing contact. */
export function careerQuotePayload(input: Record<string, unknown>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) for (const item of value) { if (typeof item === 'string') form.append(key, item); else throw new Error('Sélection invalide.'); }
    else if (typeof value === 'string') form.set(key, value);
  }
  const quote = validateCareerQuoteDetails(form);
  if (input.consentVersion !== CAREER_QUOTE_CONSENT_VERSION) throw new Error('Le formulaire a été mis à jour. Rechargez la page avant de réessayer.');
  const namesOfCountries = new Intl.DisplayNames(['fr'], { type: 'region' });
  const source = input.pageOrigine === '/accompagnement' ? '/accompagnement' : '/services/accompagnement-carriere-a-a-z';
  const tracking = (key: string) => typeof input[key] === 'string' ? input[key].trim().slice(0, 150) : '';
  return {
    kind: 'quote', service_id: CAREER_QUOTE, market: 'fr', name: quote.fullName, email: quote.email,
    phone: quote.phone, linkedin: quote.linkedin, current_status: quote.situation, objective: quote.goal,
    markets: quote.countries.map(code => namesOfCountries.of(code) || code),
    details: { ...quote, service: 'Accompagnement carrière de A à Z', source_site: 'https://www.talentiques.com', consent_text: CAREER_QUOTE_CONSENT },
    notes: [
      'Service : Accompagnement carrière de A à Z — devis personnalisé',
      `Nom communiqué : ${quote.fullName}`, `WhatsApp communiqué : ${quote.phone}`, `LinkedIn communiqué : ${quote.linkedin || 'Non renseigné'}`,
      `Pays de résidence : ${quote.country}`, `Ancien client : ${quote.returning}`, `Opportunités : ${quote.opportunities.join(', ')}`,
      `Expérience : ${quote.experience}`, `Postes : ${quote.roles.join(' ; ')}`, `Secteurs : ${quote.sector || 'Non renseignés'}`,
      `Mobilité : ${quote.mobility.join(', ')}`, `Commentaires : ${quote.comments || 'Aucun'}`,
    ].join('\n'),
    privacy: true, marketing: false, consent_version: CAREER_QUOTE_CONSENT_VERSION, source,
    utm_source: tracking('utmSource'), utm_medium: tracking('utmMedium'), utm_campaign: tracking('utmCampaign'),
    utm_content: tracking('utmContent'), utm_term: tracking('utmTerm'),
  };
}

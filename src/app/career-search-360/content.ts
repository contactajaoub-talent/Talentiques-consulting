// Replace these entries only with approved assets and real customer feedback.
export const checkoutUrl = 'https://app.talentiques.com/api/payments/career-search/start';
export const platformVideo: { src: string | null; poster?: string } = { src: 'https://8zdp0brbtny6jmht.public.blob.vercel-storage.com/career-search-360.mp4' };
// Company destinations supplied by the user. Asset provenance: public/career-search-360/companies/sources.json.
export const companies: { name: string; logo: string; height: number; originalColor?: boolean; darkBackground?: boolean }[] = [
  { name: 'Capgemini', logo: '/career-search-360/companies/capgemini.svg', height: 28 },
  { name: 'Emirates', logo: '/career-search-360/companies/emirates.svg', height: 56 },
  { name: 'Schneider Electric', logo: '/career-search-360/companies/schneider-electric.svg', height: 34 },
  { name: 'Orica Limited', logo: '/career-search-360/companies/orica.svg', height: 34 },
  { name: 'Rolex', logo: '/career-search-360/companies/rolex.svg', height: 25 },
  { name: 'Desjardins', logo: '/career-search-360/companies/desjardins.svg', height: 28 },
  { name: 'CIBC', logo: '/career-search-360/companies/cibc.svg', height: 31 },
  { name: 'FedEx', logo: '/career-search-360/companies/fedex.svg', height: 32 },
  { name: 'Deloitte', logo: '/career-search-360/companies/deloitte.svg', height: 27, darkBackground: true },
  { name: 'AGCO Corporation', logo: '/career-search-360/companies/agco.png', height: 46 },
  { name: 'Hermès', logo: '/career-search-360/companies/hermes.svg', height: 53 },
  { name: 'Acolad Group', logo: '/career-search-360/companies/acolad.svg', height: 32 },
  { name: 'Société Générale', logo: '/career-search-360/companies/societe-generale.svg', height: 29, originalColor: true },
];
// Approved Talentiques testimonials, kept verbatim in French in both locales.
export const testimonials: {
  name: string;
  country: { fr: string; en: string };
  countryCode: string;
  quote: string;
}[] = [
  {
    "name": "Anne-Laure Macherey",
    "country": {
      "fr": "France",
      "en": "France"
    },
    "countryCode": "FR",
    "quote": "Ce qui change tout avec Talentiques, c'est la structure. J'étais complètement dispersée dans mes candidatures. Grâce à l'accompagnement pas à pas et aux outils de suivi, j'ai repris le contrôle et j'ai décroché mon poste en moins de deux mois. Une équipe ultra disponible."
  },
  {
    "name": "Brigitte Nantel",
    "country": {
      "fr": "Canada",
      "en": "Canada"
    },
    "countryCode": "CA",
    "quote": "Au Québec, le marché a ses propres codes. L'équipe a su adapter toute ma stratégie avec une précision chirurgicale. Le suivi quotidien m'a permis de rester motivée et de cibler exactement les bons décideurs. Résultat : contrat signé !"
  },
  {
    "name": "Ludovic Bernard",
    "country": {
      "fr": "France",
      "en": "France"
    },
    "countryCode": "FR",
    "quote": "Avant Talentiques, j'envoyais des dizaines de CV dans le vide. Le diagnostic initial m'a ouvert les yeux sur mon réel positionnement. L'équipe m'a challengé à chaque étape jusqu'aux entretiens finaux. Un vrai investissement sur ma carrière."
  },
  {
    "name": "Souleymane Bachir Ba",
    "country": {
      "fr": "Canada",
      "en": "Canada"
    },
    "countryCode": "CA",
    "quote": "L'accompagnement de A à Z m'a fait gagner un temps précieux. On ne se sent jamais seul dans sa recherche : les feedbacks sont rapides, les conseils sont concrets et l'organisation est millimétrée."
  },
  {
    "name": "Sebastião João Da Graça",
    "country": {
      "fr": "Suisse",
      "en": "Switzerland"
    },
    "countryCode": "CH",
    "quote": "Une approche très rigoureuse et professionnelle, indispensable pour le marché suisse. L'équipe Talentiques maîtrise parfaitement son sujet et sait mettre en valeur les compétences clés. Opportunité décrochée avec brio."
  },
  {
    "name": "Soron Bendani",
    "country": {
      "fr": "Émirats arabes unis",
      "en": "United Arab Emirates"
    },
    "countryCode": "AE",
    "quote": "Changer de pays et chercher une opportunité à l'international semblait complexe. Talentiques m'a apporté la clarté et la méthode de ciblage nécessaires pour convaincre rapidement les recruteurs ici. Merci infiniment à toute l'équipe !"
  },
  {
    "name": "Jean-Félix Ahonzo",
    "country": {
      "fr": "Canada",
      "en": "Canada"
    },
    "countryCode": "CA",
    "quote": "Une méthode claire, humaine et redoutablement efficace. L'équipe ne fait pas de fausses promesses : elle vous donne les bons leviers et le bon rythme pour réussir. Objectif atteint !"
  },
  {
    "name": "Saad El boudali",
    "country": {
      "fr": "France",
      "en": "France"
    },
    "countryCode": "FR",
    "quote": "J'avais seulement besoin d'un repositionnement de mon profil et d'une refonte de mon CV. La différence de visibilité a été immédiate sur LinkedIn : les recruteurs ont enfin commencé à venir vers moi directement."
  },
  {
    "name": "Marie Jambé",
    "country": {
      "fr": "France",
      "en": "France"
    },
    "countryCode": "FR",
    "quote": "Mon profil manquait cruellement de clarté. L'équipe Talentiques a su faire ressortir mes forces et mon expertise en quelques ajustements clés. Simple, fluide et ultra professionnel."
  },
  {
    "name": "Cedric Moizan",
    "country": {
      "fr": "France",
      "en": "France"
    },
    "countryCode": "FR",
    "quote": "L'audit de mon profil a été un vrai déclic. En retravaillant mes messages d'accroche et mon CV, le taux de réponse de mes contacts a triplé dès la première semaine."
  },
  {
    "name": "Sophie Billier",
    "country": {
      "fr": "France",
      "en": "France"
    },
    "countryCode": "FR",
    "quote": "Un travail remarquable sur l'optimisation de mes candidatures. Tout est devenu plus cohérent, plus percutant, et surtout aligné avec ce que je recherchais vraiment."
  },
  {
    "name": "Elene Vardakas",
    "country": {
      "fr": "Belgique",
      "en": "Belgium"
    },
    "countryCode": "BE",
    "quote": "L'optimisation complète de mon profil a transformé la perception de mon parcours. L'équipe sait poser les bonnes questions pour valoriser chaque expérience sans en faire trop."
  },
  {
    "name": "Frederic Lahssen",
    "country": {
      "fr": "France",
      "en": "France"
    },
    "countryCode": "FR",
    "quote": "Efficace, direct et pragmatique. Mon CV et ma présence pro ont pris une tout autre dimension. Je recommande les yeux fermés."
  },
  {
    "name": "Lea Cuisinier",
    "country": {
      "fr": "France",
      "en": "France"
    },
    "countryCode": "FR",
    "quote": "Le système de suivi centralisé évite tout le stress de la recherche. On sait exactement qui relancer, quand le faire et avec quel message. Finie la désorganisation !"
  },
  {
    "name": "Jean michel piot",
    "country": {
      "fr": "France",
      "en": "France"
    },
    "countryCode": "FR",
    "quote": "Des outils concrets et une vraie méthode actionnable. On passe de la recherche passive à un pilotage stratégique de ses opportunités au quotidien."
  },
  {
    "name": "Antoine Doudjidingao",
    "country": {
      "fr": "France",
      "en": "France"
    },
    "countryCode": "FR",
    "quote": "Ce que j'ai le plus apprécié, c'est la clarté du système. On ne perd plus son temps à chercher comment s'y prendre : on applique la démarche et les résultats suivent."
  },
  {
    "name": "Ibrahima Djouno Diallo",
    "country": {
      "fr": "Sénégal",
      "en": "Senegal"
    },
    "countryCode": "SN",
    "quote": "Les trames et la structure proposées par Talentiques m'ont permis de structurer mes démarches comme un pro. Une équipe disponible et un outil indispensable."
  },
  {
    "name": "Patrice Larocque",
    "country": {
      "fr": "Canada",
      "en": "Canada"
    },
    "countryCode": "CA",
    "quote": "Une plateforme et des outils pensés pour agir vite et bien. Le système de relance et de suivi fait toute la différence par rapport à une recherche classique."
  }
];
export type Locale = 'fr' | 'en';

// Add verified beneficiary and bank details here; never insert sample accounts.
export const moroccanBanks: {
  id: string;
  name: string;
  details: { beneficiary: string; rib: string; iban?: string; instructions?: string } | null;
}[] = [
  { id: 'cih', name: 'CIH Bank', details: null },
  { id: 'attijari', name: 'Attijariwafa Bank', details: null },
  { id: 'populaire', name: 'Banque Populaire / Chaabi', details: null },
  { id: 'other', name: 'Autre banque', details: null },
];
export const transferContactUrl = 'https://wa.me/212610778015';

export function getTransferWhatsAppUrl(bankId: string) {
  const bankNames: Record<string, string> = { cih: 'CIH Bank', attijari: 'Attijariwafa Bank', populaire: 'Banque Populaire' };
  const message = bankId === 'other'
    ? 'Bonjour Talentiques,\nje souhaite acheter Career Search 360 par virement bancaire.\nJe n’utilise pas les banques proposées.\nPouvez-vous m’indiquer les coordonnées adaptées ?'
    : bankNames[bankId]
      ? `Bonjour Talentiques,\nje souhaite acheter Career Search 360 par virement bancaire via ${bankNames[bankId]}.\nPouvez-vous m’envoyer les coordonnées de paiement ?`
      : null;
  return message ? `${transferContactUrl}?text=${encodeURIComponent(message)}` : transferContactUrl;
}

// ISO 3166-1 country/territory codes. Labels are localised on the server.
export const countryCodes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');

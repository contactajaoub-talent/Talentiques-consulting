export const prospectStatuses = [
  'Nouveau',
  'À qualifier',
  'À contacter',
  'Contacté',
  'A répondu',
  'Intéressé',
  'Offre envoyée',
  'Relance',
  'Client',
  'Perdu',
] as const;

export type ProspectStatus = (typeof prospectStatuses)[number];
export type Currency = 'EUR' | 'USD';
export type Channel = 'LinkedIn' | 'Email' | 'WhatsApp';
export type TaskStatus = 'À faire' | 'En cours' | 'Terminée' | 'Annulée';
export type ActionType = 'Message LinkedIn' | 'Email' | 'WhatsApp' | 'Appel' | 'Relance' | 'Qualification' | 'Offre';

export type Activity = {
  id: string;
  type: 'created' | 'linkedin' | 'email' | 'reply' | 'status' | 'offer' | 'follow_up' | 'sale' | 'note';
  label: string;
  detail?: string;
  occurredAt: string;
};

export type Prospect = {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  language: 'FR' | 'EN';
  jobTitle: string;
  company: string;
  linkedinUrl: string;
  email: string;
  phone: string;
  whatsapp: string;
  verificationStatus: 'Vérifié' | 'À vérifier' | 'Non vérifié';
  dataSource: string;
  source: string;
  linkedinRelation: '1er niveau' | '2e niveau' | '3e niveau' | 'Hors réseau';
  score: number;
  segment: string;
  market: string;
  marketId: string;
  activeSearch: boolean;
  potentialProduct: string;
  recommendedOfferId?: string;
  recommendationReason?: string;
  recommendationConfidence?: number;
  profileType?: 'Professional' | 'Student' | 'Alternant' | 'Job seeker' | 'Career transition' | 'Entrepreneur' | 'Other';
  yearsExperience?: number;
  currentSituation?: string;
  careerGoal?: string;
  opportunityType?: string;
  mainNeed?: string;
  budgetRange?: string;
  priority?: number;
  suggestedScore?: number;
  doNotContact?: boolean;
  tags: string[];
  status: ProspectStatus;
  lastAction: string;
  nextAction: string;
  nextActionAt: string;
  nextActionType: ActionType;
  taskStatus: TaskStatus;
  nextTaskId?: string;
  owner: string;
  notes: string;
  campaignId: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
};

export type Campaign = {
  id: string;
  name: string;
  marketId: string;
  marketName: string;
  language: 'FR' | 'EN';
  catalogItemId?: string;
  audience?: string;
  status: 'Active' | 'En pause' | 'Terminée';
  product: string;
  revenue: number;
  currency: Currency;
  startsAt?: string;
  endsAt?: string;
  targetCount?: number;
  revenueTarget?: number;
};

export type MarketRecord = { id: string; name: string; country: string; countryCode: string; region?: string; language: 'FR' | 'EN'; defaultCurrency: Currency; timezone: string; active: boolean; notes?: string };
export type CatalogItem = { id: string; name: string; slug: string; category: string; offerType: 'service' | 'digital_product' | 'bundle' | 'system'; audience: string; description: string; priceEur: number | null; priceUsd: number | null; active: boolean; salesEnabled: boolean; publicUrl?: string; eligibilityRules?: Record<string, unknown>; tags: string[] };
export type Opportunity = { id: string; prospectId: string; catalogItemId: string; campaignId?: string; stage: string; quotedAmount: number | null; currency: Currency; status: string; recommendationSource: string; wonAt?: string; lostAt?: string; lostReason?: string };
export type AutomationSettings = { timezone: string; followupAfterContactDays: number; followupAfterOfferDays: number; automationEnabled: boolean; defaultOwner: string };

export type MessageTemplate = {
  id: string;
  name: string;
  channel: Channel;
  language: 'FR' | 'EN';
  product: string;
  stage: string;
  campaign: string | 'Toutes';
  body: string;
  updatedAt: string;
  active?: boolean;
};

export type AcquisitionState = {
  prospects: Prospect[];
  markets: MarketRecord[];
  campaigns: Campaign[];
  catalogItems: CatalogItem[];
  opportunities: Opportunity[];
  templates: MessageTemplate[];
  settings: AutomationSettings;
  revenue: Record<Currency, number>;
};

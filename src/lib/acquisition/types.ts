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
export type Market = 'Canada FR' | 'Canada EN' | 'Belgique' | 'Suisse' | 'Luxembourg';
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
  market: Market;
  activeSearch: boolean;
  potentialProduct: string;
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
  name: Market;
  status: 'Active' | 'En pause' | 'Terminée';
  product: string;
  revenue: number;
  currency: 'EUR' | 'CAD' | 'CHF';
};

export type MessageTemplate = {
  id: string;
  name: string;
  channel: Channel;
  language: 'FR' | 'EN';
  product: string;
  stage: string;
  campaign: Market | 'Toutes';
  body: string;
  updatedAt: string;
  active?: boolean;
};

export type AcquisitionState = {
  prospects: Prospect[];
  campaigns: Campaign[];
  templates: MessageTemplate[];
};

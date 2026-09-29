import type { AcquisitionState, Activity, Campaign, Market, MessageTemplate, Prospect, ProspectStatus } from './types';

const names = [
  ['Amélie', 'Gagnon', 'Canada', 'Montréal', 'FR', 'Talent Acquisition Partner', 'Boréal Conseil', 'Canada FR'],
  ['Daniel', 'Brooks', 'Canada', 'Toronto', 'EN', 'Product Operations Manager', 'Northline Labs', 'Canada EN'],
  ['Sophie', 'Lambert', 'Belgique', 'Bruxelles', 'FR', 'HR Business Partner', 'Atelier Nova', 'Belgique'],
  ['Nicolas', 'Meier', 'Suisse', 'Genève', 'FR', 'Senior Financial Analyst', 'Helvetia Partners', 'Suisse'],
  ['Claire', 'Weber', 'Luxembourg', 'Luxembourg', 'FR', 'Compliance Specialist', 'Arden Capital', 'Luxembourg'],
  ['Maya', 'Chen', 'Canada', 'Vancouver', 'EN', 'Customer Success Lead', 'Cedar Cloud', 'Canada EN'],
  ['Julien', 'Roy', 'Canada', 'Québec', 'FR', 'Chef de projet digital', 'Cap Nord', 'Canada FR'],
  ['Élise', 'Martin', 'Belgique', 'Liège', 'FR', 'Consultante RH', 'Pulse People', 'Belgique'],
  ['Adam', 'Schneider', 'Suisse', 'Lausanne', 'FR', 'Data Product Manager', 'Leman Systems', 'Suisse'],
  ['Laura', 'Hoffmann', 'Luxembourg', 'Esch-sur-Alzette', 'FR', 'Fund Operations Officer', 'Mosaïque Finance', 'Luxembourg'],
] as const;

const statuses: ProspectStatus[] = ['À contacter', 'Contacté', 'A répondu', 'Intéressé', 'Offre envoyée', 'Relance', 'Nouveau', 'Client', 'À qualifier', 'Perdu'];
const products = ['Optimisation LinkedIn', 'CV ATS Premium', 'Pack Carrière 360', 'Coaching Entretien'];

function isoAt(dayOffset: number, hour: number) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString();
}

function activity(id: string, label: string, type: Activity['type'], dayOffset: number, detail?: string): Activity {
  return { id, label, type, detail, occurredAt: isoAt(dayOffset, 10) };
}

export function buildDemoState(): AcquisitionState {
  const prospects: Prospect[] = names.map((item, index) => {
    const [firstName, lastName, country, city, language, jobTitle, company, market] = item;
    const status = statuses[index];
    const product = products[index % products.length];
    const createdAt = isoAt(-14 - index, 9);
    return {
      id: `demo-${index + 1}`,
      firstName,
      lastName,
      country,
      city,
      language,
      jobTitle,
      company,
      linkedinUrl: `https://www.linkedin.com/in/demo-${firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}-${lastName.toLowerCase()}`,
      email: `${firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.${lastName.toLowerCase()}@example.com`,
      phone: index % 3 === 0 ? '+000 000 000 000' : '',
      whatsapp: index % 3 === 0 ? '+000 000 000 000' : '',
      verificationStatus: index % 3 === 0 ? 'À vérifier' : 'Vérifié',
      dataSource: index % 2 ? 'Import manuel' : 'Recherche LinkedIn',
      source: index % 2 ? 'Recommandation' : 'LinkedIn',
      linkedinRelation: index % 3 === 0 ? '2e niveau' : '3e niveau',
      score: 92 - index * 5,
      segment: index % 2 ? 'Cadre confirmé' : 'Talent à forte intention',
      market: market as Market,
      activeSearch: index % 3 !== 1,
      potentialProduct: product,
      tags: [language === 'FR' ? 'Francophone' : 'English', index < 5 ? 'Prioritaire' : 'Nurturing'],
      status,
      lastAction: index === 0 ? 'Profil qualifié' : index === 1 ? 'Message LinkedIn envoyé' : 'Statut mis à jour',
      nextAction: status === 'Client' || status === 'Perdu' ? 'Aucune action' : index % 2 ? 'Relancer avec un cas client' : 'Envoyer le premier message',
      nextActionAt: status === 'Client' || status === 'Perdu' ? '' : isoAt(index % 4 === 0 ? 0 : index % 3, 9 + (index % 6)),
      nextActionType: index % 2 ? 'Relance' : 'Message LinkedIn',
      taskStatus: status === 'Client' || status === 'Perdu' ? 'Terminée' : 'À faire',
      owner: 'Othmane',
      notes: index === 0 ? 'Profil très aligné avec une offre premium. Personnaliser l’accroche autour de la mobilité.' : '',
      campaignId: `campaign-${(index % 5) + 1}`,
      createdAt,
      updatedAt: isoAt(-index, 15),
      activities: [
        activity(`activity-${index}-1`, 'Prospect créé', 'created', -14 - index, 'Ajouté depuis une source fictive de démonstration.'),
        ...(index < 6 ? [activity(`activity-${index}-2`, 'Statut mis à jour', 'status', -index, `Nouveau statut : ${status}`)] : []),
        ...(index > 0 && index < 6 ? [activity(`activity-${index}-3`, 'Message LinkedIn', 'linkedin', -index + 1, 'Premier contact manuel enregistré.')] : []),
      ],
    };
  });

  const campaigns: Campaign[] = (['Canada FR', 'Canada EN', 'Belgique', 'Suisse', 'Luxembourg'] as const).map((name, index) => ({
    id: `campaign-${index + 1}`,
    name,
    status: index === 4 ? 'En pause' : 'Active',
    product: products[index % products.length],
    revenue: [2470, 1840, 1290, 2210, 790][index],
    currency: name.startsWith('Canada') ? 'CAD' : name === 'Suisse' ? 'CHF' : 'EUR',
  }));

  const templates: MessageTemplate[] = [
    { id: 'template-1', name: 'Prise de contact personnalisée', channel: 'LinkedIn', language: 'FR', product: 'Pack Carrière 360', stage: 'Premier contact', campaign: 'Canada FR', body: 'Bonjour {{prénom}}, votre parcours chez {{entreprise}} a retenu mon attention. J’accompagne des profils comme le vôtre à clarifier et accélérer leur prochaine étape professionnelle. Ouvert(e) à un bref échange ?', updatedAt: isoAt(-2, 11) },
    { id: 'template-2', name: 'Career conversation opener', channel: 'LinkedIn', language: 'EN', product: 'CV ATS Premium', stage: 'Premier contact', campaign: 'Canada EN', body: 'Hi {{first_name}}, I came across your work at {{company}}. I help ambitious professionals strengthen their positioning and job-search assets. Would a short conversation be useful right now?', updatedAt: isoAt(-3, 14) },
    { id: 'template-3', name: 'Relance valeur ajoutée', channel: 'Email', language: 'FR', product: 'Optimisation LinkedIn', stage: 'Relance', campaign: 'Toutes', body: 'Bonjour {{prénom}}, je me permets une courte relance. J’ai identifié deux optimisations concrètes sur votre positionnement qui pourraient rendre votre profil plus visible. Souhaitez-vous que je vous les partage ?', updatedAt: isoAt(-5, 9) },
    { id: 'template-4', name: 'Suivi WhatsApp', channel: 'WhatsApp', language: 'FR', product: 'Coaching Entretien', stage: 'Après réponse', campaign: 'Belgique', body: 'Bonjour {{prénom}}, merci pour votre retour. Je peux vous proposer un échange de 15 minutes pour comprendre votre objectif et voir si notre accompagnement est pertinent.', updatedAt: isoAt(-1, 16) },
  ];

  return { prospects, campaigns, templates };
}

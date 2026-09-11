import {
  Briefcase,
  FileSignature,
  GraduationCap,
  Palette,
  Target,
  Users,
  TrendingUp,
  Laptop,
  BookOpen,
  FileText,
  ClipboardCheck,
  Table2,
} from 'lucide-react';

export const content = {
  businessName: 'TalentiQues',
  hero: {
    badge: 'CARRIÈRE & IMAGE PROFESSIONNELLE',
    title: {
      part1: 'Valorisez votre image.',
      highlight: 'Donnez plus de force à votre candidature',
    },
    description:
      'CV ATS, lettre de motivation, profil LinkedIn, ressources pratiques et accompagnement personnalisé pour mieux candidater en France, Belgique, Suisse, Luxembourg et au Canada francophone.',
    cta: 'Analyser mon CV gratuitement',
  },
  mission: {
    title: 'Une approche simple, claire et personnalisée',
    description:
      "TalentiQues aide les étudiants, demandeurs d'emploi et professionnels à mieux présenter leur valeur, structurer leur candidature et avancer avec une méthode adaptée à leur objectif et au marché visé.",
    stats: [
      { number: '48–72h', label: 'Délai de livraison des packs' },
      { number: '2', label: 'Offres d’optimisation claires' },
      { number: '5', label: 'Marchés francophones ciblés' },
      { number: '100%', label: 'Approche personnalisée' },
    ],
  },
  targets: [
    { title: 'Étudiants', objective: 'Stage, alternance, premier emploi.', icon: GraduationCap },
    { title: "Demandeurs d'emploi", objective: 'Renforcer leur candidature et leur visibilité.', icon: Users },
    { title: 'Professionnels', objective: 'Évolution, transition ou repositionnement.', icon: Briefcase },
    { title: 'Freelances', objective: 'Structurer leur image professionnelle.', icon: Laptop },
  ],
  services: [
    {
      title: 'Valorisation professionnelle complète',
      audience: 'Salarié en poste · profil expérimenté · évolution ou transition',
      description:
        'Refonte complète de votre candidature pour construire une image professionnelle plus claire, cohérente et crédible.',
      features: [
        'CV optimisé ATS — Word modifiable + PDF',
        'Lettre de motivation personnalisée — 1 cible',
        'Optimisation complète du profil LinkedIn',
        'Tableau de suivi des candidatures offert',
        'Corrections illimitées jusqu’à satisfaction',
      ],
      icon: FileSignature,
      price: '60 €',
      delay: 'Livraison sous 48–72h ouvrées',
      paypal: 'https://www.paypal.com/ncp/payment/X28ZHEKETU8FA',
      cta: 'Accélérer mon évolution',
      popular: true,
    },
    {
      title: "Pack Étudiant & Demandeur d’emploi",
      audience: "Étudiant · alternant · demandeur d'emploi · personne sans emploi",
      description:
        "Le même niveau de qualité et les mêmes livrables, avec un tarif d'accès réservé aux profils éligibles sur justificatif.",
      features: [
        'CV optimisé ATS — Word modifiable + PDF',
        'Lettre de motivation personnalisée — 1 cible',
        'Optimisation complète du profil LinkedIn',
        'Tableau de suivi des candidatures offert',
        'Corrections illimitées jusqu’à satisfaction',
      ],
      icon: GraduationCap,
      price: '30 €',
      delay: 'Livraison sous 48–72h ouvrées · justificatif requis',
      paypal: 'https://www.paypal.com/ncp/payment/268NRKMDVVJB2',
      cta: 'Relancer ma candidature',
    },
  ],
  promises: [
    {
      title: 'Clarté',
      description: 'Un message professionnel lisible et immédiatement compréhensible.',
      icon: Target,
    },
    {
      title: 'Cohérence',
      description: 'CV, lettre et LinkedIn alignés autour du même positionnement.',
      icon: Palette,
    },
    {
      title: 'Approche humaine',
      description: 'Une rédaction et des recommandations adaptées à votre parcours réel.',
      icon: Users,
    },
    {
      title: 'Mise en action',
      description: 'Des supports directement exploitables pour vos candidatures.',
      icon: TrendingUp,
    },
  ],
  process: [
    { step: '01', title: 'Analyse du profil', description: 'Étude du parcours, des compétences et des supports existants.' },
    { step: '02', title: 'Clarification de l’objectif', description: 'Définition du poste cible, du marché et du positionnement.' },
    { step: '03', title: 'Optimisation des supports', description: 'Refonte du CV, de la lettre et du profil LinkedIn selon les besoins.' },
    { step: '04', title: 'Relecture & ajustements', description: 'Vérification de la cohérence, de la rédaction et des derniers détails.' },
    { step: '05', title: 'Livraison & mise en action', description: 'Remise des documents finalisés et du tableau de suivi des candidatures.' },
  ],
  resources: {
    free: [
      { title: 'Modèle CV ATS', description: 'Une base claire et structurée pour démarrer.', icon: FileText, status: 'Bientôt disponible' },
      { title: 'Checklist CV', description: 'Les vérifications essentielles avant chaque candidature.', icon: ClipboardCheck, status: 'Bientôt disponible' },
      { title: 'Guide LinkedIn', description: 'Les fondamentaux pour rendre votre profil plus lisible.', icon: BookOpen, status: 'Bientôt disponible' },
      { title: 'Tableau de suivi', description: 'Un modèle simple pour organiser vos candidatures.', icon: Table2, status: 'Bientôt disponible' },
    ],
    paid: [
      { title: 'Kit CV ATS', description: 'Modèles, guide, exemples et checklist.', status: 'À venir' },
      { title: 'Kit LinkedIn', description: 'Structure, méthodes et exemples pratiques.', status: 'À venir' },
      { title: "Kit Recherche d’emploi", description: 'Organisation, relances et préparation des candidatures.', status: 'À venir' },
      { title: 'Kit Alternance 90 jours', description: 'Méthode et outils pour structurer une recherche d’alternance.', status: 'À venir' },
    ],
  },
  accompaniment: {
    title: 'Accompagnement carrière francophone',
    description:
      'Un suivi personnalisé pour structurer votre projet, renforcer votre dossier et organiser votre recherche sur les marchés francophones.',
    markets: ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada francophone'],
    tracks: [
      { title: "Recherche d’emploi", description: 'Positionnement, stratégie, candidatures et suivi.' },
      { title: 'Recherche d’alternance', description: 'Dossier, ciblage, candidatures et préparation aux entretiens.' },
      { title: 'Carrière francophone', description: 'Adaptation du profil et de la stratégie au marché ciblé.' },
    ],
  },
  testimonials: [
    { name: 'Client Talentiques', role: 'Professionnel', content: 'Accompagnement structuré, rédaction soignée et supports faciles à utiliser.', rating: 5 },
    { name: 'Client Talentiques', role: "Recherche d'emploi", content: 'Le travail a permis de clarifier mon positionnement et de mieux présenter mon parcours.', rating: 5 },
    { name: 'Client Talentiques', role: 'Étudiant', content: 'Des documents plus clairs et une méthode simple pour mieux organiser mes candidatures.', rating: 5 },
  ],
  contact: {
    email: 'talentiques@gmail.com',
    phone: '+212 610 778 015',
    whatsapp: '+212 610 778 015',
    address: 'France · Belgique · Suisse · Luxembourg · Canada francophone',
    socials: {
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
    },
  },
  blog: {
    title: 'Conseils carrière & candidature',
    subtitle: 'Des contenus pratiques sur le CV ATS, LinkedIn, la recherche d’emploi, l’alternance et les marchés francophones.',
    categories: ['Tout', 'CV ATS', 'LinkedIn', 'Recherche d’emploi', 'Alternance', 'Marchés francophones'],
    posts: [
      {
        id: 1,
        title: 'CV ATS : comment construire un CV plus lisible ?',
        excerpt: 'Comprendre les principes de lisibilité, de structure et de mots-clés sans tomber dans les fausses promesses.',
        category: 'CV ATS',
        image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop',
        date: '08 Sep 2026', readTime: '6 min', author: 'Team TalentiQues', slug: 'cv-ats-comment-construire-cv-lisible',
      },
      {
        id: 2,
        title: 'LinkedIn : rendre son profil plus clair pour les recruteurs',
        excerpt: 'Titre, résumé, compétences et cohérence globale : les éléments à travailler en priorité.',
        category: 'LinkedIn',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
        date: '08 Sep 2026', readTime: '7 min', author: 'Team TalentiQues', slug: 'linkedin-profil-clair-recruteurs',
      },
      {
        id: 3,
        title: 'Comment organiser une recherche d’emploi efficacement',
        excerpt: 'Une méthode simple pour cibler les offres, suivre les candidatures et relancer au bon moment.',
        category: 'Recherche d’emploi',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop',
        date: '08 Sep 2026', readTime: '8 min', author: 'Team TalentiQues', slug: 'organiser-recherche-emploi-efficacement',
      },
      {
        id: 4,
        title: 'Candidater sur les marchés francophones : les points à adapter',
        excerpt: 'France, Belgique, Suisse, Luxembourg et Canada francophone : ce qui mérite une vraie adaptation.',
        category: 'Marchés francophones',
        image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=2070&auto=format&fit=crop',
        date: '08 Sep 2026', readTime: '8 min', author: 'Team TalentiQues', slug: 'candidater-marches-francophones',
      },
    ],
  },
  careers: {
    title: "Rejoignez l'équipe",
    subtitle: 'Les opportunités internes seront publiées ici lorsqu’elles seront ouvertes.',
    jobs: [] as Array<{
      slug: string;
      title: string;
      department: string;
      location: string;
      type: string;
      description: string;
      requirements: string[];
    }>,
  },
};

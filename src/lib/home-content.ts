import { getStoreProduct } from '@/lib/store/catalog';

export type HomeLocale = 'fr' | 'en';

export function getHomeContent(locale: HomeLocale) {
  const fr = locale === 'fr';
  const market = locale;
  return {
    locale,
    home: fr ? '/' : '/en',
    switchHref: fr ? '/en' : '/',
    switchLabel: fr ? 'EN' : 'FR',
    nav: fr
      ? [
          ['Ressources', '/#resources'], ['Services', '/#services'],
          ['Alternance', 'https://alternance.talentiques.com/'], ['Blog', '/blog'], ['Contact', '/#contact'],
        ]
      : [
          ['Resources', '/en#resources'], ['Services', '/en#services'],
          ['Work-study', 'https://alternance.talentiques.com/'], ['Blog', '/blog'], ['Contact', '/en#contact'],
        ],
    resourcesCta: fr ? 'Découvrir les ressources' : 'Explore resources',
    hero: {
      eyebrow: fr ? 'L’ÉCOSYSTÈME DES OPPORTUNITÉS PROFESSIONNELLES' : 'THE PROFESSIONAL OPPORTUNITIES ECOSYSTEM',
      title: fr ? 'Accédez à de meilleures opportunités professionnelles.' : 'Access better professional opportunities.',
      description: fr
        ? 'Talentiques réunit outils, ressources, services et parcours spécialisés pour vous aider à renforcer votre profil, structurer votre recherche et avancer vers la bonne opportunité.'
        : 'Talentiques brings together tools, resources, services and specialized programs to help you strengthen your profile, structure your search and move toward the right opportunity.',
      secondary: fr ? 'Découvrir Talentiques' : 'Discover Talentiques',
    },
    approach: {
      title: fr ? 'L’approche TalentiQues' : 'The TalentiQues approach',
      description: fr
        ? 'Une démarche claire et structurée pour mieux préparer, organiser et saisir vos opportunités professionnelles.'
        : 'A clear, structured approach to better prepare, organize and capture professional opportunities.',
      items: fr
        ? [
            ['Clarté', 'Un objectif et un positionnement immédiatement compréhensibles.'],
            ['Cohérence', 'Un profil et des actions alignés avec l’opportunité ciblée.'],
            ['Approche humaine', 'Des recommandations adaptées à votre parcours réel.'],
            ['Mise en action', 'Des ressources directement exploitables pour avancer.'],
          ]
        : [
            ['Clarity', 'A goal and positioning that are immediately understandable.'],
            ['Consistency', 'A profile and actions aligned with the target opportunity.'],
            ['Human approach', 'Recommendations tailored to your actual background.'],
            ['Action', 'Practical resources you can use to move forward.'],
          ],
    },
    resources: {
      eyebrow: fr ? 'RESSOURCES TALENTIQUES' : 'TALENTIQUES RESOURCES',
      title: fr ? 'Des ressources pour structurer chaque étape.' : 'Resources to structure every step.',
      description: fr
        ? 'Outils complets et ressources pratiques réunis dans une même sélection.'
        : 'Complete tools and practical resources brought together in one selection.',
      discover: fr ? 'Découvrir' : 'Discover',
      free: fr ? 'GRATUIT' : 'FREE',
      soon: fr ? 'À bientôt' : 'Coming soon',
      paid: [
        { ...getStoreProduct('ats', market), href: fr ? '/outils/cv-ats' : '/en/tools/ats-resume' },
        { ...getStoreProduct('tracker', market), href: fr ? '/outils/opportunity-tracker' : '/en/tools/opportunity-tracker' },
        { ...getStoreProduct('bundle', market), href: fr ? '/outils/bundle' : '/en/tools/bundle' },
      ],
      freeItems: fr
        ? [
            ['Modèle CV ATS', 'Une base claire et structurée pour démarrer.'],
            ['Checklist CV', 'Les vérifications essentielles avant chaque candidature.'],
            ['Guide LinkedIn', 'Les fondamentaux pour rendre votre profil plus lisible.'],
            ['Tableau de suivi', 'Un modèle simple pour organiser vos candidatures.'],
          ]
        : [
            ['ATS Resume Template', 'A clear, structured foundation to get started.'],
            ['Resume Checklist', 'Essential checks before every application.'],
            ['LinkedIn Guide', 'The fundamentals for a clearer professional profile.'],
            ['Application Tracker', 'A simple template to organize your applications.'],
          ],
    },
    alternance: {
      title: 'Alternance Talentiques',
      description: fr
        ? 'Un parcours dédié pour structurer votre recherche d’alternance, de votre positionnement jusqu’au suivi des candidatures et des entretiens.'
        : 'A dedicated program to structure your work-study search, from positioning through application and interview follow-up.',
      cta: fr ? 'Découvrir Alternance Talentiques' : 'Discover Alternance Talentiques',
    },
    services: {
      eyebrow: fr ? 'SERVICES TALENTIQUES' : 'TALENTIQUES SERVICES',
      title: fr ? 'Un accompagnement personnalisé pour votre candidature.' : 'Personalized support for your application.',
      description: fr
        ? 'Deux offres ciblées pour renforcer votre profil avec un travail adapté à votre situation.'
        : 'Two focused offers to strengthen your profile with work tailored to your situation.',
      payment: fr ? 'paiement unique' : 'one-time payment',
      recommended: fr ? 'Recommandé' : 'Recommended',
      paymentNote: fr ? 'Demande enregistrée avant le paiement PayPal' : 'Request registered before PayPal payment',
    },
    process: {
      eyebrow: fr ? 'Notre méthodologie' : 'Our method',
      title: fr ? 'Une méthode simple en 5 étapes' : 'A simple five-step method',
      description: fr
        ? 'Un cadre clair pour avancer de votre objectif vers la prochaine opportunité.'
        : 'A clear framework to move from your goal toward the next opportunity.',
      steps: fr
        ? [
            ['01', 'Définir', 'Clarifiez votre objectif et les opportunités ciblées.'],
            ['02', 'Se positionner', 'Construisez un profil cohérent avec votre objectif.'],
            ['03', 'Identifier', 'Repérez les opportunités réellement pertinentes.'],
            ['04', 'Agir', 'Candidatez, développez votre réseau et relancez.'],
            ['05', 'Convertir', 'Préparez vos échanges et avancez vers la prochaine étape.'],
          ]
        : [
            ['01', 'Define', 'Clarify your goal and the opportunities you are targeting.'],
            ['02', 'Position', 'Build a profile that is consistent with your goal.'],
            ['03', 'Identify', 'Find the opportunities that are genuinely relevant.'],
            ['04', 'Act', 'Apply, grow your network and follow up.'],
            ['05', 'Convert', 'Prepare your conversations and move toward the next step.'],
          ],
    },
    contact: {
      badge: fr ? 'Disponible pour vous' : 'Here for you',
      title: fr ? 'Vous ne savez pas par où commencer ?' : 'Not sure where to start?',
      description: fr
        ? 'Parlez-nous de votre objectif. Talentiques vous aidera à identifier le point de départ adapté.'
        : 'Tell us about your goal. Talentiques will help you identify the right starting point.',
    },
  };
}

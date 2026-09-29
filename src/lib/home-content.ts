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
          ['Outils', '/outils'], ['Services', '/#services'],
          ['Alternance', 'https://alternance.talentiques.com/'], ['Blog', '/blog'], ['Contact', '/#contact'],
        ]
      : [
          ['Tools', '/en/tools'], ['Services', '/en#services'],
          ['Work-study', 'https://alternance.talentiques.com/'], ['Blog', '/blog'], ['Contact', '/en#contact'],
        ],
    diagnosticCta: fr ? 'Diagnostic CV ATS gratuit' : 'Free ATS Resume Check',
    hero: {
      eyebrow: fr ? 'L’ÉCOSYSTÈME TALENTIQUES' : 'THE TALENTIQUES ECOSYSTEM',
      titleStart: fr ? 'Accédez à de meilleures' : 'Access better',
      titleHighlight: fr ? 'opportunités professionnelles.' : 'professional opportunities.',
      description: fr
        ? 'Talentiques réunit des services, des outils et des parcours spécialisés pour vous aider à mieux vous positionner, structurer votre recherche et avancer vers la bonne opportunité.'
        : 'Talentiques brings together services, tools and specialized programs to help you position yourself more effectively, structure your search and move toward the right opportunity.',
      servicesCta: fr ? 'Découvrir nos services' : 'Explore our services',
      toolsCta: fr ? 'Découvrir nos outils' : 'Explore our tools',
      visualLabel: fr ? 'UNE DÉMARCHE COHÉRENTE' : 'ONE COHERENT APPROACH',
      visualItems: fr
        ? [
            ['Se positionner', 'Clarifier votre profil et votre valeur.'],
            ['Structurer', 'Organiser votre recherche et vos actions.'],
            ['Avancer', 'Mobiliser les bons outils et parcours.'],
          ]
        : [
            ['Position', 'Clarify your profile and your value.'],
            ['Structure', 'Organize your search and actions.'],
            ['Move forward', 'Use the right tools and programs.'],
          ],
    },
    approach: {
      eyebrow: fr ? 'NOTRE APPROCHE' : 'OUR APPROACH',
      title: fr ? 'Une approche structurée pour avancer vers la bonne opportunité.' : 'A structured approach to move toward the right opportunity.',
      description: fr
        ? 'Talentiques relie positionnement, organisation et passage à l’action dans une même démarche.'
        : 'Talentiques connects positioning, organization and action within one coherent approach.',
      items: fr
        ? [
            ['Se positionner', 'Clarifier son profil, son image professionnelle et sa valeur.'],
            ['Structurer sa recherche', 'Organiser ses opportunités, actions, candidatures, relances et priorités.'],
            ['Avancer avec méthode', 'S’appuyer sur des outils, des parcours et un accompagnement adapté à sa situation.'],
          ]
        : [
            ['Position yourself', 'Clarify your profile, professional image and value.'],
            ['Structure your search', 'Organize opportunities, actions, applications, follow-ups and priorities.'],
            ['Move forward methodically', 'Rely on tools, programs and support suited to your situation.'],
          ],
    },
    credibility: {
      eyebrow: fr ? 'POURQUOI TALENTIQUES' : 'WHY TALENTIQUES',
      title: fr
        ? 'Une démarche pensée pour rendre votre recherche plus claire, plus cohérente et plus maîtrisée.'
        : 'An approach designed to make your search clearer, more consistent and more controlled.',
      description: fr
        ? 'Talentiques vous aide à mieux comprendre votre situation, structurer vos priorités et avancer avec une démarche cohérente.'
        : 'Talentiques helps you better understand your situation, structure your priorities and move forward with a coherent approach.',
      items: fr
        ? [
            ['Clarté', 'Comprendre où vous en êtes et ce qui doit être amélioré.'],
            ['Structure', 'Organiser votre recherche autour d’actions concrètes et suivies.'],
            ['Cohérence', 'Aligner votre profil, vos outils et votre stratégie avec les opportunités ciblées.'],
          ]
        : [
            ['Clarity', 'Understand where you stand and what needs to be improved.'],
            ['Structure', 'Organize your search around concrete, trackable actions.'],
            ['Consistency', 'Align your profile, tools and strategy with the opportunities you are targeting.'],
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
      eyebrow: fr ? 'PARCOURS SPÉCIALISÉ' : 'SPECIALIZED PROGRAM',
      title: 'Alternance Talentiques',
      description: fr
        ? 'Un parcours structuré pour vous aider à clarifier votre positionnement, organiser votre recherche, suivre vos candidatures et mieux préparer vos entretiens.'
        : 'A structured program to help you clarify your positioning, organize your search, track your applications and prepare more effectively for interviews.',
      cta: fr ? 'Découvrir Alternance Talentiques' : 'Discover Alternance Talentiques',
      items: fr
        ? ['Positionnement & stratégie', 'Suivi des candidatures', 'Préparation aux entretiens']
        : ['Positioning & strategy', 'Application tracking', 'Interview preparation'],
    },
    services: {
      eyebrow: fr ? 'SERVICES TALENTIQUES' : 'TALENTIQUES SERVICES',
      title: fr ? 'Un accompagnement adapté lorsque votre situation demande plus.' : 'Tailored support when your situation requires more.',
      description: fr
        ? 'Talentiques propose également un accompagnement personnalisé lorsque votre situation nécessite une intervention plus approfondie.'
        : 'Talentiques also provides personalized support when your situation requires a more in-depth intervention.',
      cards: fr
        ? [
            { audience: 'Professionnels · évolution · transition', title: 'Valorisation professionnelle complète', description: 'Clarifier et renforcer l’ensemble de votre présentation professionnelle pour porter un positionnement plus cohérent.', points: ['CV et supports de candidature', 'Positionnement LinkedIn', 'Cohérence du parcours'], cta: 'Découvrir l’accompagnement' },
            { audience: 'Étudiants · alternants · demandeurs d’emploi', title: 'Pack Étudiant & Demandeur d’emploi', description: 'Construire une candidature plus claire et plus solide, adaptée aux premières expériences et aux périodes de recherche.', points: ['CV optimisé ATS', 'Lettre de motivation ciblée', 'Profil LinkedIn'], cta: 'Découvrir l’accompagnement' },
            { audience: 'Marché francophone', title: 'Accompagnement de A à Z — Marché francophone', description: 'Être accompagné dans la structuration complète de sa démarche, du positionnement au suivi des opportunités.', points: ['Clarification de la stratégie', 'Organisation des actions', 'Suivi adapté à la situation'], cta: 'Réserver un appel découverte' },
          ]
        : [
            { audience: 'Professionals · growth · transition', title: 'Complete Professional Profile Optimization', description: 'Clarify and strengthen your complete professional presentation for a more consistent positioning.', points: ['Resume and application materials', 'LinkedIn positioning', 'Career-story consistency'], cta: 'Explore the support' },
            { audience: 'Students · work-study candidates · job seekers', title: 'Student & Job Seeker Pack', description: 'Build a clearer, stronger application suited to early experience and active job-search periods.', points: ['ATS-optimized resume', 'Targeted cover letter', 'LinkedIn profile'], cta: 'Explore the support' },
            { audience: 'Francophone market', title: 'End-to-End Support — Francophone Market', description: 'Get support structuring your complete approach, from positioning through opportunity follow-up.', points: ['Strategy clarification', 'Action planning', 'Support adapted to your situation'], cta: 'Book a discovery call' },
          ],
    },
    process: {
      eyebrow: fr ? 'MÉTHODE TALENTIQUES' : 'THE TALENTIQUES METHOD',
      title: fr ? 'Une progression claire, de la situation à l’action.' : 'A clear progression from situation to action.',
      description: fr
        ? 'Cinq étapes reliées pour construire une démarche cohérente et la faire avancer.'
        : 'Five connected steps to build a coherent approach and move it forward.',
      steps: fr
        ? [
            ['01', 'Comprendre', 'Clarifier la situation, l’objectif et les priorités.'],
            ['02', 'Positionner', 'Construire un positionnement professionnel cohérent.'],
            ['03', 'Préparer', 'Structurer les outils, supports et actions nécessaires.'],
            ['04', 'Agir', 'Passer à l’exécution avec une démarche organisée.'],
            ['05', 'Suivre', 'Mesurer l’avancement, relancer et ajuster.'],
          ]
        : [
            ['01', 'Understand', 'Clarify the situation, goal and priorities.'],
            ['02', 'Position', 'Build a coherent professional positioning.'],
            ['03', 'Prepare', 'Structure the tools, materials and actions required.'],
            ['04', 'Act', 'Move into execution with an organized approach.'],
            ['05', 'Follow through', 'Measure progress, follow up and adjust.'],
          ],
    },
    contact: {
      badge: fr ? 'Disponible pour vous' : 'Here for you',
      title: fr ? 'Vous ne savez pas par où commencer ?' : 'Not sure where to start?',
      description: fr
        ? 'Présentez-nous votre situation. Nous vous aiderons à identifier l’approche Talentiques la plus adaptée.'
        : 'Tell us about your situation. We will help you identify the most suitable Talentiques approach.',
    },
  };
}

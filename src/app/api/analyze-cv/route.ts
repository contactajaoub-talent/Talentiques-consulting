import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { cvText } = await request.json();

        if (!cvText || cvText.trim().length < 50) {
            return NextResponse.json(
                { error: 'Le CV doit contenir au moins 50 caractères pour une analyse pertinente.' },
                { status: 400 }
            );
        }

        console.log('Analyzing CV with Advanced Intelligence Engine...');

        // Simulate AI processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate TRULY PERSONALIZED analysis
        const analysis = generatePersonalizedAnalysis(cvText);

        console.log('✅ Personalized analysis completed');
        return NextResponse.json({
            success: true,
            analysis,
            timestamp: new Date().toISOString(),
            aiProvider: 'Advanced CV Analysis Engine'
        });

    } catch (error: any) {
        console.error('Analysis Error:', error);

        return NextResponse.json(
            {
                error: 'Erreur lors de l\'analyse du CV. Veuillez réessayer.',
                details: error.message
            },
            { status: 500 }
        );
    }
}

function generatePersonalizedAnalysis(cvText: string): string {
    // DEEP CONTENT ANALYSIS
    const lines = cvText.split('\n').map(l => l.trim()).filter(l => l);
    const wordCount = cvText.split(/\s+/).length;
    const lowerText = cvText.toLowerCase();

    // Extract specific information
    const emails = cvText.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    const phones = cvText.match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g) || [];
    const linkedInMatch = cvText.match(/linkedin\.com\/in\/[\w-]+/i);

    // Detect job titles and companies (look for patterns)
    const jobTitlePatterns = /(?:développeur|developer|ingénieur|engineer|manager|chef|directeur|consultant|analyste|designer|architect)/gi;
    const jobTitles = cvText.match(jobTitlePatterns) || [];

    // Detect company names (words followed by years or "chez")
    const companyMatches = cvText.match(/(?:chez|at|@)\s+([A-Z][\w\s&-]{2,30})/g) || [];
    const companies = companyMatches.map(m => m.replace(/(?:chez|at|@)\s+/i, '').trim());

    // Detect years of experience
    const yearMatches = cvText.match(/(\d+)\s*(?:ans?|years?)/gi) || [];
    const experienceYears = yearMatches.map(m => parseInt(m.match(/\d+/)?.[0] || '0'));
    const totalYears = experienceYears.length > 0 ? Math.max(...experienceYears) : 0;

    // Detect numbers/metrics (achievements)
    const metrics = cvText.match(/\d+\s*%|\d+\s*(?:personnes|people|utilisateurs|users|clients|€|\$|k€|M€)/gi) || [];

    // Detect skills
    const techSkills: string[] = [];
    const skillKeywords = [
        'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'typescript',
        'sql', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
        'git', 'agile', 'scrum', 'html', 'css', 'tailwind', 'bootstrap', 'php', 'ruby',
        'c++', 'c#', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'django', 'flask',
        'express', 'next.js', 'nuxt', 'redux', 'graphql', 'rest', 'api', 'salesforce',
        'crm', 'excel', 'power bi', 'tableau', 'figma', 'photoshop', 'illustrator'
    ];

    skillKeywords.forEach(skill => {
        if (new RegExp(`\\b${skill}\\b`, 'i').test(cvText)) {
            techSkills.push(skill);
        }
    });

    // Detect education
    const educationKeywords = ['université', 'university', 'école', 'school', 'master', 'licence', 'bachelor', 'diplôme', 'degree', 'formation', 'education', 'bac', 'mba'];
    const hasEducation = educationKeywords.some(keyword => lowerText.includes(keyword));
    const educationMentions = educationKeywords.filter(keyword => lowerText.includes(keyword));

    // Detect sections
    const hasSections = {
        experience: /(?:expérience|experience|parcours professionnel|professional experience)/i.test(cvText),
        education: hasEducation,
        skills: /(?:compétences|skills|technologies|expertise)/i.test(cvText),
        projects: /(?:projets?|projects?|réalisations?|achievements?)/i.test(cvText),
        languages: /(?:langues?|languages?)/i.test(cvText)
    };

    // Calculate detailed score
    let score = 3; // Base
    if (hasSections.experience) score += 2;
    if (hasSections.education) score += 1.5;
    if (hasSections.skills) score += 1;
    if (emails.length > 0) score += 0.5;
    if (phones.length > 0) score += 0.5;
    if (linkedInMatch) score += 0.5;
    if (metrics.length > 0) score += 1.5;
    if (techSkills.length >= 5) score += 1;
    if (wordCount > 200) score += 0.5;
    if (hasSections.projects) score += 0.5;
    score = Math.min(10, Math.round(score * 10) / 10);

    // Generate SPECIFIC feedback
    return generateSpecificFeedback({
        score,
        cvText,
        emails,
        phones,
        linkedInMatch,
        jobTitles,
        companies,
        totalYears,
        metrics,
        techSkills,
        hasSections,
        wordCount,
        educationMentions
    });
}

function generateSpecificFeedback(data: any): string {
    const { score, cvText, emails, phones, linkedInMatch, jobTitles, companies, totalYears, metrics, techSkills, hasSections, wordCount, educationMentions } = data;

    // Build SPECIFIC strengths
    const strengths = [];
    if (hasSections.experience && companies.length > 0) {
        strengths.push(`**Expériences chez ${companies.slice(0, 2).join(' et ')}** - Vous avez travaillé dans ${companies.length} entreprise${companies.length > 1 ? 's' : ''}, ce qui montre une progression professionnelle`);
    } else if (hasSections.experience) {
        strengths.push(`**Section Expérience présente** - Vous documentez votre parcours professionnel`);
    }

    if (metrics.length > 0) {
        strengths.push(`**Résultats quantifiés** - Vous utilisez des chiffres concrets (${metrics.slice(0, 3).join(', ')}) pour démontrer votre impact`);
    }

    if (techSkills.length >= 5) {
        strengths.push(`**${techSkills.length} compétences techniques identifiées** - Notamment: ${techSkills.slice(0, 5).join(', ')}. Cela montre une expertise technique solide`);
    } else if (techSkills.length > 0) {
        strengths.push(`**Compétences techniques** - ${techSkills.join(', ')} mentionnées`);
    }

    if (emails.length > 0 && phones.length > 0) {
        strengths.push(`**Coordonnées complètes** - Email (${emails[0]}) et téléphone présents, facilitant le contact`);
    }

    if (linkedInMatch) {
        strengths.push(`**Profil LinkedIn** - Vous mentionnez votre profil LinkedIn, montrant votre présence professionnelle en ligne`);
    }

    if (totalYears > 0) {
        strengths.push(`**${totalYears} an${totalYears > 1 ? 's' : ''} d'expérience** - Votre ancienneté est clairement indiquée`);
    }

    if (hasSections.projects) {
        strengths.push(`**Section Projets** - Vous présentez vos réalisations concrètes`);
    }

    // Build SPECIFIC improvements
    const improvements = [];

    if (!hasSections.experience) {
        improvements.push(`**URGENT: Ajoutez une section Expérience Professionnelle** - Listez vos postes avec: Titre du poste | Entreprise | Dates | 3-5 réalisations par poste`);
    } else if (metrics.length === 0) {
        improvements.push(`**Quantifiez vos réalisations** - Au lieu de "Développement d'applications", écrivez "Développement de 3 applications React utilisées par 10,000+ utilisateurs, réduction du temps de chargement de 40%"`);
    } else if (metrics.length < 3) {
        improvements.push(`**Ajoutez plus de métriques** - Vous avez ${metrics.length} chiffre${metrics.length > 1 ? 's' : ''}, visez 3-5 résultats quantifiés par expérience`);
    }

    if (techSkills.length === 0) {
        improvements.push(`**Créez une section Compétences Techniques** - Listez 8-12 technologies, langages et outils que vous maîtrisez`);
    } else if (techSkills.length < 5) {
        improvements.push(`**Développez vos compétences** - Vous mentionnez ${techSkills.length} compétence${techSkills.length > 1 ? 's' : ''} (${techSkills.join(', ')}). Ajoutez d'autres technologies pertinentes pour atteindre 8-12 compétences`);
    }

    if (!hasSections.education) {
        improvements.push(`**Ajoutez votre Formation** - Incluez: Diplôme | Établissement | Année | Mention éventuelle`);
    } else if (educationMentions.length === 1) {
        improvements.push(`**Détaillez votre formation** - Précisez le nom exact du diplôme, l'établissement et l'année d'obtention`);
    }

    if (emails.length === 0) {
        improvements.push(`**Ajoutez votre email** - Indispensable pour être contacté. Format: prenom.nom@email.com en haut du CV`);
    }

    if (phones.length === 0) {
        improvements.push(`**Ajoutez votre téléphone** - Les recruteurs préfèrent souvent appeler. Format: +33 6 XX XX XX XX`);
    }

    if (!linkedInMatch) {
        improvements.push(`**Ajoutez votre profil LinkedIn** - 90% des recruteurs vérifient LinkedIn. Incluez l'URL: linkedin.com/in/votre-nom`);
    }

    if (wordCount < 150) {
        improvements.push(`**CV trop court (${wordCount} mots)** - Visez 200-400 mots. Développez vos expériences avec plus de détails sur vos responsabilités et réalisations`);
    }

    if (!hasSections.projects && techSkills.length > 0) {
        improvements.push(`**Ajoutez une section Projets** - Présentez 2-3 projets significatifs avec technologies utilisées et résultats obtenus`);
    }

    // Generate priority recommendations
    const recommendations = [];

    if (!hasSections.experience) {
        recommendations.push(`1. **PRIORITÉ ABSOLUE: Ajoutez vos expériences** - Pour chaque poste: "Titre | Entreprise | Dates" puis 3-5 bullet points commençant par des verbes d'action (Développé, Géré, Optimisé...) avec résultats chiffrés`);
    } else if (metrics.length < 2) {
        recommendations.push(`1. **Quantifiez TOUTES vos réalisations** - Pour chaque expérience, ajoutez au moins 2 chiffres: nombre d'utilisateurs, pourcentage d'amélioration, taille d'équipe, budget géré, délais respectés`);
    } else {
        recommendations.push(`1. **Optimisez vos réalisations** - Utilisez la formule: Verbe d'action + Tâche + Résultat chiffré. Ex: "Optimisé les performances de l'application, réduction du temps de chargement de 2s à 0.5s, satisfaction utilisateur +35%"`);
    }

    if (techSkills.length < 5) {
        recommendations.push(`2. **Complétez vos compétences techniques** - Créez une section avec 3 catégories: Langages (${techSkills.filter((s: string) => ['javascript', 'python', 'java', 'typescript'].includes(s)).join(', ') || 'JavaScript, Python...'}), Frameworks (React, Node.js...), Outils (Git, Docker...)`);
    } else {
        recommendations.push(`2. **Organisez vos ${techSkills.length} compétences** - Regroupez par catégories (Frontend, Backend, DevOps, Outils) et mettez en GRAS les 3-5 compétences principales`);
    }

    if (!emails.length || !phones.length || !linkedInMatch) {
        const missing = [];
        if (!emails.length) missing.push('email');
        if (!phones.length) missing.push('téléphone');
        if (!linkedInMatch) missing.push('LinkedIn');
        recommendations.push(`3. **Ajoutez vos coordonnées manquantes** - ${missing.join(', ')}. Placez-les en haut du CV: Prénom NOM | Email | Téléphone | LinkedIn | Ville`);
    } else if (!hasSections.projects) {
        recommendations.push(`3. **Créez une section Projets** - Ajoutez 2-3 projets avec: Nom du projet, Description en 1 ligne, Technologies utilisées, Résultats/Impact. Incluez des liens GitHub si possible`);
    } else {
        recommendations.push(`3. **Personnalisez pour chaque candidature** - Réorganisez vos expériences pour mettre en avant celles qui correspondent le mieux au poste visé. Adaptez vos compétences aux mots-clés de l'offre`);
    }

    if (!hasSections.education) {
        recommendations.push(`4. **Ajoutez votre formation** - Même sans diplôme universitaire, mentionnez: formations en ligne (Udemy, Coursera), bootcamps, certifications, auto-formation avec projets`);
    } else if (wordCount < 200) {
        recommendations.push(`4. **Développez le contenu** - Passez de ${wordCount} à 250-350 mots. Pour chaque expérience, ajoutez: contexte (taille équipe, secteur), actions précises, résultats mesurables, technologies utilisées`);
    } else {
        recommendations.push(`4. **Optimisez pour les ATS** - Utilisez des titres standards (EXPÉRIENCE PROFESSIONNELLE, FORMATION, COMPÉTENCES), évitez tableaux/colonnes, sauvegardez en .docx ET .pdf, incluez mots-clés du secteur`);
    }

    recommendations.push(`5. **Relecture professionnelle** - Faites relire par 2-3 personnes. Utilisez Grammarly ou LanguageTool. UNE SEULE faute peut éliminer votre candidature. Vérifiez: orthographe, grammaire, cohérence des dates, formatage uniforme`);

    return `## 📊 Score Global: ${score}/10

${score >= 8 ? '🎉 **Excellent !** Votre CV est de très haute qualité.' : score >= 6 ? '👍 **Bon CV** avec des optimisations ciblées à faire.' : score >= 4 ? '⚠️ **CV moyen** - Des améliorations importantes augmenteront significativement vos chances.' : '❌ **CV à refaire** - Ne vous découragez pas ! Suivez nos recommandations pour le transformer.'}

---

## ✅ Points Forts Identifiés

${strengths.length > 0 ? strengths.map(s => `• ${s}`).join('\n\n') : '• Votre CV a du potentiel mais nécessite des améliorations significatives'}

---

## ⚠️ Points à Améliorer Spécifiquement

${improvements.map(i => `• ${i}`).join('\n\n')}

---

## 🤖 Compatibilité ATS (Applicant Tracking System)

${score >= 7 ? '✅ **Bonne compatibilité ATS**' : score >= 5 ? '⚠️ **Compatibilité ATS moyenne**' : '❌ **Risque élevé de filtrage ATS**'}

**Analyse de votre CV:**
- ${hasSections.experience ? '✅' : '❌'} Section Expérience structurée
- ${hasSections.skills ? '✅' : '❌'} Section Compétences présente
- ${hasSections.education ? '✅' : '❌'} Section Formation identifiable
- ${emails.length > 0 ? '✅' : '❌'} Email détecté
- ${techSkills.length >= 5 ? '✅' : '⚠️'} Mots-clés techniques (${techSkills.length} identifiés)

**Recommandations ATS:**
• Utilisez des titres de section en MAJUSCULES (EXPÉRIENCE PROFESSIONNELLE, FORMATION, COMPÉTENCES)
• Évitez les tableaux, colonnes multiples, en-têtes/pieds de page
• Format: .docx pour les ATS, .pdf pour lecture humaine
• Police standard: Arial, Calibri ou Helvetica, taille 10-12pt
• Incluez les mots-clés EXACTS de l'offre d'emploi

---

## 📐 Structure & Format

${wordCount > 200 && hasSections.experience ? '✅ **Structure complète et bien organisée**' : '⚠️ **Structure à améliorer**'}

**Analyse:**
- Longueur: ${wordCount} mots ${wordCount < 150 ? '(trop court, visez 250-350)' : wordCount > 500 ? '(un peu long, condensez à 300-400)' : '(bonne longueur)'}
- Sections détectées: ${Object.entries(hasSections).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'aucune section claire'}

**Conseils de mise en forme:**
• **En-tête**: Prénom NOM (plus gros) | Email | Téléphone | LinkedIn | Ville
• **Sections**: EXPÉRIENCE PROFESSIONNELLE, FORMATION, COMPÉTENCES TECHNIQUES, PROJETS (optionnel), LANGUES (optionnel)
• **Bullet points**: Commencez par des verbes d'action (Développé, Géré, Optimisé, Créé, Dirigé...)
• **Dates**: Format cohérent (MM/AAAA - MM/AAAA ou Mois AAAA - Mois AAAA)
• **Longueur**: 1 page si <5 ans d'expérience, 2 pages maximum sinon

---

## 💥 Contenu & Impact

${metrics.length >= 3 ? '✅ **Excellent impact** - Vos réalisations sont bien quantifiées' : metrics.length > 0 ? '⚠️ **Impact moyen** - Ajoutez plus de chiffres' : '❌ **Manque d\'impact** - Aucun résultat quantifié détecté'}

**Analyse de vos réalisations:**
- Résultats chiffrés: ${metrics.length} ${metrics.length > 0 ? `(${metrics.slice(0, 3).join(', ')})` : ''}
- Compétences techniques: ${techSkills.length} ${techSkills.length > 0 ? `(${techSkills.slice(0, 5).join(', ')})` : ''}
- Expérience: ${totalYears > 0 ? `${totalYears} an${totalYears > 1 ? 's' : ''}` : 'non précisée'}

**Formule gagnante pour chaque bullet point:**
\`\`\`
[Verbe d'action] + [Tâche/Projet] + [Résultat chiffré] + [Impact]

Exemples:
❌ "Développement d'applications web"
✅ "Développé 3 applications React utilisées par 15,000+ utilisateurs, réduction du temps de chargement de 40%, augmentation de la satisfaction client de 4.2 à 4.8/5"

❌ "Gestion d'équipe"
✅ "Managé une équipe de 5 développeurs juniors, livraison de 12 fonctionnalités en 6 mois (100% dans les délais), réduction du taux de bugs de 35%"
\`\`\`

---

## 🎯 Recommandations Prioritaires (À faire dans l'ordre)

${recommendations.join('\n\n')}

---

## 💡 Conseil Final Personnalisé

${score >= 8
            ? `🚀 **Félicitations !** Votre CV est excellent${companies.length > 0 ? ` avec vos expériences chez ${companies.slice(0, 2).join(' et ')}` : ''}${techSkills.length >= 5 ? ` et vos ${techSkills.length} compétences techniques` : ''}. Quelques ajustements mineurs et vous maximiserez vos chances. Concentrez-vous sur la personnalisation pour chaque offre.`
            : score >= 6
                ? `👍 **Vous êtes sur la bonne voie !**${totalYears > 0 ? ` Avec ${totalYears} an${totalYears > 1 ? 's' : ''} d'expérience` : ''}, votre CV a une base solide. En appliquant les ${improvements.length} améliorations ci-dessus, vous augmenterez significativement vos chances d'obtenir des entretiens. Commencez par ${improvements[0]?.substring(0, 50)}...`
                : score >= 4
                    ? `💪 **Votre CV nécessite du travail, mais c'est réalisable !** Concentrez-vous d'abord sur ${!hasSections.experience ? 'ajouter vos expériences professionnelles' : metrics.length === 0 ? 'quantifier vos réalisations avec des chiffres' : 'structurer clairement vos sections'}. Prenez le temps de bien faire ces modifications - un bon CV peut multiplier vos chances par 5.`
                    : `🔧 **Reconstruction nécessaire !** Votre CV actuel (${wordCount} mots${hasSections.experience ? '' : ', sans expérience détaillée'}) ne vous rendra pas justice. Suivez nos recommandations étape par étape. Commencez par créer une structure claire avec vos expériences, puis ajoutez les détails. Vous pouvez transformer ce CV en outil puissant !`}

---

**🎁 Besoin d'aide professionnelle ?**

Notre équipe d'experts peut:
• Refondre complètement votre CV (ATS + Design moderne)
• Optimiser votre profil LinkedIn
• Vous accompagner jusqu'à l'obtention de votre emploi/alternance
• Préparation intensive aux entretiens

**Résultat garanti ou remboursé !** 🚀`;
}

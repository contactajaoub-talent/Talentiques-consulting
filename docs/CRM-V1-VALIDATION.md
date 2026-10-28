# CRM V1 — vérifications du 28 octobre 2026

## Résultat final

| Vérification | Résultat |
| --- | --- |
| Tests ciblés Node | **67 réussis, 0 échec, 0 ignoré** |
| Migration PostgreSQL isolée | Application transactionnelle réussie |
| Scénarios PostgreSQL / RLS | 20 scénarios réussis, plus le conteneur de suite comptabilisé par Node |
| Tests métier / régression ciblée | 46 réussis : CRM 5, services 2, analyse CV conservée 34, Salesforce 5 |
| TypeScript | `tsc --noEmit` réussi ; contrôle TypeScript du build final réussi |
| Lint du périmètre CRM et des formulaires modifiés | Réussi, sans avertissement |
| Build de production | `npm run build` réussi, 68 pages statiques générées et routes dynamiques compilées |
| Espaces et patch | `git diff --check` réussi |
| Supabase / PayPal / Resend distants | Non testés : aucun identifiant distant utilisé |

Les essais ont révélé puis permis de corriger une ambiguïté de variable SQL dans le contrôle des livrables, des types React trop larges, une attente d’heure UTC erronée dans un test de changement d’heure et deux tests de l’ancien parcours IA devenus incompatibles avec le nouveau formulaire humain. Aucun test n’a été désactivé pour obtenir ce résultat. Les tests du moteur IA conservé restent exécutés.

## Commandes de validation

Le moteur de validation PostgreSQL est installé dans le dossier temporaire du système. **Il n’est pas ajouté au `package.json` de l’application.** Il ne se connecte à aucun projet Supabase.

```powershell
$crmValidationRoot = Join-Path $env:TEMP 'talentiques-crm-validation'
npm install --prefix "$crmValidationRoot" --no-save --package-lock=false --ignore-scripts --no-audit --no-fund @electric-sql/pglite
$env:CRM_PGLITE_PATH = Join-Path $crmValidationRoot 'node_modules\@electric-sql\pglite'
node --experimental-strip-types --test tests/crm.test.mjs tests/crm-db.test.mjs tests/services.test.mjs tests/cv-analysis.test.mjs tests/salesforce.test.mjs
```

Sans `CRM_PGLITE_PATH`, la suite PostgreSQL est explicitement indiquée comme ignorée ; les 67 tests ne peuvent donc pas être revendiqués dans ce cas. `npm run test:crm` exécute seulement les cinq tests métier indépendants.

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js src/lib/crm src/components/crm src/app/crm src/app/api/crm src/app/api/services/paypal src/app/paiement-service src/app/completer-dossier src/app/cv-diagnosis src/components/DiagnosticForm.tsx src/components/ServiceInquiryModal.tsx src/components/OptimizationFormModal.tsx next.config.ts tests/crm.test.mjs tests/crm-db.test.mjs tests/crm-ui-server.mjs
npm run build
git diff --check
```

Le premier build dans le bac à sable a échoué faute d’accès à Google Fonts. La compilation finale a été relancée avec l’accès réseau nécessaire aux **polices déjà utilisées par le projet** et a réussi. Aucune police ni dépendance applicative n’a été remplacée pour contourner cet échec.

Un cache de types générés obsolète sous `.next/dev/types` contenait les anciennes routes ; ce seul cache a été supprimé après vérification de son emplacement dans le dépôt. Les sources et la configuration TypeScript n’ont pas été assouplies.

## Couverture de sécurité et de workflow

- Demande atomique : contact dédupliqué, document référencé privé, preuve de consentement, tâche, accusé en outbox et commande pending ; aucune prestation avant paiement.
- Refus des lectures PII anonymes et des appels anonymes aux fonctions de paiement internes.
- Refus des identifiants de demandes devinés et des modifications directes des rôles.
- Affectation admin ; accès du commercial limité à la demande attribuée.
- Barrière Storage restrictive testée avec une ancienne policy autorisant tous les objets : le CV CRM reste invisible, l’ancien bucket reste accessible.
- Rapport humain : PDF approuvé exigé, validation réservée admin, envoi dédupliqué ; aucune proposition générique créée par l’envoi du rapport.
- Acceptation de l’envoi : changement d’état et création unique de la tâche commerciale. Un échec ne marque pas le dossier livré.
- Proposition personnalisée : approbation refusée au commercial, preuve d’éligibilité obligatoire, domaine de paiement non substituable par une donnée utilisateur.
- Paiement : un dossier et cinq tâches malgré plusieurs événements ; rejouement après remboursement refusé.
- Production : accès uniquement au dossier affecté et au CV nécessaire ; aucune lecture des commandes ou propositions, autre collaborateur refusé.
- Contrôle qualité : livrables incomplets refusés, approbation/livraison admin obligatoires, file de livraison dédupliquée.
- Transmission manuelle : référence obligatoire et état distinct de l’acceptation par le fournisseur.
- Relances : consentement propre à la demande requis, absence de doublon, annulation après paiement, arrêt global après retrait du consentement, preuves historiques conservées.
- Offre étudiant : justification exigée avant production.
- Corrections : réouverture admin, nouvelle révision et nouvelle validation obligatoire.
- Outbox : prises de lots disjointes et réconciliation manuelle des tentatives ambiguës dépassant la fenêtre d’idempotence du fournisseur.
- Désactivation d’un membre : disparition immédiate du périmètre RLS, même avec une session existante.
- Calcul des heures ouvrées : soirées, week-ends, changement d’heure Europe/Paris et délai de production.
- Validation de fichiers : taille, extension, contenu incohérent, fausse archive Office, PDF actif/chiffré/tronqué et export PDF paginé échappant les caractères spéciaux.

Ces essais PostgreSQL exécutent les fonctions et policies réelles de la migration dans PGlite. Ils ne prouvent pas la configuration des rôles, extensions, policies préexistantes ou services réseau du projet distant. La concurrence de plusieurs connexions et les événements PayPal réels restent à tester en recette.

## Vérification visuelle

Navigateur local avec `tests/crm-ui-server.mjs`, base isolée vide et administrateur synthétique. Le serveur de test est limité à `127.0.0.1`, ne contient aucun identifiant réel et n’émule ni paiement, ni envoi email, ni dépôt de fichier. Aucune option de contournement de l’authentification n’est ajoutée à l’application.

- Redirection `/crm` vers `/crm/login` sans session et connexion via l’adaptateur local de test.
- Navigation des six sections et affichage de leurs états vides.
- Dashboard desktop 1440 × 1000, administration mobile 390 × 844 et diagnostic tablette 768 × 1024.
- Absence de débordement horizontal détectée sur les vues contrôlées.
- Champs obligatoires, marchés multiples et consentements non précochés présents dans le diagnostic.
- Aucune erreur console observée sur les écrans contrôlés.
- Les serveurs temporaires et l’onglet de validation ont été arrêtés après contrôle ; les dimensions du navigateur ont été réinitialisées.

Les drawers alimentés par des dossiers réels, les téléchargements signés, les invitations email, les paiements et les livraisons avec pièces jointes doivent encore être parcourus sur la recette configurée. Les tests visuels ne sont pas présentés comme une validation externe de bout en bout.

## Lint global : problèmes préexistants conservés

`eslint .` retourne **3 erreurs et 6 avertissements** hors du périmètre CRM :

1. `src/app/career-search-360/page.tsx:117` : composant `Purchase` déclaré pendant le rendu (`react-hooks/static-components`).
2. `src/components/acquisition/AcquisitionShell.tsx:25` : `setState` synchrone dans un effet (`react-hooks/set-state-in-effect`).
3. `tests/career-search-checkout.test.mjs:9` : variable nommée `module` (`@next/next/no-assign-module-variable`).

Les avertissements concernent des images HTML et variables inutilisées dans ces espaces existants. Le build signale également des données Browserslist/baseline anciennes et Node signale le typage ESM implicite des tests, sans échec. Aucun de ces contrôles n’a été désactivé, et aucune refonte hors périmètre n’a été effectuée.

## Statut de mise en production

Le code compile et les règles métier/sécurité indiquées passent localement. La mise en production n’est **pas validée** : il reste à appliquer la migration autorisée dans le projet existant, configurer Auth, Storage, PayPal, Resend et le planificateur, puis vérifier les parcours A–E avec des comptes et transactions de recette réels. Les commandes et la checklist figurent dans `CRM-V1-LIVRAISON.md`.

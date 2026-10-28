# TALENTIQUES CRM V1 — livraison locale du 28 octobre 2026

Le code est intégré à l’application Next.js existante. Aucun push, aucune migration distante, aucune création de projet Supabase et aucun déploiement n’ont été effectués. **La mise en production reste conditionnée à la configuration et aux tests réels ci-dessous.**

## Audit ciblé

- Next.js 16.0.8 App Router, React 19, TypeScript, Tailwind et lucide-react. Polices Outfit et Plus Jakarta Sans réutilisées.
- Supabase déjà utilisé par API REST côté serveur pour les commandes Store, Services, l’affiliation et Acquisition OS. Aucun SDK ajouté.
- Authentification historique des affiliés et de leur administration spécifique à ces espaces ; le CRM utilise Supabase Auth et une liste explicite de membres actifs.
- `/diagnostic-cv-ats` redirige déjà vers `/cv-diagnosis`. Ce dernier lançait l’analyse IA ; il présente désormais une demande de revue humaine. `/api/analyze-cv` et les bibliothèques d’analyse restent conservés et testés.
- Les deux formulaires de services envoyaient leurs données vers Salesforce et créaient une commande PayPal séparée. Ils enregistrent désormais une demande CRM, un CV privé et une commande corrélée avant d’ouvrir PayPal.
- Catalogue existant conservé : 35 / 45 EUR en français, 35 / 45 USD en anglais. Les attentes obsolètes de deux tests à 30 ont été corrigées à 35.
- PayPal Orders / Capture existants réutilisés. Webhook Services dédié ajouté sans modifier le webhook Store.
- Resend réutilisé pour la file transactionnelle. Les anciennes routes Salesforce, recrutement, Store, affiliation et Acquisition OS ne sont pas remplacées.
- Aucun fichier `.env.local` présent initialement. Aucun identifiant distant utilisé pour les validations.

## Implémenté et validé localement

- Six sections : `/crm`, `/crm/requests`, `/crm/sales`, `/crm/cases`, `/crm/communications`, `/crm/settings`. Connexion : `/crm/login`.
- Interface claire navy/cyan, sidebar responsive, recherche globale autorisée, listes paginées, filtres de statut, Kanban sur la page courante, drawer natif avec gestion du focus, badges textuels, états vides, erreurs et notifications.
- Dashboard calculé en PostgreSQL : demandes, diagnostics urgents/traités, délai moyen réel, propositions, paiements, encaissements **séparés par devise**, conversion, prestations, retards, sources et charge attribuée. Les indicateurs financiers sont exclus pour la production. Les compteurs opérationnels décrivent l’état courant ; les mesures de flux suivent la période choisie.
- Diagnostic public : identité, statut, objectif, marchés multiples, LinkedIn facultatif, CV PDF/DOCX de 5 Mo, consentements séparés, provenance et UTM. Aucune analyse IA depuis ce parcours.
- Dépôt direct signé vers Supabase pour franchir la limite de taille des requêtes Vercel. Le serveur relit et inspecte le fichier avant la création transactionnelle du dossier. Aucun dossier exploitable n’est créé avant validation. La capacité de dépôt n’autorise aucun écrasement.
- Vérifications PDF / ZIP Office : taille, extension, signature, structure ZIP, limites de décompression, XML attendu, macros/objets embarqués et éléments actifs refusés. Les PDF chiffrés et certains exports complexes doivent être réexportés. Ce contrôle structurel ne remplace pas un antivirus.
- Déduplication des contacts par email normalisé. Une soumission anonyme ne remplace pas l’identité ou les préférences d’un contact existant. Les preuves de consentement restent propres à chaque demande.
- Affectation, priorité, échéance, notes et historique. Rapport humain éditable, export PDF déterministe avec pagination et accents, import d’un PDF externe, validation admin puis mise en file distincte de la proposition.
- Propositions personnalisées : offre, montant, devise, inclusions, message, conditions, expiration, preuve d’éligibilité, relance autorisée, prévisualisation, approbation admin, paiement sécurisé lié à la commande. Les exceptions tarifaires passent toujours par l’admin.
- Paiement confirmé côté serveur : référence interne, montant, devise, bénéficiaire et capture COMPLETED exigés. Événements idempotents ; un dossier de production et ses cinq tâches sont créés une seule fois.
- Vérification manuelle admin avec montant, devise, bénéficiaire et référence réelle. Aucun clic de retour navigateur ne vaut preuve de paiement. Les remboursements peuvent être rapprochés par webhook ou enregistrés après vérification admin.
- Production : informations à vérifier, attribution, échéance calculée après validation des informations, instructions, cinq livrables, soumission, contrôle admin, livraison, réouverture pour corrections et nouvelle validation. Pour l’offre étudiant/demandeur d’emploi, une référence de vérification d’éligibilité est exigée avant le démarrage.
- Fiche client : demandes, propositions autorisées, prestations, documents et historique.
- Retrait global du consentement marketing depuis la fiche client : arrêt des relances du contact, conservation des preuves historiques et contrôle supplémentaire avant appel au fournisseur.
- Demande d’informations complémentaires approuvée par l’équipe, via `/completer-dossier` : jeton aléatoire stocké haché, durée de trois jours, usage unique. Le retour du client doit être vérifié avant démarrage ; il ne déclenche pas seul la production.
- Outbox : déduplication, prise de lots atomique, reprises bornées, clé d’idempotence Resend, état manuel sans provider, erreurs visibles. Un envoi n’est marqué accepté qu’après réponse positive du fournisseur, ou déclaré transmis manuellement avec une référence réelle.
- Accusé de réception, rapport, proposition, confirmation de paiement, demande de complément et livraison ; relance unique programmée d’une proposition avec consentement marketing propre à la demande. Les relances sont annulées après paiement, refus ou expiration.
- Notifications internes pour affectations, contrôle qualité et échéances ; alertes admin de retard. Traitement manuel dans Administration ou endpoint protégé pour un planificateur.
- Conservation configurable : suppression des documents anciens des dossiers clôturés, exclusion des dossiers actifs et des pièces d’envois non réconciliés ; nettoyage des uploads abandonnés après expiration de la capacité signée. Les coordonnées, preuves et journaux ne sont pas automatiquement effacés.

## Schéma et sécurité

Migration : `supabase/migrations/202610280001_crm_v1.sql`.

Tables ajoutées : `crm_members`, `crm_settings`, `crm_contacts`, `crm_requests`, `crm_proposals`, `crm_cases`, `crm_tasks`, `crm_documents`, `crm_activity_logs`, `crm_consents`, `crm_outbox`, `crm_notifications`, `crm_uploads`, `crm_rate_limits`, `crm_payment_events`, `crm_info_links`.

Le registre `service_orders` existant est étendu, sans copie ni suppression de ses lignes. Les statuts autorisés sont élargis. La table préexistante doit être installée avant la migration CRM. Le bucket `crm-documents` est privé, limité à 5 Mo et aux MIME autorisés.

| Rôle | Accès |
| --- | --- |
| admin | Global, équipe, paramètres, validation, tarifs, rapprochements, exécution des missions |
| sales | Demandes attribuées, documents autorisés, brouillons commerciaux, envois approuvés ; aucun changement de prix approuvé sans nouvelle proposition |
| production | Diagnostics ou prestations attribués, contexte nécessaire, CV source, livrables, tâches et notes ; aucun accès aux commandes, propositions ou indicateurs financiers |

- RLS sur toutes les tables CRM. SELECT autorisé selon le périmètre ; écritures par fonctions transactionnelles contrôlées, sans droit de modification directe des tables pour `authenticated`.
- Fonctions internes révoquées de `PUBLIC`, `anon`, `authenticated`. Les commandes exposées vérifient systématiquement `auth.uid()` et un membre actif. Une session existante perd immédiatement son périmètre lorsqu’un membre est désactivé.
- Barrière Storage **restrictive** pour ce bucket, même en présence d’une ancienne policy permissive couvrant tous les buckets.
- Cookies HttpOnly, Secure en production, SameSite Lax ; sessions d’une heure, puis reconnexion. Les refresh tokens ne sont pas stockés dans le navigateur.
- Vérification d’origine sur les mutations navigateur, validation serveur, rate limiting PostgreSQL par adresse hachée avec secret, honeypot, absence d’HTML client arbitraire et erreurs sans détails sensibles.
- CV et livrables servis après vérification RLS par URL signée de deux minutes. Les emails utilisent des pièces jointes privées, pas des URLs publiques permanentes.
- Pages CRM, paiement et complément : `noindex`, pas de cache partagé, `no-referrer`, `nosniff`, protection contre l’encapsulation en iframe.
- La valeur `crm_settings.site_url` est administrée en SQL ; un commercial ne peut pas substituer son propre domaine dans les liens envoyés.

## Implémenté mais non validé contre les services réels

- Supabase Auth : login, invitation, définition du mot de passe et révocation ; Auth et Storage réels doivent être validés sur l’environnement de recette existant.
- Dépôt signé, relecture du fichier, téléchargement signé et pièces jointes Resend avec de vrais PDF/DOCX clients.
- Création/capture PayPal, signature du webhook, délais d’événement, concurrence réelle, remboursements et rapprochement du bénéficiaire en sandbox puis live.
- Acceptation Resend, qualité de réception et délivrabilité du domaine. « Accepté » signifie accepté par le fournisseur, pas livré en boîte de réception.
- Migration et policies dans le projet Supabase distant : les tests locaux utilisent PostgreSQL PGlite avec les rôles et tables Supabase nécessaires reproduits ; ce n’est pas une validation de l’infrastructure distante complète.
- Planification et Vault, purge réelle Storage, sauvegarde et restauration.

## Configuration externe nécessaire

Variables existantes réutilisées :

```dotenv
NEXT_PUBLIC_APP_URL=https://talentiques.com
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Variables ajoutées (serveur uniquement, hors identifiant public PayPal déjà existant) :

```dotenv
SUPABASE_ANON_KEY=
CRM_RATE_LIMIT_SECRET=
CRON_SECRET=
PAYPAL_MERCHANT_ID=
PAYPAL_SERVICE_WEBHOOK_ID=
```

Utiliser les clés du **projet existant**. Ne jamais préfixer la clé service role ou les secrets avec `NEXT_PUBLIC_`. Générer deux secrets aléatoires indépendants d’au moins 32 octets pour le rate limiting et le planificateur. Ne pas les journaliser.

1. Désactiver les inscriptions publiques Supabase Auth destinées aux accès internes. Configurer l’URL du site et autoriser exactement le callback `/crm/login` sur les domaines utilisés. Configurer l’envoi d’invitations Auth.
2. Créer ou inviter le premier utilisateur dans Supabase Auth. Attribuer son rôle depuis une connexion SQL privilégiée en remplaçant uniquement l’UUID ci-dessous par l’UUID vérifié, sans email codé en dur :

```sql
insert into public.crm_members(user_id,name,role)
values ('UUID_AUTH_VERIFIE','Responsable TALENTIQUES','admin');
```

3. Vérifier `crm_settings.site_url` pour l’environnement concerné. En recette, utiliser le domaine de recette ; ne pas envoyer de liens de recette aux vrais clients.
4. Configurer le webhook **Services** `/api/services/paypal/webhook` dans la même application PayPal et sauvegarder son identifiant dans `PAYPAL_SERVICE_WEBHOOK_ID`. Événements traités : `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`, `PAYMENT.CAPTURE.REVERSED`. Un remboursement sans référence de capture exploitable reste à rapprocher manuellement ; il n’est pas inventé.
5. Vérifier le domaine d’expédition Resend. Sans provider, lancer le traitement pour rendre les messages « À transmettre manuellement », copier le message, joindre les documents approuvés puis enregistrer la référence de l’envoi réellement effectué.
6. Activer le planificateur, par exemple avec `supabase/crm_scheduler.sql` **après validation et autorisation**. Ce fichier réutilise pg_cron/pg_net/Vault dans la base existante et programme un passage toutes les dix minutes. Créer d’abord le secret Vault `talentiques_crm_cron_secret`, égal à `CRON_SECRET`, au moyen des outils sécurisés du projet. Aucun secret ne figure dans le script ni dans la commande du cron. Alternative : un planificateur existant appelant `GET /api/crm/jobs` avec le header `Authorization: Bearer <CRON_SECRET>`.
7. Activer l’engagement public du diagnostic seulement lorsque l’équipe et la planification peuvent le tenir. Il est désactivé par défaut. Les horaires initiaux sont lundi–vendredi, 9–18h, Europe/Paris. Les jours fériés ne sont pas gérés automatiquement.

## Non implémenté / limites V1

- Import de l’historique Salesforce ou conversion automatique des anciennes commandes non liées au CRM. Les données existantes sont conservées.
- Campagnes email complexes, séquences de relances multiples, accusés de livraison email, désabonnement public automatique. Le refus se traite dans Commercial et les relances sont consenties par demande.
- Analyse antivirus externe et prise en charge de tous les formats PDF/Office complexes. Le serveur effectue un contrôle structurel conservateur ; les formats refusés doivent être réexportés.
- Analyse IA dans le nouveau parcours, scores ATS inventés, portail client complet, éditeur Word/PDF visuel, chat interne, comptabilité, application mobile et accompagnement A à Z.
- Pièces jointes depuis le lien de complément : le lien collecte du texte ; les nouveaux documents passent par l’équipe.
- Reporting exportable avancé, calendrier de jours fériés, journal d’audit externe inviolable et rafraîchissement automatique des sessions.
- Suppression automatique des coordonnées ou justificatifs comptables : prévoir une procédure administrative de droit d’accès/effacement et une durée de conservation métier appropriée avant lancement.
- Une annulation concurrente au dernier instant d’un envoi déjà accepté par le provider ne peut pas rappeler cet email. Les messages commerciaux sont revérifiés immédiatement avant l’appel au fournisseur.
- Les tests de navigateur portent sur une fixture locale vide avec un admin synthétique. Aucun paiement, email ou upload externe n’y est émulé. La validation des dossiers réels avec ces services reste obligatoire.

## Vérifications

Les résultats finaux et les commandes sont consignés dans `docs/CRM-V1-VALIDATION.md`. Le lint global comporte des erreurs préexistantes hors CRM ; elles ne sont pas désactivées ni masquées.

## Déploiement — commandes à exécuter uniquement après autorisation

Depuis ce dépôt, PowerShell. Installer et configurer les outils PostgreSQL/Vercel habituels si nécessaire. Les variables de connexion PostgreSQL `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` sont renseignées par un canal sécurisé ; ne pas les afficher ni les ajouter au dépôt.

```powershell
npm ci
npm run test:crm
node --experimental-strip-types --test tests/services.test.mjs tests/cv-analysis.test.mjs tests/salesforce.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Vérifier d’abord le schéma distant et sauvegarder dans un emplacement privé **hors dépôt** :

```powershell
psql -v ON_ERROR_STOP=1 -c "select to_regclass('public.service_orders');"
pg_dump --format=custom --file="$env:USERPROFILE\Backups\talentiques-before-crm.dump"
```

Seulement si `service_orders` est absente, appliquer son schéma existant. Ne pas relancer d’autres migrations sans audit :

```powershell
psql -v ON_ERROR_STOP=1 -f supabase/service_orders.sql
```

Puis appliquer **la seule migration CRM revue**, d’abord en recette :

```powershell
psql -v ON_ERROR_STOP=1 -f supabase/migrations/202610280001_crm_v1.sql
```

Configurer les variables, Auth, le premier admin et les providers, puis créer un déploiement de recette :

```powershell
npx vercel
```

Après validation complète A–E et autorisation explicite de mise en production :

```powershell
npx vercel --prod
psql -v ON_ERROR_STOP=1 -f supabase/crm_scheduler.sql
```

Les commandes Vercel ci-dessus ne constituent pas une autorisation et n’ont pas été exécutées. Aucune commande de push vers `main` n’est nécessaire à cette livraison.

## Checklist de mise en production

- [ ] Sauvegarde PostgreSQL privée et copie séparée des objets Storage ; restauration essayée dans un environnement isolé.
- [ ] Migration appliquée et revue sur le projet existant, sans modification des données historiques.
- [ ] Premier admin attribué à un UUID Auth vérifié, inscription publique désactivée, invitation et déconnexion testées.
- [ ] ADMIN, SALES et PRODUCTION testés avec de vrais comptes distincts, y compris par accès REST direct et manipulation d’identifiants.
- [ ] Storage public interdit, anciens buckets préservés, URL signée expirant et contrôle du fichier de 5 Mo vérifiés.
- [ ] Parcours diagnostic : dossier créé, aucune IA, PDF humain approuvé, email accepté et tâche commerciale unique.
- [ ] Parcours direct 35/45 : pending sans production, capture vérifiée, webhook rejoué sans doublon, éligibilité vérifiée si nécessaire.
- [ ] Proposition personnalisée : approbation admin, lien exact, expiration, refus et arrêt des relances.
- [ ] Production : informations validées, échéance, collaborateur limité, cinq livrables, contrôle, livraison et corrections.
- [ ] Resend configuré, mode manuel testé, idempotence et reprise ambiguë réconciliées sans doublon.
- [ ] Cron et Vault activés, retards surveillés, échec d’un traitement détecté par l’équipe.
- [ ] Durées de conservation, purge, information des personnes et procédure d’effacement validées par l’organisation.
- [ ] Parcours réels FR/EN, mobile/tablette/desktop et régressions Store/affiliation/recrutement vérifiés.
- [ ] Autorisation explicite avant migration et déploiement en production.

Retour arrière : désactiver d’abord le planificateur, arrêter les traitements, revenir à la version applicative précédente, conserver les tables CRM pour préserver les nouveaux dossiers. Aucun script `DROP ... CASCADE` n’est fourni ; supprimer la migration après collecte de données serait destructif. Restaurer une sauvegarde seulement après réconciliation des commandes et documents créés depuis celle-ci.

## Fichiers

- `src/lib/crm/` : modèle, validation, horaires, Auth, API Supabase, uploads, PDF, PayPal et worker.
- `src/app/api/crm/` : lecture/commandes, Auth, demandes publiques, documents, rapport, équipe, informations et tâches planifiées.
- `src/app/crm/`, `src/components/crm/` : shell, six sections, login, diagnostic et parcours sécurisés.
- `src/app/api/services/paypal/` : création/capture réutilisées, webhook ajouté.
- `src/components/DiagnosticForm.tsx`, `ServiceInquiryModal.tsx`, `OptimizationFormModal.tsx`, `src/app/cv-diagnosis/page.tsx` : intégration publique.
- `src/app/paiement-service/`, `src/app/completer-dossier/` : liens client à durée limitée.
- `src/app/robots.ts`, `next.config.ts`, politique de confidentialité, `.env.example`, script `test:crm` : configuration et confidentialité.
- `src/components/RouteAwarePreloader.tsx` : exclusion des routes opérationnelles, en conservant la modification locale antérieure.
- `supabase/migrations/202610280001_crm_v1.sql`, `supabase/crm_scheduler.sql` : schéma et planification facultative.
- `tests/crm.test.mjs`, `tests/crm-db.test.mjs`, `tests/crm-ui-server.mjs` et adaptations ciblées des attentes de `services.test.mjs` / `cv-analysis.test.mjs`.
- Les fichiers locaux préexistants `botid-hardening.patch`, `botid-missing-files.txt` et `h origin main` restent intacts.

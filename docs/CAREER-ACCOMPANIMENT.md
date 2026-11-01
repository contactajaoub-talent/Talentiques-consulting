# Accompagnement carrière de A à Z — livraison

## Service intégré

- Page : `/services/accompagnement-carriere-a-a-z` ; accès depuis l’accueil et Services FR.
- Design Talentiques conservé : hero, preuve sociale avant les prestations, étapes, rôles, publics concernés, formulaire, FAQ, CTA et animations sobres.
- Formulaire en trois étapes, Stage/PFE, postes et pays multiples, CV et consentement versionné. Aucune logique de paiement.
- Titre, description, canonique et sitemap. Les routes et les autres offres existantes sont préservées.

## Backend confirmé

Projet existant : `talentiques-store`, référence `gbohbexhndopqydwnaqf`. Le lien avec le CRM publié a été confirmé par le schéma, le domaine configuré et la corrélation de trois lectures de l’API publiée avec ses compteurs SQL. Aucun secret Vercel n’a été affiché ni remplacé.

Le CRM interne Supabase est distinct de Salesforce Web-to-Lead. Le devis utilise `/api/crm/career-quote` et les fonctions de dépôt/consultation déjà présentes ; la route historique Salesforce reste inchangée.

Les 17 tables et 22 fonctions historiques ont été vérifiées avec leurs contraintes, relations, RLS et droits d’exécution. Treize corps de fonctions concordent directement ; les neuf autres ne diffèrent que par l’encodage de leurs textes, après comparaison des jetons SQL et des littéraux décodés. Ces anciens textes n’ont pas été modifiés.

## Migrations distantes

Le CRM historique était installé sans entrée dans le journal des migrations. Après autorisation explicite et limitée, l’unique rapprochement effectué est :

```powershell
npx.cmd supabase migration repair 202610280001 --status applied
```

Le SQL de `202610280001_crm_v1.sql` n’a jamais été rejoué. Le dry-run suivant ne proposait que `202611010001_career_quote.sql`, qui a ensuite été appliquée avec `supabase db push`.

Les deux versions figurent désormais dans l’historique distant : **202610280001 et 202611010001**. Aucun autre repair, reset, changement de projet, recréation de table ou de bucket.

La nouvelle migration étend les types admis par `crm_requests`, ajoute le snapshot `intake_data` et une fonction transactionnelle de devis réservée à `service_role`. La demande, son CV, le contact dédupliqué, le consentement, la tâche d’étude et le journal sont associés atomiquement. Aucune commande ni entrée d’email automatique n’est créée.

## Stockage et accès

Bucket existant `crm-documents`, privé, limite **5 Mo**. Pour ce formulaire : **PDF et DOCX**, conformément aux formats réellement pris en charge. Aucun élargissement artificiel à 10 Mo ou au format DOC.

Le fichier est envoyé directement par capacité signée au stockage, puis relu et inspecté côté serveur avant confirmation. Les fonctions existantes contrôlent extension, taille, signature, structure PDF/Office et éléments actifs. Ce contrôle conservateur ne remplace pas un antivirus.

Les membres passent par la session et les RLS du CRM habituel ; le téléchargement autorisé utilise une URL signée de deux minutes. Les capacités de dépôt ne permettent ni lecture publique ni écrasement de l’objet validé.

Une réponse perdue peut être redemandée avec la même capacité : la transaction renvoie le résultat existant sans seconde demande ni second document. Une panne de lecture du stockage ne supprime pas le CV. La durée de reprise reste celle des uploads existants : 20 minutes pour un dépôt non confirmé.

## Recette réelle réussie et nettoyée

Recette technique explicitement autorisée, exécutée avec les routes Next compilées depuis un serveur local et le **vrai backend Supabase**, sans passer par le formulaire public de production :

1. Bucket privé existant et limite de 5 Mo confirmés.
2. PDF synthétique de **5 242 880 octets** déposé et validé ; demande, champs spécifiques et document enregistrés.
3. Réponse de confirmation volontairement perdue, puis rejouée : une seule demande et un seul CV.
4. Lecture publique, confirmation anonyme et écrasement par capacité signée refusés.
5. Compte technique temporaire de rôle `sales`, connexion via l’API CRM habituelle : téléchargement refusé avant affectation, autorisé après affectation ; les octets téléchargés correspondent au PDF source.
6. DOCX synthétique accepté ; deux demandes légitimes différentes restent rattachées au même contact. Un faux PDF est rejeté sans demande supplémentaire.
7. Aucune entrée `service_orders` ou `crm_outbox` pour les demandes de recette. Les CV, demandes, documents, tâches, journaux, consentements, contact, compte Auth, membre temporaire et compteurs techniques créés par la recette ont été supprimés. L’absence des demandes, uploads et contact de recette a été vérifiée.

Les clés existantes sont restées en mémoire du processus de recette. Aucun secret n’a été écrit dans le dépôt, les logs ou le rapport. Les scripts et résultats techniques locaux sont hors du dépôt.

## Activation et publication

Les variables Production `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` et `CRM_RATE_LIMIT_SECRET` sont présentes. Après recette réussie et nettoyage, **`CAREER_QUOTE_ENABLED=true` a été configurée uniquement en Production** sur le projet Vercel `talentiques-consulting`.

Les previews et environnements non autorisés restent bloqués. Le formulaire n’affiche sa confirmation qu’après réception des identifiants de demande et de document enregistrés. La saisie reste disponible en cas d’erreur.

Publication prévue par le commit final sur `origin/main` et le déploiement Git automatique existant, sans second déploiement manuel. Le SHA et le contrôle `READY` du déploiement correspondant sont consignés dans le compte rendu final de publication.

## Validations conservées

Les 45 tests locaux précédemment réussis, TypeScript, lint ciblé, build et vérifications desktop/tablette/mobile ne sont pas relancés en bloc pour de simples changements de configuration distante. La recette réelle et les contrôles de migration ci-dessus complètent ces validations. Aucun prix ni comportement des autres offres n’a été modifié.

Les fichiers indépendants non suivis (`botid-hardening.patch`, `botid-missing-files.txt`, `h origin main`) sont exclus de la livraison. `supabase/.temp/` est ignoré par Git.

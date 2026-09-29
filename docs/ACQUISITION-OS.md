# TalentiQues Acquisition OS

Acquisition OS est un CRM interne Supabase. Les prospects, marchés, campagnes, offres, opportunités, tâches, activités, paramètres et exécutions d’automatisation sont persistés côté serveur. `localStorage` est réservé à la préférence visuelle du menu latéral.

## Installation de la base

Exécuter manuellement, dans cet ordre :

1. `supabase/acquisition_os.sql` pour le schéma de base ;
2. `supabase/migrations/acquisition_phase_2a.sql` ;
3. `supabase/migrations/acquisition_phase_2b_core.sql` ;
4. `supabase/acquisition_catalog_seed.sql` pour le catalogue idempotent.

La migration Phase 2B est additive. Elle ne supprime aucune donnée. Elle crée les marchés globaux, le catalogue, les opportunités, les paramètres et le journal idempotent des automations. Les anciennes lignes dont le marché vaut littéralement `null` ne sont pas transformées silencieusement : elles restent à corriger depuis l’interface ou SQL.

## Règles métier

- Un marché est une entité globale et active, distincte d’une campagne.
- Une campagne garde son propre nom et référence un marché et, éventuellement, une offre du catalogue.
- Les devises Acquisition sont exclusivement `EUR` et `USD`. Les totaux restent séparés.
- La création d’un prospect exige un `market_id` Supabase valide.
- Le moteur Next Action crée ou annule les tâches selon l’événement, journalise chaque exécution dans `automation_runs` et utilise une clé d’idempotence.
- Le matching d’offre et le score suggéré sont déterministes ; le score commercial manuel reste distinct.
- Les prospects désabonnés, en bounce ou marqués « ne pas contacter » sont exclus de la file de prospection.

## Intégrations

Les contrats pour Gmail/messagerie, WhatsApp, Apollo/enrichissement, OpenAI et événements de paiement sont définis dans `src/lib/acquisition/integrations.ts`. Aucun appel externe ni envoi automatique LinkedIn n’est activé par cette phase.

## Validation

```text
npx.cmd tsc --noEmit
npm.cmd run test:acquisition
npm.cmd run test:affiliate
npm.cmd run build
git diff --check
```

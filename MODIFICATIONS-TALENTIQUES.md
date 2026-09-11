# Refonte Talentiques — première intégration

Cette branche conserve la base Next.js existante et ajoute les évolutions validées :

- Positionnement centré sur les marchés francophones : France, Belgique, Suisse, Luxembourg et Canada francophone.
- Suppression du positionnement Ausbildung / Allemagne.
- Navigation simplifiée : Diagnostic CV ATS, Ressources, Services, Accompagnement, Blog, Contact.
- Deux offres d’optimisation intégrées : 60 € Professionnel et 30 € Étudiant/Demandeur, avec liens PayPal existants.
- Ajout d’une section Ressources gratuites / Ressources payantes (contenus d’exemple, sans prix inventés).
- Ajout d’une section et d’une page Accompagnement carrière francophone.
- Méthode en 5 étapes alignée sur le site commercial Talentiques.
- Mise à jour des métadonnées globales, langue FR, sitemap et robots.txt.
- Conservation du diagnostic CV existant ; le moteur et l’extraction PDF/DOCX devront être fiabilisés dans une étape dédiée.
- Suppression des fichiers de test contenant des clés API en dur dans cette copie de travail.

## À faire ensuite

1. Fiabiliser le diagnostic CV (extraction PDF/DOCX et méthodologie de score).
2. Reconnecter le parcours formulaire Salesforce -> paiement PayPal pour les deux offres.
3. Remplacer les ressources d’exemple par les ressources réellement validées.
4. Créer les vrais articles du blog et les pages dynamiques SEO.
5. Vérifier les témoignages / preuves publiées avant mise en production.

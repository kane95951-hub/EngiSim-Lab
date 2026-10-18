# BACKLOG — EngiSim Lab

Cocher une case seulement quand le critère est **observé** (test passé, page vérifiée), pas quand le code est écrit.
Calendrier de référence : `SPEC.md` §11. Ordre de coupe en cas de retard : `SPEC.md` §11.

## Jour 1 — Cadrage
- [x] Dépôt public autonome créé (indépendant du site Rock-Eval)
- [x] `SPEC.md` ajouté
- [ ] `CLAUDE.md` ajouté
- [ ] `docs/BACKLOG.md` et `docs/SOURCES.md` ajoutés
- [ ] Périmètre P0 gelé ; aucune formule non sourcée implémentée

## Jour 2 — Squelette et Pages
- [ ] Vite + React + TypeScript initialisés
- [ ] Scripts `lint`, `test`, `build` fonctionnent
- [ ] `HashRouter` ; `base` = `/EngiSim-Lab/`
- [ ] Workflow GitHub Actions de déploiement
- [ ] Page minimale visible sur l'URL GitHub Pages ; rechargement OK

## Jour 3 — Catalogue
- [ ] Registre `src/catalog/simulators.ts` (source de vérité)
- [ ] Navigation, cartes par domaine, recherche, filtres, état vide
- [ ] Statuts « Disponible / Prototype / À venir » ; aucun lien cassé

## Jour 4 — FR/EN et thèmes
- [ ] Dictionnaires `fr.json` / `en.json` + test de complétude
- [ ] Thème clair/sombre (préférence système), couleur d'accent, mémorisation
- [ ] Clavier et mobile vérifiés sur les contrôles communs

## Jour 5 — Gabarit scientifique
- [ ] Gabarit de dossier (meta, model, tests, interprétation, ui, fiches)
- [ ] Badge N1/N2/N3 ; enveloppe JSON versionnée définie

## Jour 6 — Rock-Eval (calculs)
- [ ] HI, OI, PI, S2/S3 optionnel
- [ ] Cas imposé : HI = 400, OI = 50, PI ≈ 0,0588235
- [ ] Rejet des valeurs négatives, non numériques, infinies ; TOC nul → HI/OI non calculables ; S1+S2 = 0 → PI indéfini

## Jour 7 — Import CSV Rock-Eval
- [ ] Aperçu, mapping manuel des colonnes, confirmation des unités
- [ ] Séparateurs `,` `;` tab, virgule décimale, BOM
- [ ] Cellules vides, doublons, valeurs invalides signalés ; données originales conservées
- [ ] Tableau filtrable ; export CSV ; exemples étiquetés synthétiques

## Jour 8 — Van Krevelen
- [ ] Nuage HI–OI, sélection, comparaison, export
- [ ] Décision zones : source identifiable trouvée, sinon pas de zones (ADR-08)
- [ ] Mesure du poids du bundle ; choix de la bibliothèque de graphiques

## Jour 9 — Porosité / saturation
- [ ] Mode volumes : φ = 0,20 et Sw = 0,25 sur le cas de test
- [ ] Mode densités : φ ≈ 0,212121 sur le cas de test
- [ ] Bornes physiques vérifiées ; unités affichées

## Jour 10 — Darcy 1D
- [ ] Q = 1e-6 m³/s sur le cas de test
- [ ] Profil de pression linéaire ; comparaison de scénarios
- [ ] ΔP = 0 → Q = 0 ; entrées invalides rejetées ; conversions testées

## Jour 11 — Sauvegarde / export
- [ ] Sessions nommées, duplication, suppression
- [ ] JSON exporté puis réimporté : mêmes entrées et résultats
- [ ] Export CSV ; rapport imprimable

## Jour 12 — Fiches et interprétations
- [ ] Fiche FR/EN pour chaque outil actif (équations, unités, hypothèses, limites)
- [ ] Avertissement général visible

## Jour 13 — Recette technique
- [ ] Build propre ; routes Pages ; langues ; thèmes ; mobile ; clavier ; données invalides

## Jour 14 — Alpha v0.1
- [ ] README (limites), licence, roadmap ; version taguée

## Jours 15 à 21 (conditionnels)
- [ ] J15 Stabilisation des P0
- [ ] J16–17 Archie (si P0 verts) puis Arrhenius
- [ ] J18–19 Poutre (si critères) ou revue scientifique, accessibilité, performances
- [ ] J20 Recette complète sur site public
- [ ] J21 Bêta v0.2 : changelog, limites, niveaux, backlog suivant

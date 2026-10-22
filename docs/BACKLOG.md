# BACKLOG — EngiSim Lab

Cocher une case seulement quand le critère est **observé** (test passé, page vérifiée), pas quand le code est écrit.
Calendrier de référence : `SPEC.md` §11. Ordre de coupe en cas de retard : `SPEC.md` §11.

## Jour 1 — Cadrage
- [x] Dépôt public autonome créé (indépendant du site Rock-Eval)
- [x] `SPEC.md` ajouté
- [x] `CLAUDE.md` ajouté
- [x] `docs/BACKLOG.md` et `docs/SOURCES.md` ajoutés
- [x] Périmètre P0 gelé ; aucune formule non sourcée implémentée

## Jour 2 — Squelette et Pages
- [x] Vite + React + TypeScript initialisés
- [x] Scripts `lint`, `test`, `build` fonctionnent
- [x] `HashRouter` ; `base` = `/EngiSim-Lab/`
- [x] Workflow GitHub Actions de déploiement
- [x] Page minimale visible sur l'URL GitHub Pages ; rechargement OK

## Jour 3 — Catalogue
- [x] Registre `src/catalog/simulators.ts` (source de vérité)
- [x] Navigation, cartes par domaine, recherche, filtres, état vide
- [x] Statuts « Disponible / Prototype / À venir » ; aucun lien cassé
- [x] Tests du registre et de la recherche au vert
- Dette du Jour 3 soldée au Jour 4 : libellés déplacés dans les dictionnaires FR/EN

## Jour 4 — FR/EN et thèmes
- [ ] Dictionnaires `fr.ts` / `en.ts` (clés identiques) + test de complétude (ADR-10)
- [ ] Tous les libellés du Jour 3 traduits ; changement de langue immédiat, langue mémorisée
- [ ] Thème clair / sombre / système, couleur d'accent (ADR-11), préférences mémorisées
- [ ] Page Paramètres ; sélecteur de langue dans l'en-tête
- [ ] Clavier et mobile vérifiés sur les contrôles communs
- À faire plus tard : page « Mes travaux » (Jour 11), mesure des contrastes d'accent (Jour 13)

## Jour 5 — Gabarit scientifique
- [ ] Gabarit de dossier (meta, model, tests, interprétation, ui, fiches)
- [ ] Badge N1/N2/N3 ; enveloppe JSON versionnée définie

## Jour 6 — Rock-Eval (calculs)
- [ ] HI, OI, PI, S2/S3 optionnel
- [ ] Cas imposé : HI = 400, OI = 50, PI ≈ 0,0588235
- [ ] Rejet des valeurs négatives, non numériques, infinies ; TOC nul → HI/OI non calculables ; S1+S2 = 0 → PI indéfini
- [ ] Suppression du test de fumée `src/smoke.test.ts`

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
- [ ] Licences des dépendances renseignées dans `docs/SOURCES.md`
- [ ] Contrastes des couleurs d'accent mesurés (clair et sombre)

## Jour 14 — Alpha v0.1
- [ ] README (limites), licence, roadmap ; version taguée

## Jours 15 à 21 (conditionnels)
- [ ] J15 Stabilisation des P0
- [ ] J16–17 Archie (si P0 verts) puis Arrhenius
- [ ] J18–19 Poutre (si critères) ou revue scientifique, accessibilité, performances
- [ ] J20 Recette complète sur site public
- [ ] J21 Bêta v0.2 : changelog, limites, niveaux, backlog suivant

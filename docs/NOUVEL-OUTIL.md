# Créer un nouvel outil (procédure)

Chaque outil suit le même gabarit. Ne passer à l'étape suivante qu'une fois la précédente vérifiée
(`npm run lint`, `npm test`, `npm run build`).

## 1. Préparer le dossier
1. Copier `src/modules/_template` vers `src/modules/<domaine>/<identifiant-outil>`.
2. Renommer les fichiers si besoin ; supprimer les mentions « GABARIT ».
3. L'identifiant (`id`) doit être **identique** à celui du registre `src/catalog/simulators.ts`.

## 2. Sources d'abord
1. Ajouter ou mettre à jour la référence dans `src/science/references.ts` **et** `docs/SOURCES.md`.
2. Ne passer une référence à `verified` qu'après avoir réellement consulté le document ; renseigner `verifiedOn`.
3. Toute formule, constante ou seuil non vérifié reste marqué `[À SOURCER]` et n'est pas codé comme établi.

## 3. Écrire le modèle
1. `meta.ts` : variables avec unités, équations avec `referenceIds`, hypothèses, limites, domaine de validité (FR et EN).
2. `model.ts` : fonctions pures. Entrées en `unknown`, validées avec `checkNumber` ; unités SI ; résultat non fini refusé.
3. `model.test.ts` : cas nominal (valeur calculée **à la main**, jamais recopiée depuis la formule), au moins trois cas limites, un cas piège, valeurs manquantes et invalides.
4. Si un cas de validation publié existe : l'ajouter dans `validationCases` et ajouter un test qui recalcule `computed` et le compare à la valeur enregistrée.

## 4. Interprétation
1. Écrire des règles `Rule` (voir `src/science/interpretation.ts`) dans `interpretation.ts`.
2. Toute règle de type `reading` (lecture prudente) doit citer des références. Tant qu'elles ne sont pas vérifiées, la lecture est retenue automatiquement.
3. Ajouter les messages dans `src/i18n/fr.ts` **et** `src/i18n/en.ts` (mêmes clés, mêmes variables `{…}`).

## 5. Brancher l'outil
1. Ajouter la fiche dans `src/modules/index.ts` (`MODEL_METAS`).
2. Dans `src/catalog/simulators.ts` : passer `status` à `prototype` ou `available` et renseigner `fidelityLevel`.
   Le test `registry.test.ts` refuse un niveau supérieur aux preuves (N2 exige des références vérifiées, N3 un cas validé).
3. Créer l'interface (`ui.tsx`) : entrées, résultats avec unités, graphique, `InterpretationPanel`, `ScientificSheet`, `IssueList`.

## 6. Checklist avant publication (SPEC.md §10)
Équations sourcées ? Unités explicites ? Paramètres validés ? Hypothèses visibles ? Résultats avec unités ?
Cas limites testés ? Interprétations conditionnelles et traçables ? Limites visibles ?
Données synthétiques étiquetées ? Niveau N1/N2/N3 conforme aux preuves ?
Un seul « non » : l'outil reste en « Prototype » ou « À venir ».

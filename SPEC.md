# SPEC.md — EngiSim Lab

> Source unique de vérité du projet. Fusion du prompt maître (22 sections) et du plan d'action 21 jours du 18 octobre 2026.
> Version du document : 1.0 — 18 octobre 2026.
> Tout agent de développement lit ce fichier en entier avant de modifier le code.

---

## 1. Objet et principes directeurs

**EngiSim Lab** est un atelier web de simulateurs scientifiques et d'ingénierie : on y saisit ou importe des données, on exécute un modèle, on observe des courbes, on compare des scénarios et on lit une interprétation prudente accompagnée de ses sources et limites.

**Ce n'est pas** une plateforme de cours, une encyclopédie, un solveur industriel ni un logiciel certifié.

Principes (par ordre de priorité) :

1. **Exactitude et traçabilité scientifiques** avant le nombre d'outils.
2. **Calculs réels** : un outil dont les calculs ne sont pas testés reste « À venir » ou « Prototype ».
3. **Honnêteté** : ne jamais inventer une formule, une constante, un seuil, une norme, un DOI, un auteur, un jeu de données ou un résultat de validation. Une information non vérifiée est marquée `[À SOURCER]`.
4. **Simplicité** : site statique, peu de dépendances, une fonctionnalité cohérente par lot.
5. **Indépendance** : ce dépôt est distinct du site Rock-Eval existant (https://kane95951-hub.github.io/Rock-Eval-Simulator/). Ne jamais modifier l'ancien dépôt. Ne réutiliser son code qu'après audit de licence et de qualité.

---

## 2. Périmètre

### 2.1 MVP — alpha v0.1 (objectif J14)

| ID | Outil | Statut cible |
|---|---|---|
| P0-1 | Interpréteur Rock-Eval (saisie + import CSV) | Disponible |
| P0-2 | Diagramme de Van Krevelen modifié (HI–OI) | Disponible (zones seulement si sourcées) |
| P0-3 | Porosité et saturation en eau (volumes + densités) | Disponible |
| P0-4 | Écoulement de Darcy 1D monophasique | Disponible |

Socle obligatoire : catalogue multidisciplinaire avec recherche et filtres, FR/EN, thème clair/sombre, couleur d'accent, sauvegarde locale, export/import JSON versionné, export CSV, rapport imprimable, déploiement GitHub Pages.

### 2.2 Bêta v0.2 (objectif J21, conditionnel)

- Loi d'Archie (saturation en eau par résistivités) comme mode de P0-3 ou outil distinct, si les P0 sont stables (voir ADR-02).
- Maturation d'Arrhenius pédagogique (premier ordre).
- Éventuellement un cas de poutre en génie civil, seulement avec référence technique et cas de test indépendants. Sinon : revue scientifique, accessibilité, performances.

### 2.3 Hors périmètre (différé)

3D systématique, comptes et synchronisation cloud, backend, CFD lourde, solveur de réservoir industriel, modélisation complète de bassin, contrôle de puits opérationnel, dimensionnement réglementaire, modèle de langage ou service d'IA distant.

### 2.4 Catalogue multidisciplinaire

Le catalogue couvre les 15 domaines suivants, chaque outil ayant un statut explicite (`available`, `prototype`, `planned`) :

1. Géochimie pétrolière · 2. Géologie et géosciences · 3. Sismique et géophysique · 4. Pétrophysique · 5. Ingénierie de réservoir · 6. Forage et production · 7. Géomécanique · 8. Mécanique des fluides et hydraulique · 9. Thermodynamique et propriétés des fluides · 10. Génie civil et structures · 11. Génie des matériaux · 12. Énergies renouvelables · 13. Génie des procédés · 14. Environnement et CO₂ · 15. Mathématiques, calcul numérique et analyse de données.

Les outils `planned` ont une fiche de présentation sobre, **ne mènent à aucun faux simulateur** et ne produisent aucun résultat factice.

---

## 3. Décisions d'architecture et d'arbitrage (ADR)

| ID | Décision | Raison |
|---|---|---|
| ADR-01 | Calendrier du plan PDF retenu (gabarit scientifique à J5, déploiement test à J2). | Réduit le risque ; le gabarit précède les outils. |
| ADR-02 | P0-3 MVP = porosité par volumes + porosité par densités. **Archie après la stabilisation (J15+)**, avant Arrhenius si les P0 sont verts, sinon bêta. | Archie dépend de a, m, n et du contexte ; on l'ajoute quand ses limites sont documentées. |
| ADR-03 | Deux saturations distinctes dans l'interface : **Sw volumétrique** (Vwater/Vpore, valeurs mesurées) et **Sw Archie** (déduite des résistivités). Libellés et symboles d'export différents. | Évite la confusion entre grandeur mesurée et déduite. |
| ADR-04 | Darcy : profil de pression linéaire (k, μ constants), comparaison de scénarios incluse. | Cohérent avec les hypothèses du modèle. |
| ADR-05 | Persistance : `localStorage` pour le MVP ; IndexedDB seulement si le volume l'exige. | Simplicité. |
| ADR-06 | Routage : `HashRouter`. Préfixe Vite `base` = `/<nom-du-depot>/`, jamais supposé racine. | Compatibilité GitHub Pages. |
| ADR-07 | Graphiques : Plotly.js (version allégée si possible) en chargement différé ; Chart.js si la taille du build pose problème. À mesurer à J8. | Poids du bundle. |
| ADR-08 | Si aucune source identifiable n'est trouvée pour les zones de Van Krevelen à J8 : nuage de points **sans zones**. | Pas de zones non traçables. |
| ADR-09 | Dépôt public (GitHub Pages gratuit). Licence : `[À DÉCIDER par le porteur du projet]`. | — |
| ADR-10 | Internationalisation : module interne typé (`src/i18n`, dictionnaires TypeScript `fr.ts` / `en.ts`, fonction pure `translate`) à la place d'i18next. Les clés sont vérifiées par TypeScript et par un test de complétude. À réévaluer si des pluriels ou formats complexes deviennent nécessaires. | Besoins simples, aucune dépendance supplémentaire. |
| ADR-11 | Couleur d'accent : palette de 6 couleurs prédéfinies, avec une variante pour le thème clair et une pour le thème sombre, plutôt qu'un sélecteur libre. Contrastes à mesurer au Jour 13. | Garantit une lisibilité minimale. |

Toute nouvelle décision significative est ajoutée à ce tableau.

---

## 4. Architecture technique

**Stack** : React, TypeScript, Vite, Vitest, ESLint, i18next + react-i18next (ou équivalent), Plotly.js ou équivalent 2D, GitHub Actions. CSS par variables (jetons de design) ; Tailwind facultatif, seulement s'il apporte un gain réel. Ne pas ajouter Three.js, Pyodide, serveur ni base distante.

**Contraintes** : site statique, calculs dans le navigateur, aucun compte, aucun backend, aucun secret ni clé API dans le code. Nouvelle dépendance importante = justification écrite.

**Structure indicative** :

```
src/
  app/            App.tsx, routes.tsx
  components/     layout/ navigation/ forms/ charts/ results/ scientific/
  catalog/        simulators.ts          # registre central, source de vérité du catalogue
  modules/
    geochemistry/ rock-eval/  van-krevelen/
    petrophysics/ porosity-saturation/  darcy-flow/
    thermodynamics/ arrhenius-maturation/   # J16+
      (chaque outil : meta.json, model.ts, model.test.ts,
       interpretation.ts, ui.tsx, fiche.fr.md, fiche.en.md, data/)
  services/       persistence/ import-export/ validation/
  i18n/           fr.json  en.json
  styles/  types/  utils/
tests/  docs/  public/
```

**Règles de code**

- Les moteurs scientifiques (`model.ts`) sont des **fonctions pures** : mêmes entrées, mêmes sorties, aucune dépendance au DOM, à React ou à l'état du navigateur.
- Unités internes en **SI** ; conversions explicites et testées.
- Valeur manquante = manquante. Jamais remplacée par zéro ou par une valeur plausible sans règle justifiée et affichée.
- Les résultats non finis (`NaN`, `Infinity`) sont rejetés ou signalés, jamais affichés comme des nombres.
- Le catalogue ne se déduit que de `src/catalog/simulators.ts` : aucune liste d'outils dupliquée dans les composants.

**GitHub Pages** : workflow GitHub Actions reproductible (installation, lint, tests, build, déploiement). Vérifier liens internes, changement de page et rechargement sous le sous-chemin. Étapes manuelles (activation de Pages, nom du dépôt) documentées dans le README ; ne pas modifier à distance les paramètres du compte ou du dépôt sans autorisation.

---

## 5. Gabarit d'un simulateur

Chaque outil suit la même structure et le même dossier de validation.

**`meta.json`** (champs minimaux) : `id`, `name.fr`, `name.en`, `description.fr`, `description.en`, `domain`, `keywords[]`, `status` (`available` | `prototype` | `planned`), `fidelityLevel` (`N1` | `N2` | `N3`), `modelVersion`, `references[]` (ids vers le registre des sources), `validityDomain`, `mainUnits`, `variables[]`, `formulas[]`.

**Fiche scientifique** (FR et EN, concise) : équations, signification des variables, unités, hypothèses, valeurs admissibles, limites connues, références, cas de validation, version du modèle. Pas de cours.

**Page d'un simulateur** : paramètres d'entrée → commandes de calcul et scénarios → visualisation principale → résultats numériques avec unités → interprétation → hypothèses et limites → fiche et références. Sur mobile, ces zones s'empilent.

**Interprétation** (`interpretation.ts`) : règles explicites, déterministes et sourcées. Chaque sortie distingue : (1) résultats calculés, (2) ce qu'ils permettent d'observer, (3) interprétation prudente, (4) hypothèses, (5) limites et alertes, (6) références. Si les données ne permettent pas d'interpréter, l'outil l'explique.

---

## 6. Niveaux de fidélité scientifique

| Niveau | Définition |
|---|---|
| **N1 — Pédagogique** | Modèle simplifié explicitement décrit. |
| **N2 — Quantitatif** | Équation ou corrélation publiée implémentée, avec unités, hypothèses et tests. |
| **N3 — Validé** | Reproduit un cas de référence publié, avec comparaison numérique, tolérance et écart documentés. |

N3 n'est attribué que sur preuve (source, valeur attendue, valeur calculée, tolérance, écart). Le niveau reflète les preuves, pas la sophistication de l'interface. Au MVP, N2 est le maximum attendu, et N1 si la source de l'équation n'est pas confirmée.

---

## 7. Spécifications des outils

### 7.1 P0-1 — Interpréteur Rock-Eval

**Entrées** : identifiant d'échantillon, S1, S2, S3, TOC, Tmax. Convention conventionnelle : S1, S2, S3 en mg/g de roche ; TOC en % massique ; Tmax en °C. Les entrées sont visuellement distinctes des grandeurs calculées.

**Formules** :

- HI = 100 × S2 / TOC (mg HC/g TOC)
- OI = 100 × S3 / TOC (mg CO₂/g TOC — convention conservée et affichée)
- PI = S1 / (S1 + S2), seulement si S1 + S2 > 0
- S2/S3 : indicateur auxiliaire, seulement si S3 valide et non nul

**Règles de validation** :

- Refuser valeurs non numériques, infinies, et valeurs négatives (pics et TOC).
- TOC nul ou absent : HI et OI non calculables.
- S1 + S2 = 0 : PI indéfini.
- Tmax absent, incohérent ou peu fiable : avertir l'utilisateur.
- Aucune valeur manquante remplacée par zéro.

**Cas de test imposé (synthétique)** : S1 = 0,50 ; S2 = 8,00 ; S3 = 1,00 ; TOC = 2,00 ; Tmax = 440. Attendu : HI = 400 ; OI = 50 ; PI = 0,5/8,5 ≈ 0,0588235.

**Import CSV** :

- Reconnaissance raisonnable des en-têtes, aperçu des premières lignes, association manuelle des colonnes, confirmation des unités.
- Gestion explicite des **séparateurs** (`,` `;` tabulation), de la **virgule décimale**, du **BOM** et des encodages courants. Ne pas supposer un format unique.
- Si le fichier contient déjà HI/OI : les importer comme grandeurs « mesurées/importées », les comparer aux valeurs recalculées, signaler les écarts, ne jamais écraser.
- Signaler cellules vides, doublons, valeurs invalides. Conserver les données originales sans correction silencieuse.
- Tableau filtrable, sélection d'un échantillon, export CSV des résultats.
- Exemples fournis et **étiquetés synthétiques**.

**Interprétation** : fondée sur les indicateurs combinés et la qualité des données. Jamais de maturité, de type de kérogène ou d'origine des hydrocarbures déduits d'un seul paramètre. Un PI élevé a plusieurs causes possibles ; Tmax est fragile quand S2 est faible ou atypique ; HI/OI dépendent de la maturation, des altérations et de la qualité du TOC. Les seuils sont des repères contextualisés, sourcés (voir §14).

**Niveau cible** : N2 (formules de définition), sous réserve de confirmation des sources.

### 7.2 P0-2 — Van Krevelen modifié

- Nuage de points HI–OI interactif, axes et unités indiqués, identification des échantillons.
- Sélection et désélection de points, affichage des valeurs d'un échantillon, comparaison de plusieurs échantillons.
- Utilise les échantillons valides du module Rock-Eval (aucun point issu d'un HI/OI non calculable).
- Export des données et du scénario.
- **Zones de types de matière organique** : dessinées uniquement si leurs limites proviennent d'une référence identifiable, affichée dans l'interface (ADR-08). Les zones ne sont pas présentées comme universelles ; rappel bref des effets de maturation, d'altération et de qualité des données.

### 7.3 P0-3 — Porosité et saturation en eau

**Mode volumes** :

- Vpore = Vbulk − Vgrain (si les volumes sont saisis ainsi) ; φ = Vpore / Vbulk
- Sw (volumétrique) = Vwater / Vpore

**Mode densités** (hypothèses de matrice et de fluide explicites) :

- φ = (ρgrain − ρbulk) / (ρgrain − ρfluid)

**Contrôles** : volumes positifs ; Vgrain ≤ Vbulk ; Vwater ≤ Vpore ; φ dans [0, 1] ; ρgrain ≠ ρfluid ; avertissement si le résultat est physiquement incohérent. Unités affichées ; Sw en fraction et en pourcentage avec convention claire.

**Cas de test (synthétiques)** :

- Volumes : Vbulk = 100, Vgrain = 80, Vwater = 5 (même unité de volume) → Vpore = 20, φ = 0,20, Sw = 0,25.
- Densités : ρgrain = 2650, ρbulk = 2300, ρfluid = 1000 kg/m³ → φ = 350/1650 ≈ 0,212121.

**Archie (étape ultérieure, voir ADR-02/03)** :

- Sw^n = a × Rw / (φ^m × Rt), soit Sw = [a × Rw / (φ^m × Rt)]^(1/n)
- Entrées : φ effective, Rw, Rt, a, m, n — saisies explicitement, **aucune constante universelle imposée**.
- Limite visible : modèle classique non universel, notamment en formations argileuses ou conductrices.
- Test (synthétique) : a = 1, m = 2, n = 2, Rw = 0,05, φ = 0,20, Rt = 20 → Sw² = 0,05/(0,04 × 20) = 0,0625 → Sw = 0,25.
- Sw > 1 : signalé comme hors domaine physique plausible.

### 7.4 P0-4 — Écoulement de Darcy 1D

**Modèle** : écoulement monophasique, milieu poreux homogène, k et μ constants, régime où Darcy s'applique (laminaire). Convention de signe : axe x orienté de l'amont vers l'aval.

- Q = −(k × A / μ) × (dP/dx), avec dP/dx = (P_aval − P_amont) / L
- Donc Q = k × A × (P_amont − P_aval) / (μ × L) ; |Q| = (k × A / μ) × (ΔP / L)
- Vitesse de Darcy : u = Q / A
- Profil de pression : P(x) = P_amont − (ΔP / L) × x, pour x ∈ [0, L]

**Entrées** : k, A, μ, L, P_amont, P_aval, en SI ou converties explicitement (conversions testées ; constantes à confirmer contre une source, voir §14). Q change de signe si P_amont < P_aval ; ΔP = 0 donne Q = 0.

**Contrôles** : k, A, μ, L strictement positifs ; entrées finies ; message d'erreur utile sinon.

**Cas de test (synthétique)** : k = 1e-12 m², A = 1e-2 m², μ = 1e-3 Pa·s, L = 1 m, ΔP = 1e5 Pa → Q = 1e-6 m³/s.

**Tests de propriétés** : Q augmente avec k ; diminue avec μ ; diminue avec L (ΔP fixé) ; ΔP = 0 → Q = 0 ; entrées invalides rejetées.

**Limites affichées** : modèle analytique réduit, pas un simulateur de réservoir. Référence de la formulation : `[À SOURCER]` dans la fiche avant statut « Disponible » au niveau N2.

### 7.5 P1 — Maturation d'Arrhenius pédagogique (J16–J17, conditionnel)

- k(T) = A × exp(−Ea / (R × T)), T en kelvins, R = 8,314462618 J/(mol·K) (à confirmer contre une source)
- dα/dt = k(T) × (1 − α) ; à T constante : α(t) = 1 − exp(−k × t)
- Unités de A, Ea, R et du temps définies ; aucune conversion minutes/secondes/années implicite.
- Protection contre les dépassements de l'exponentielle ; paramètres validés.
- Test de propriété : Ea = 0 → k = A ; k × t = 1 → α = 1 − e⁻¹ ≈ 0,632121.
- Température variable : intégration numérique adaptée et testée.
- **Paramètres hypothétiques** tant qu'ils ne sont pas sourcés. Pas de prétention à reproduire une histoire de bassin ni à prédire une génération réelle d'hydrocarbures.
- Niveau cible : N1.

---

## 8. Interface et expérience utilisateur

- Navigation : Accueil, Explorer les simulateurs, Domaines d'ingénierie, Mes travaux, Références scientifiques, Paramètres.
- Accueil centré sur les outils : recherche, filtres par discipline, outils fonctionnels, expériences récentes (si données locales), outils en préparation clairement distingués.
- **Recherche** (sans serveur) : nom, discipline, description, mots-clés, variables/formules, statut. État vide explicite. Filtres : domaine, type d'outil, niveau d'ingénierie, disponibilité, mots-clés.
- **i18n** : FR/EN, changement immédiat, aucune chaîne d'écran importante en dur, noms de variables et formats d'échange stables entre langues, test automatique de complétude des clés.
- **Thèmes** : clair/sombre, préférence système détectée au premier lancement, couleur d'accent personnalisable, préférences dans `localStorage`.
- **Accessibilité** : libellés, navigation clavier, contrastes, messages d'erreur utiles, responsive (ordinateur, tablette, mobile).
- **Graphiques** : axes et unités, légende si nécessaire, mise à jour depuis les calculs réels, précision affichée raisonnable, solution de repli si une fonction avancée manque. Chargement différé des écrans lourds.
- Éviter : interface faite uniquement de cartes, gradients excessifs, textes surdimensionnés. Ne pas copier les marques ni le code de logiciels professionnels.

---

## 9. Sauvegarde, export et import

- Sauvegarde locale de scénarios : nom, dates de création/modification, id et version du simulateur, paramètres, métadonnées.
- Duplication et suppression (confirmation si nécessaire).
- **Export JSON versionné** (enveloppe : `schemaVersion`, `simulatorId`, `modelVersion`, paramètres, métadonnées). Enveloppe définie dès J5.
- **Import JSON** avec validation de schéma, d'identifiants, de versions et d'entrées. Jamais d'exécution aveugle. Si le modèle a changé, indiquer l'incompatibilité au lieu de charger silencieusement.
- Export CSV des tableaux de résultats. Rapport imprimable via feuille de style d'impression.
- Avertir que les travaux restent sur l'appareil et peuvent être perdus ; ce n'est pas une synchronisation cloud.
- Critère de reproductibilité : JSON exporté puis réimporté redonne les mêmes entrées et résultats.

---

## 10. Validation scientifique et tests

Pour chaque simulateur : tests nominaux, limites, valeurs manquantes/invalides, unités et conversions, résultats attendus, comportement des interprétations, export/import si présents.

**Règles de test**

- Les valeurs attendues sont **calculées à la main ou indépendamment**, jamais produites en recopiant la formule testée.
- Minimum par outil : un cas nominal, trois cas limites, un cas piège pertinent, un cas de référence publié lorsqu'il existe.
- Si aucun cas publié n'est disponible : tests mathématiques et de propriétés, et **mention honnête de l'absence de validation externe indépendante**.
- Ne jamais affirmer une comparaison avec un logiciel de référence qui n'a pas été faite.

**Checklist par simulateur** (tout « non » = outil en « Prototype » ou « À venir ») :

1. Équations avec source identifiable ? 2. Unités explicites ? 3. Paramètres validés ? 4. Hypothèses accessibles ? 5. Résultats avec unités ? 6. Cas limites testés ? 7. Interprétations conditionnelles et traçables ? 8. Limites visibles ? 9. Données synthétiques étiquetées ? 10. Niveau N1/N2/N3 conforme aux preuves ?

---

## 11. Planning

Les jours sont des jalons ; un jalon n'est pas « terminé » si ses critères de qualité ne sont pas satisfaits. Chaque jour finit par un commit fonctionnel.

| Jour | Jalon |
|---|---|
| J1 | Cadrage : dépôt autonome, SPEC.md, CLAUDE.md/AGENTS.md, backlog, registre des sources. Aucune formule non sourcée. |
| J2 | Vite/React/TS, lint, Vitest, routage, GitHub Actions, base URL ; page minimale publiée. |
| J3 | Catalogue : navigation, recherche, filtres, statuts, modules « À venir ». |
| J4 | FR/EN, thèmes, accent, contrôles communs, clavier/mobile. |
| J5 | Gabarit scientifique : métadonnées, modèle pur, tests, interprétation, fiches, badge N1/N2/N3, enveloppe JSON. |
| J6 | Moteur Rock-Eval (HI, OI, PI, S2/S3), validation, cas imposé. |
| J7 | Import CSV Rock-Eval (peut déborder ; prioriser la transparence). |
| J8 | Van Krevelen ; décision zones (ADR-08) ; mesure du poids de Plotly. |
| J9 | Porosité/saturation (volumes + densités). |
| J10 | Darcy 1D. |
| J11 | Sauvegarde, export/import JSON, CSV, rapport imprimable. |
| J12 | Fiches, interprétations, avertissement général, cohérence des modules. |
| J13 | Recette technique : build propre, données invalides, routes Pages, langues, thèmes, mobile, clavier. |
| J14 | Alpha v0.1 : tests en ligne, README, licences, limites, roadmap, tag. |
| J15 | Stabilisation des P0 (priorité sur toute nouvelle simulation). |
| J16–17 | Archie (si P0 verts) puis Arrhenius, tests, fiches. |
| J18–19 | Poutre génie civil (conditionnel) ou revue scientifique, accessibilité, performances. |
| J20 | Recette complète sur site public (desktop/mobile), chaînes FR/EN, licences, dépendances, secrets, taille du build. |
| J21 | Bêta v0.2 : changelog, limites, niveaux, backlog. Publier uniquement ce qui satisfait les critères. |

**Ordre de coupe en cas de retard** : (1) IndexedDB, (2) rapport imprimable, (3) couleur d'accent, (4) validation fine de l'import JSON (garder l'export). Ne jamais couper : tests, unités, avertissements, limites visibles.

---

## 12. Critères de publication (portes)

| Porte | Indicateur observable |
|---|---|
| P0 Dépôt | Projet autonome ; aucune modification de l'ancien dépôt. |
| P1 Déploiement | Build automatisé vert ; URL Pages accessible ; routage fonctionnel. |
| P2 Science | Chaque formule a unités, domaine d'utilisation, source (ou `[À SOURCER]`) et tests. |
| P3 Expérience | Les paramètres modifient réellement chiffres et graphes ; erreurs visibles. |
| P4 Reproductibilité | JSON exporté puis réimporté : mêmes entrées et résultats. |
| P5 Bilinguisme | FR/EN complets ; aucune chaîne principale manquante. |
| P6 Publication | Outils incomplets « À venir » ou « Prototype » ; limites et avertissement visibles. |

Lint, tests et build au vert avant tout merge ou publication.

---

## 13. Avertissement général (affiché dans l'application)

> EngiSim Lab est un atelier de simulation et de calcul à vocation pédagogique et exploratoire. Les résultats dépendent des hypothèses, des données et du domaine de validité de chaque modèle. Ils ne remplacent ni une mesure expérimentale, ni une validation indépendante, ni un logiciel certifié, ni l'avis d'un ingénieur qualifié.

Les modules de forage, de structures et tout outil lié à la sécurité, s'ils sont ajoutés, portent des avertissements spécifiques renforcés et une revue experte.

---

## 14. Registre des sources et points `[À SOURCER]`

Aucune référence ci-dessous n'est considérée comme vérifiée tant que son statut n'est pas « Vérifiée ». Ne jamais compléter de mémoire un DOI, un volume ou des numéros de pages.

### 14.1 Références de départ

| Id | Référence (telle que citée dans le cadrage) | Utilisée pour | Statut |
|---|---|---|---|
| REF-PETERS-1986 | Peters, 1986, *Guidelines for Evaluating Petroleum Source Rock Using Programmed Pyrolysis* | Rock-Eval (formules, repères d'interprétation) | À vérifier (référence complète) |
| REF-ESPITALIE | Espitalié et collaborateurs, travaux sur la pyrolyse Rock-Eval | Rock-Eval | À vérifier (article précis à identifier) |
| REF-ARCHIE-1942 | Archie, 1942, *The Electrical Resistivity Log as an Aid in Determining Some Reservoir Characteristics* | Archie | À vérifier (référence complète) |
| REF-DARCY | Formulation de la loi de Darcy | Darcy 1D | `[À SOURCER]` — manuel de référence à identifier |
| REF-VK | Source des domaines de types de matière organique (Van Krevelen / HI–OI) | Zones P0-2 | `[À SOURCER]` — sinon pas de zones |
| REF-ARRH | Cinétique d'Arrhenius ; paramètres A et Ea | Arrhenius | `[À SOURCER]` ; sinon paramètres « hypothétiques » |

### 14.2 Points `[À SOURCER]` à ne pas coder avant vérification

- TOC minimal au-dessous duquel HI/OI sont peu fiables.
- S2 minimal pour un Tmax exploitable.
- Bornes de Tmax associées aux stades de maturité.
- Limites des types de kérogène sur le diagramme HI–OI.
- Constantes de conversion (mD → m², cP → Pa·s, psi/bar → Pa) : à confirmer dans une source reconnue.
- Valeur de R et ordres de grandeur de A et Ea pour Arrhenius.

Les normes (ASTM, ISO, API…) peuvent être citées par référence ; leur texte protégé n'est pas reproduit.

---

## 15. Risques principaux

| Risque | Parade |
|---|---|
| Surcharge du calendrier (70–100 h) | Ordre de coupe (§11) ; moins d'outils plutôt que moins de qualité. |
| Import CSV sous-estimé | Prioriser transparence et mapping ; déborder sur J8 plutôt que bâcler. |
| Références inventées ou erronées | Registre §14 ; statut « Vérifiée » obligatoire avant publication. |
| Tests circulaires | Valeurs attendues calculées indépendamment. |
| N3 revendiqué à tort | Interdit sans benchmark documenté. |
| Poids du bundle (Plotly) | Chargement différé ; mesure à J8 ; repli Chart.js. |
| Dérive de périmètre | Un lot à la fois ; extensions seulement si P0 verts. |
| Réutilisation du code de l'ancien site | Audit de licence et de qualité préalable ; lien externe au départ. |

---

## 16. Règles pour l'agent de développement

1. Lire ce fichier en entier avant toute modification.
2. Avant chaque lot : mini-plan et fichiers concernés. Une seule fonctionnalité cohérente par lot ; modifier uniquement ce qui est nécessaire.
3. Ne créer de mémoire aucune équation, constante, norme, référence ou seuil. Source non vérifiée → `[À SOURCER]`, outil non annoncé comme validé.
4. Séparer modèle pur et interface ; unités SI ; valeurs manquantes traitées comme manquantes.
5. Ne jamais présenter des courbes ou valeurs synthétiques comme des mesures.
6. À la fin de chaque lot : lancer lint, tests et build ; rapporter les résultats réels, fichiers modifiés, limites restantes, sources à vérifier. Ne jamais prétendre avoir exécuté un test, déployé ou consulté une source sans l'avoir fait.
7. Si les tests échouent, corriger avant de passer au lot suivant.
8. Ne modifier ni l'ancien dépôt Rock-Eval ni les paramètres distants sans autorisation explicite ; ne jamais ajouter de secret au dépôt.
9. Données confidentielles ou non publiées : ne pas les transmettre à un service d'IA externe.

---

## 17. Journal des décisions ouvertes

- [ ] Nom du dépôt (pour `base` Vite et URL Pages).
- [ ] Licence du dépôt (ADR-09).
- [ ] Choix définitif de la bibliothèque de graphiques après mesure (J8).
- [ ] Sources vérifiées pour REF-PETERS-1986, REF-ESPITALIE, REF-ARCHIE-1942, REF-DARCY, REF-VK, REF-ARRH.
- [ ] Audit de licence de l'ancien code Rock-Eval (si réutilisation envisagée).

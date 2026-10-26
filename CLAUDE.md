# CLAUDE.md — Consignes pour l'agent de développement d'EngiSim Lab

Tu aides à développer **EngiSim Lab**, un laboratoire web de simulateurs scientifiques interactifs (pas une plateforme de cours).

**Avant toute modification, lis `SPEC.md` en entier.** C'est la source unique de vérité (périmètre, décisions ADR, formules, tests, planning). En cas de conflit entre une demande ponctuelle et `SPEC.md`, signale le conflit au lieu de choisir en silence.

Le dépôt est **indépendant** du site Rock-Eval existant (https://kane95951-hub.github.io/Rock-Eval-Simulator/) : ne le modifie jamais.

## Priorités

Exactitude et traçabilité scientifiques → tests reproductibles → fonctionnalité → interface.

## Règles impératives

- Ne crée **aucune** équation, constante, norme, référence, DOI ou seuil de mémoire. Si une source n'est pas vérifiée, marque `[À SOURCER]` et n'annonce pas l'outil comme validé.
- Sépare le modèle numérique pur (`model.ts`) de l'interface (`ui.tsx`). TypeScript, unités SI.
- Traite une valeur manquante comme manquante. Valide unités, bornes, dénominateurs et résultats non finis (`NaN`, `Infinity`).
- Les valeurs attendues des tests sont calculées indépendamment de la formule testée, jamais recopiées depuis elle.
- N'utilise le niveau N3 que si un cas publié est reproduit avec un écart chiffré et documenté.
- Ne présente jamais des données ou courbes synthétiques comme des mesures.
- Pour tout outil : métadonnées, entrées/sorties, tests, interprétation conditionnelle, limites, fiche FR/EN, références, version, niveau N1/N2/N3.
- Site statique pour GitHub Pages : `HashRouter`, préfixe Vite `base` = `/EngiSim-Lab/`. Aucun secret ni clé API dans le dépôt.
- Interface FR/EN complète, thèmes clair/sombre, clavier et mobile. Aucune chaîne d'écran importante en dur.
- Nouvelle dépendance importante = justification écrite avant ajout.

## Méthode de travail

- **Un seul lot cohérent par session.** Avant de commencer : mini-plan et liste des fichiers concernés. Ne modifie que ce qui est nécessaire.
- À la fin du lot : lance `npm run lint`, `npm test` et `npm run build`. Rapporte les **résultats réels**, les fichiers modifiés, les limites restantes et les sources à vérifier.
- Si un test échoue, corrige avant de passer au lot suivant.
- Ne prétends jamais avoir exécuté un test, déployé le site, consulté une source ou effectué une validation si ce n'est pas le cas.
- Pour créer ou modifier un outil, suis `docs/NOUVEL-OUTIL.md` et copie `src/modules/_template`. Le niveau N1/N2/N3 affiché doit correspondre aux preuves (test `registry.test.ts`).
- Mets à jour `docs/BACKLOG.md` (cases cochées) et `docs/SOURCES.md` (statuts) à chaque lot concerné.

## Interlocuteur

Le porteur du projet est débutant en programmation et sur GitHub. Pour toute action manuelle qu'il doit effectuer, donne des instructions **étape par étape**, avec les commandes exactes à copier-coller et ce qu'il doit voir à l'écran en cas de succès. Explique les erreurs en termes simples.

## Interdits

- Modifier l'ancien dépôt Rock-Eval ou les paramètres du compte/dépôt GitHub sans autorisation explicite.
- Ajouter un backend, un service d'IA distant, Three.js ou Pyodide sans décision écrite dans `SPEC.md`.
- Publier un outil dont la formule centrale, la validation des entrées ou les tests sont incomplets.

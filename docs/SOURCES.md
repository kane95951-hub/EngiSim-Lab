# SOURCES — Registre des références d'EngiSim Lab

Règle : une référence n'est « Vérifiée » qu'après consultation du document lui-même. Ne jamais compléter de mémoire un DOI, un volume ou des numéros de page. Tant que le statut n'est pas « Vérifiée », l'outil concerné ne dépasse pas le niveau N1 et la fiche affiche la mention `[À SOURCER]`.

## Références

| Id | Référence (telle que citée dans le cadrage) | Utilisée pour | Statut | Notes |
|---|---|---|---|---|
| REF-PETERS-1986 | Peters, 1986, *Guidelines for Evaluating Petroleum Source Rock Using Programmed Pyrolysis* | Rock-Eval : formules, repères d'interprétation | À vérifier | Compléter la référence bibliographique après consultation |
| REF-ESPITALIE | Espitalié et collaborateurs, travaux sur la pyrolyse Rock-Eval | Rock-Eval | À vérifier | Article précis à identifier |
| REF-ARCHIE-1942 | Archie, 1942, *The Electrical Resistivity Log as an Aid in Determining Some Reservoir Characteristics* | Loi d'Archie | À vérifier | Compléter après consultation |
| REF-DARCY | Formulation de la loi de Darcy | Darcy 1D | `[À SOURCER]` | Manuel de référence à identifier |
| REF-PETROPHYSICS | Définitions de la porosité, de la saturation et de la porosité par densités (manuel de pétrophysique à identifier) | Porosité et saturation volumétrique | `[À SOURCER]` | Sans source : niveau N1 |
| REF-VK | Source des domaines de types de matière organique (HI–OI) | Zones Van Krevelen | `[À SOURCER]` | Sans source : pas de zones (ADR-08) |
| REF-ARRH | Cinétique d'Arrhenius ; paramètres A et Ea | Arrhenius | `[À SOURCER]` | Sinon paramètres « hypothétiques » |

## Points `[À SOURCER]` à ne pas coder avant vérification

- TOC minimal au-dessous duquel HI/OI sont peu fiables
- S2 minimal pour un Tmax exploitable
- Bornes de Tmax associées aux stades de maturité
- Limites des types de kérogène sur le diagramme HI–OI
- Constantes de conversion (mD → m², cP → Pa·s, psi/bar → Pa)
- Source des formules de porosité (volumes et densités) et de la saturation volumétrique
- Valeur de R et ordres de grandeur de A et Ea pour Arrhenius

## Jeux de données

| Id | Description | Origine | Licence | Statut |
|---|---|---|---|---|
| DATA-SYNTH-RE-01 | Échantillon Rock-Eval de test (S1=0,50 ; S2=8,00 ; S3=1,00 ; TOC=2,00 ; Tmax=440) | **Synthétique**, créé pour tester les formules | Libre (projet) | Étiqueté synthétique |

## Dépendances logicielles (licences)

À remplir au Jour 2 : nom, version, licence, usage. Vérifier la licence de chaque dépendance avant publication.

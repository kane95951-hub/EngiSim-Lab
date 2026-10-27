// Fichier CSV SYNTHÉTIQUE pour essayer l'import. Il ne provient d'aucune analyse de laboratoire.
// Format volontairement « français » (séparateur ; et virgule décimale) et contenant des cas pièges :
//  - SYN-01 : le cas imposé du cahier des charges (HI = 400, OI = 50)
//  - SYN-03 : Tmax absent
//  - SYN-04 : TOC = 0 (HI et OI non calculables)
//  - SYN-05 : valeur de S3 non numérique (ligne invalide)
//  - SYN-01 (2e ligne) : identifiant en double
//  - SYN-07 : HI importé très différent du HI recalculé
// Les colonnes HI et OI sont traitées comme des valeurs importées, jamais écrasées.
export const SYNTHETIC_CSV = [
  'Echantillon;S1 (mg/g);S2 (mg/g);S3 (mg/g);TOC (%);Tmax (°C);HI;OI',
  'SYN-01;0,50;8,00;1,00;2,00;440;400;50',
  'SYN-02;1,20;3,40;0,80;1,50;432;227;53',
  'SYN-03;0,10;0,40;0,30;0,20;;200;150',
  'SYN-04;0,30;2,00;0,50;0;445;;',
  'SYN-05;0,20;5,00;abc;1,00;438;500;20',
  'SYN-01;0,40;6,00;1,20;3,00;441;200;40',
  'SYN-07;0,50;4,00;1,00;2,00;438;999;50',
  '',
].join('\n')

import { describe, expect, it } from 'vitest'
import {
  decodeCsvBytes,
  detectDelimiter,
  escapeCsvCell,
  neutralizeFormula,
  parseCsv,
  toCsv,
} from './csv'

describe('decodeCsvBytes', () => {
  it('lit de l’UTF-8 et retire le BOM', () => {
    const bytes = new TextEncoder().encode('\uFEFFéchantillon;S1')
    expect(decodeCsvBytes(bytes)).toEqual({ text: 'échantillon;S1', encoding: 'utf-8' })
  })

  it('se replie sur windows-1252 quand le fichier n’est pas de l’UTF-8 valide', () => {
    const decoded = decodeCsvBytes(Uint8Array.from([0x41, 0xe9, 0x42]))
    expect(decoded).toEqual({ text: 'AéB', encoding: 'windows-1252' })
  })
})

describe('detectDelimiter', () => {
  it('reconnaît le point-virgule avec des virgules décimales', () => {
    expect(detectDelimiter('Echantillon;S1;S2\nA;0,5;8,0\nB;1,2;3,4\n')).toBe(';')
  })

  it('reconnaît la virgule avec des points décimaux', () => {
    expect(detectDelimiter('Sample,S1,S2\nA,0.5,8.0\nB,1.2,3.4\n')).toBe(',')
  })

  it('reconnaît la tabulation', () => {
    expect(detectDelimiter('Sample\tS1\tS2\nA\t0.5\t8.0\n')).toBe('\t')
  })

  it('renvoie la virgule pour un fichier à une seule colonne', () => {
    expect(detectDelimiter('Sample\nA\nB\n')).toBe(',')
  })
})

describe('parseCsv', () => {
  it('lit les lignes et les numéros de ligne, en sautant les lignes vides', () => {
    const parsed = parseCsv('a;b\n\n1;2\n3;4\n\n')
    expect(parsed.delimiter).toBe(';')
    expect(parsed.rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ])
    expect(parsed.lineNumbers).toEqual([1, 3, 4])
  })

  it('accepte les fins de ligne CRLF et CR', () => {
    expect(parseCsv('a,b\r\n1,2\r\n').rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
    expect(parseCsv('a,b\r1,2\r').rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('gère les guillemets, le séparateur et les retours à la ligne dans une cellule', () => {
    const parsed = parseCsv('nom,note\n"Dupont, Jean","a ""b"" c"\n"ligne1\nligne2",x\nfin,y\n', ',')
    expect(parsed.rows).toEqual([
      ['nom', 'note'],
      ['Dupont, Jean', 'a "b" c'],
      ['ligne1\nligne2', 'x'],
      ['fin', 'y'],
    ])
    expect(parsed.lineNumbers).toEqual([1, 2, 3, 5])
  })

  it('conserve les cellules vides et le texte exact', () => {
    expect(parseCsv('a;b;c\n1;;3\n', ';').rows[1]).toEqual(['1', '', '3'])
    expect(parseCsv('a;b\n 1,5 ;x\n', ';').rows[1]).toEqual([' 1,5 ', 'x'])
  })

  it('retire le BOM en tête de fichier', () => {
    expect(parseCsv('\uFEFFa,b\n1,2\n').rows[0]).toEqual(['a', 'b'])
  })

  it('respecte un séparateur imposé', () => {
    expect(parseCsv('a;b,c\n1;2,3\n', ',').rows[0]).toEqual(['a;b', 'c'])
  })
})

describe('écriture CSV', () => {
  it('met entre guillemets les cellules qui contiennent séparateur, guillemet ou saut de ligne', () => {
    expect(escapeCsvCell('simple')).toBe('simple')
    expect(escapeCsvCell('a,b')).toBe('"a,b"')
    expect(escapeCsvCell('a"b')).toBe('"a""b"')
    expect(escapeCsvCell('a\nb')).toBe('"a\nb"')
    expect(escapeCsvCell('a;b', ';')).toBe('"a;b"')
  })

  it('neutralise les débuts de cellule interprétables comme une formule', () => {
    expect(neutralizeFormula('=1+1')).toBe("'=1+1")
    expect(neutralizeFormula('+cmd')).toBe("'+cmd")
    expect(neutralizeFormula('-x')).toBe("'-x")
    expect(neutralizeFormula('@SUM')).toBe("'@SUM")
    expect(neutralizeFormula('Échantillon A')).toBe('Échantillon A')
  })

  it('relit à l’identique un tableau écrit avec toCsv', () => {
    const table = [
      ['id', 'note'],
      ['A', 'avec, virgule'],
      ['B', 'avec "guillemets"'],
      ['C', ''],
    ]
    expect(parseCsv(toCsv(table), ',').rows).toEqual(table)
  })
})

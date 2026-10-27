// Lecture et écriture de fichiers CSV : fonctions pures (sauf TextDecoder, disponible dans le navigateur et Node).
// Aucune donnée n'est corrigée : les cellules sont renvoyées telles qu'elles sont écrites dans le fichier.

export type Delimiter = ',' | ';' | '\t'

// Ordre de priorité en cas d'égalité entre deux séparateurs candidats.
export const DELIMITERS: Delimiter[] = [';', '\t', ',']

export interface DecodedText {
  text: string
  encoding: 'utf-8' | 'windows-1252'
}

export interface ParsedCsv {
  delimiter: Delimiter
  // Toutes les lignes non vides, y compris l'en-tête.
  rows: string[][]
  // Numéro de ligne (à partir de 1) du début de chaque entrée de `rows`, dans le fichier d'origine.
  lineNumbers: number[]
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

// UTF-8 d'abord ; si le fichier n'est pas de l'UTF-8 valide (cas fréquent des exports Excel anciens),
// repli sur windows-1252.
export function decodeCsvBytes(bytes: Uint8Array): DecodedText {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return { text: stripBom(text), encoding: 'utf-8' }
  } catch {
    return { text: stripBom(new TextDecoder('windows-1252').decode(bytes)), encoding: 'windows-1252' }
  }
}

function splitRows(text: string, delimiter: Delimiter): { rows: string[][]; lineNumbers: number[] } {
  const rows: string[][] = []
  const lineNumbers: number[] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let line = 1
  let rowStartLine = 1

  function endRow() {
    row.push(field)
    field = ''
    const blank = row.length === 1 && row[0]?.trim() === ''
    if (!blank) {
      rows.push(row)
      lineNumbers.push(rowStartLine)
    }
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i)
    if (inQuotes) {
      if (ch === '"') {
        if (text.charAt(i + 1) === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
        if (ch === '\n') line++
      }
    } else if (ch === '"' && field === '') {
      inQuotes = true
    } else if (ch === delimiter) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text.charAt(i + 1) === '\n') i++
      endRow()
      line++
      rowStartLine = line
    } else {
      field += ch
    }
  }
  if (field !== '' || row.length > 0) endRow()

  return { rows, lineNumbers }
}

const SAMPLE_LENGTH = 20000
const SAMPLE_ROWS = 20

// Choisit le séparateur qui donne le plus de colonnes avec un nombre de colonnes constant d'une ligne à l'autre.
export function detectDelimiter(text: string): Delimiter {
  const truncated = text.length > SAMPLE_LENGTH
  let best: Delimiter = ','
  let bestScore = 0

  for (const candidate of DELIMITERS) {
    let rows = splitRows(text.slice(0, SAMPLE_LENGTH), candidate).rows
    if (truncated) rows = rows.slice(0, -1)
    rows = rows.slice(0, SAMPLE_ROWS)
    if (rows.length === 0) continue

    const counts = new Map<number, number>()
    for (const row of rows) counts.set(row.length, (counts.get(row.length) ?? 0) + 1)
    let modeLength = 0
    let modeCount = 0
    for (const [length, count] of counts) {
      if (count > modeCount || (count === modeCount && length > modeLength)) {
        modeLength = length
        modeCount = count
      }
    }
    const score = modeLength > 1 ? modeLength * (modeCount / rows.length) : 0
    if (score > bestScore) {
      best = candidate
      bestScore = score
    }
  }
  return best
}

export function parseCsv(text: string, delimiter?: Delimiter): ParsedCsv {
  const clean = stripBom(text)
  const chosen = delimiter ?? detectDelimiter(clean)
  const { rows, lineNumbers } = splitRows(clean, chosen)
  return { delimiter: chosen, rows, lineNumbers }
}

export function escapeCsvCell(value: string, delimiter: Delimiter = ','): string {
  const needsQuotes =
    value.includes('"') || value.includes('\n') || value.includes('\r') || value.includes(delimiter)
  return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value
}

// Protection contre l'injection de formules dans un tableur : un texte qui commence par =, +, -, @,
// tabulation ou retour chariot est préfixé d'une apostrophe. À réserver aux colonnes de texte libre.
export function neutralizeFormula(text: string): string {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
}

export function toCsv(rows: string[][], delimiter: Delimiter = ','): string {
  return rows.map((row) => row.map((cell) => escapeCsvCell(cell, delimiter)).join(delimiter)).join('\r\n') + '\r\n'
}

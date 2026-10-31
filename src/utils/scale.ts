// Échelles et graduations d'un nuage de points : fonctions pures.

export interface Ticks {
  ticks: number[]
  // Borne supérieure de l'axe (la dernière graduation).
  upper: number
}

// Arrondit un pas brut à 1, 2, 5 ou 10 fois une puissance de dix.
export function niceStep(rawStep: number): number {
  const exponent = Math.floor(Math.log10(rawStep))
  const base = Math.pow(10, exponent)
  const fraction = rawStep / base
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return nice * base
}

// Graduations « agréables » de 0 jusqu'à une valeur au moins égale à maxValue.
export function niceTicks(maxValue: number, targetCount = 5): Ticks {
  const max = Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 1
  const step = niceStep(max / targetCount)
  const count = Math.ceil(max / step - 1e-9)
  const ticks = Array.from({ length: count + 1 }, (_, index) => Number((index * step).toPrecision(12)))
  return { ticks, upper: ticks[ticks.length - 1] ?? step }
}

// Axe de 0 à un peu plus que la plus grande valeur, pour que le point extrême ne touche pas le bord.
export function axisFor(values: number[], padding = 1.05): Ticks {
  const finite = values.filter((value) => Number.isFinite(value) && value > 0)
  const max = finite.length > 0 ? Math.max(...finite) : 0
  return niceTicks(max * padding)
}

// Transforme une valeur de données (0 → upper) en coordonnée d'écran (start → end).
export function linearScale(upper: number, start: number, end: number): (value: number) => number {
  return (value) => start + (value / upper) * (end - start)
}

import { describe, expect, it } from 'vitest'
import { axisFor, linearScale, niceStep, niceTicks } from './scale'

describe('niceStep', () => {
  it('arrondit à 1, 2, 5 ou 10 fois une puissance de dix', () => {
    expect(niceStep(84)).toBe(100)
    expect(niceStep(40)).toBe(50)
    expect(niceStep(15)).toBe(20)
    expect(niceStep(100)).toBe(100)
    expect(niceStep(0.03)).toBeCloseTo(0.05, 10)
  })
})

describe('niceTicks', () => {
  it('commence à 0, progresse à pas constant et couvre la valeur maximale', () => {
    const { ticks, upper } = niceTicks(420)
    expect(ticks).toEqual([0, 100, 200, 300, 400, 500])
    expect(upper).toBe(500)
  })

  it('ne dépasse pas inutilement quand la valeur tombe pile sur une graduation', () => {
    expect(niceTicks(400).upper).toBe(400)
  })

  it('gère les petites valeurs sans bruit de calcul flottant', () => {
    expect(niceTicks(1).ticks).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
  })

  it('retombe sur un axe 0–1 quand la valeur n’est pas exploitable', () => {
    for (const bad of [0, -5, Number.NaN, Infinity]) {
      expect(niceTicks(bad).upper).toBe(1)
    }
  })
})

describe('axisFor', () => {
  it('laisse une marge au-dessus du point le plus grand', () => {
    expect(axisFor([50, 150, 400]).upper).toBe(500)
    expect(axisFor([400]).upper).toBeGreaterThan(400)
  })

  it('ignore les valeurs non finies et accepte une liste vide', () => {
    expect(axisFor([Number.NaN, 10]).upper).toBeGreaterThanOrEqual(10)
    expect(axisFor([]).upper).toBe(1)
  })
})

describe('linearScale', () => {
  it('place 0 au début et la borne supérieure à la fin de la plage', () => {
    const x = linearScale(500, 64, 624)
    expect(x(0)).toBe(64)
    expect(x(500)).toBe(624)
    expect(x(250)).toBe(344)
  })

  it('accepte une plage inversée pour l’axe vertical', () => {
    const y = linearScale(100, 350, 16)
    expect(y(0)).toBe(350)
    expect(y(100)).toBe(16)
  })
})

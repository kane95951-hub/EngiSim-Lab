import { describe, expect, it } from 'vitest'
import { en } from '../i18n/en'
import { fr } from '../i18n/fr'
import { translate } from '../i18n/translate'
import { issueMessage } from './issues'

describe('issueMessage', () => {
  it('formule un message français avec le champ et la borne', () => {
    const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
      translate(fr, key, params)
    expect(issueMessage({ field: 'b', code: 'notAboveMin', bound: 0 }, t)).toBe(
      'b doit être strictement supérieur à 0.',
    )
    expect(issueMessage({ field: 'a', code: 'missing' }, t)).toBe('Valeur manquante : a.')
  })

  it('formule un message anglais avec le champ et la borne', () => {
    const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
      translate(en, key, params)
    expect(issueMessage({ field: 'b', code: 'belowMin', bound: 2 }, t)).toBe(
      'b must be greater than or equal to 2.',
    )
  })
})

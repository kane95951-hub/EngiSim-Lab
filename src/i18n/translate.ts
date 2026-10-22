import { en } from './en'
import { fr, type MessageKey } from './fr'

export type Language = 'fr' | 'en'

export const MESSAGES: Record<Language, Record<MessageKey, string>> = { fr, en }

// Fonction pure : remplace les variables {nom} ; une variable inconnue est laissée telle quelle.
export function translate(
  messages: Record<MessageKey, string>,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  const template = messages[key]
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match: string, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

// Langue initiale d'après la langue du navigateur : français si elle commence par « fr », sinon anglais.
export function detectLanguage(navigatorLanguage: string | undefined): Language {
  return navigatorLanguage?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

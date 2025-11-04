// ================================
// LANGUAGE UTILITY FUNCTIONS
// ================================

import { languages } from './constants'
import type { LanguageOption } from './types'

/**
 * Get language name by code
 */
export function getLanguageName(code: string): string {
  return languages[code] || code
}

/**
 * Get all available languages as array for select options
 */
export function getLanguageOptions(): LanguageOption[] {
  return Object.entries(languages).map(([code, name]) => ({
    value: code,
    label: name
  }))
}

/**
 * Get all available language codes
 */
export function getLanguageCodes(): string[] {
  return Object.keys(languages)
}

/**
 * Get all available language names
 */
export function getLanguageNames(): string[] {
  return Object.values(languages)
}

/**
 * Check if a language code is supported
 */
export function isLanguageSupported(code: string): boolean {
  return code in languages
}

/**
 * Get language map for backward compatibility (code -> name)
 */
export const languageMap = languages

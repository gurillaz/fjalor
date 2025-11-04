// ================================
// TRANSLATION HISTORY MANAGEMENT
// ================================

import { storageService } from './storageService'
import type { Translation, TranslationData, ServiceResult } from './types'

// Re-export types for component usage
export type { Translation, TranslationData } from './types'

export const historyService = {
  /**
   * Get all history translations from storage
   */
  getHistoryTranslations(): Translation[] {
    return storageService.load('historyTranslations', []) || []
  },

  /**
   * Get all saved translations from storage
   */
  getSavedTranslations(): Translation[] {
    return storageService.load('savedTranslations', []) || []
  },

  /**
   * Save history translations to storage
   */
  saveHistoryTranslations(translations: Translation[]): boolean {
    return storageService.save('historyTranslations', translations)
  },

  /**
   * Save saved translations to storage
   */
  saveSavedTranslations(translations: Translation[]): boolean {
    return storageService.save('savedTranslations', translations)
  },

  /**
   * Add a new translation to history storage
   */
  addTranslation(translationData: TranslationData): boolean {
    const historyTranslations = this.getHistoryTranslations()
    
    // Create unified Translation object
    const translation: Translation = {
      id: translationData.id || storageService.generateId(),
      sourceText: translationData.sourceText || translationData.source || '',
      translation1: translationData.translation1 || translationData.target1 || '',
      translation2: translationData.translation2 || translationData.target2 || '',
      timestamp: translationData.timestamp || new Date().toISOString(),
      sourceLanguage: translationData.sourceLanguage || '',
      targetLanguage1: translationData.targetLanguage1 || '',
      targetLanguage2: translationData.targetLanguage2 || '',
      aiModel: translationData.aiModel || '',
      context: translationData.context || '',
      type: translationData.type || 'user_input'
    }
    
    // Insert at the beginning to maintain newest-first order
    historyTranslations.unshift(translation)
    return this.saveHistoryTranslations(historyTranslations)
  },

  /**
   * Save a translation (copy from history to saved)
   */
  saveTranslationById(id: string): boolean {
    const historyTranslations = this.getHistoryTranslations()
    const savedTranslations = this.getSavedTranslations()
    
    // Find translation in history
    const translation = historyTranslations.find(t => t.id === id)
    
    if (translation) {
      // Check if already saved
      const alreadySaved = savedTranslations.some(t => t.id === id)
      if (!alreadySaved) {
        // Copy to saved translations at the beginning to maintain newest-first order
        savedTranslations.unshift({...translation})
        return this.saveSavedTranslations(savedTranslations)
      }
      return true
    }
    
    return false
  },

  /**
   * Unsave a translation (remove from saved array only)
   */
  unsaveTranslationById(id: string): boolean {
    const savedTranslations = this.getSavedTranslations()
    const filteredSavedTranslations = savedTranslations.filter(t => t.id !== id)
    return this.saveSavedTranslations(filteredSavedTranslations)
  },

  /**
   * Delete a translation from history (not from saved)
   */
  deleteTranslation(id: string): boolean {
    const historyTranslations = this.getHistoryTranslations()
    const filteredHistoryTranslations = historyTranslations.filter(t => t.id !== id)
    return this.saveHistoryTranslations(filteredHistoryTranslations)
  },

  /**
   * Clear all saved translations
   */
  clearSavedTranslations(): boolean {
    return this.saveSavedTranslations([])
  },

  /**
   * Check if a translation is saved
   */
  isTranslationSaved(id: string, translationData: TranslationData | null = null): boolean {
    if (id) {
      const savedTranslations = this.getSavedTranslations()
      return savedTranslations.some(t => t.id === id)
    }

    if (translationData) {
      const savedTranslations = this.getSavedTranslations()
      return savedTranslations.some(t =>
        t.sourceText === translationData.source &&
        t.translation1 === translationData.target1 &&
        t.translation2 === translationData.target2
      )
    }

    return false
  },

  /**
   * Save a translation (copy from history to saved) with result object
   */
  saveTranslation(translationData: TranslationData): ServiceResult<TranslationData> {
    try {
      const success = this.saveTranslationById(translationData.id!)
      return {
        success,
        data: success ? translationData : null,
        error: success ? null : 'Failed to save translation'
      }
    } catch (error) {
      console.error('Error saving translation:', error)
      return {
        success: false,
        data: null,
        error: (error as Error).message || 'Error saving translation'
      }
    }
  },

  /**
   * Get all translation data for History page (unified approach)
   */
  getAllTranslationData() {
    const allTranslations = this.getHistoryTranslations() || []
    const savedTranslations = this.getSavedTranslations() || []

    // Sort both arrays by timestamp in descending order (newest first)
    const sortedAllTranslations = [...allTranslations].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    const sortedSavedTranslations = [...savedTranslations].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return {
      allTranslations: sortedAllTranslations,
      savedTranslations: sortedSavedTranslations,
      totalCount: allTranslations.length
    }
  },

  /**
   * Get saved translations count
   */
  getSavedTranslationsCount(): number {
    return this.getSavedTranslations().length
  },

  /**
   * Clear all saved translations with confirmation
   */
  clearAllSavedTranslations(): ServiceResult {
    try {
      const success = this.clearSavedTranslations()
      return {
        success,
        error: success ? null : 'Failed to clear saved translations'
      }
    } catch (error) {
      console.error('Error clearing saved translations:', error)
      return {
        success: false,
        error: (error as Error).message || 'Error clearing saved translations'
      }
    }
  }
}

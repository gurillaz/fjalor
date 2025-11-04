// ================================
// APPLICATION DATA MANAGEMENT
// Settings, Theme, and Import/Export
// ================================

import { storageService } from './storageService'
import { historyService } from './historyService'
import { getAllContexts, isDefaultContext } from './contextService'
import type { Settings, ExportData, ServiceResult } from './types'
import { defaultSettings } from './constants'

// Re-export types for component usage
export type { Settings } from './types'

export const appDataService = {
  // ================================
  // SETTINGS MANAGEMENT
  // ================================

  /**
   * Get settings from storage with defaults
   */
  getSettings(): Settings {
    const savedSettings = storageService.load('translationSettings')
    return savedSettings ? { ...defaultSettings, ...savedSettings } : defaultSettings
  },

  /**
   * Update settings in storage
   */
  updateSettings(newSettings: Partial<Settings>): boolean {
    const currentSettings = this.getSettings()
    const updatedSettings = { ...currentSettings, ...newSettings }
    return storageService.save('translationSettings', updatedSettings)
  },

  // ================================
  // THEME MANAGEMENT
  // ================================

  /**
   * Get theme preference from storage
   */
  getTheme(): string {
    return storageService.load('theme', 'auto') || 'auto'
  },

  /**
   * Save theme preference to storage
   */
  setTheme(theme: string): boolean {
    return storageService.save('theme', theme)
  },

  /**
   * Update theme preference in settings
   */
  updateTheme(theme: string): boolean {
    const success = this.setTheme(theme)
    if (success) {
      // Also update in localStorage for vueuse-color-mode
      localStorage.setItem('vueuse-color-mode', theme)
    }
    return success
  },

  // ================================
  // SETUP COMPLETION MANAGEMENT
  // ================================

  /**
   * Check if setup has been completed
   */
  isSetupCompleted(): boolean {
    return storageService.load('setup_completed') === 'true'
  },

  /**
   * Mark setup as completed
   */
  markSetupCompleted(): boolean {
    return storageService.save('setup_completed', 'true')
  },

  /**
   * Reset setup completion status
   */
  resetSetup(): boolean {
    return storageService.remove('setup_completed')
  },

  // ================================
  // RESET FUNCTIONALITY
  // ================================

  /**
   * Reset application - clear all localStorage data
   */
  resetApp(): ServiceResult {
    try {
      // Clear all localStorage data
      const cleared = storageService.clear()
      
      if (cleared) {
        return {
          success: true,
          error: null
        }
      } else {
        return {
          success: false,
          error: 'Failed to clear application data'
        }
      }
    } catch (error) {
      console.error('Reset app error:', error)
      return {
        success: false,
        error: (error as Error).message || 'Failed to reset application'
      }
    }
  },

  // ================================
  // IMPORT/EXPORT FUNCTIONALITY
  // ================================

  /**
   * Export saved translations to CSV format
   */
  exportSavedTranslationsToCSV(): string {
    const savedTranslations = historyService.getSavedTranslations()
    if (savedTranslations.length === 0) {
      return ''
    }

    const headers = [
      'ID',
      'Timestamp',
      'Source Language',
      'Target Language 1',
      'Target Language 2',
      'AI Model',
      'Source Text',
      'Translation 1',
      'Translation 2',
      'Context',
      'Type'
    ]

    const csvRows = [
      headers.join(','),
      ...savedTranslations.map(translation => {
        return [
          translation.id,
          translation.timestamp,
          translation.sourceLanguage,
          translation.targetLanguage1,
          translation.targetLanguage2,
          translation.aiModel,
          `"${this.escapeCsvField(translation.sourceText)}"`,
          `"${this.escapeCsvField(translation.translation1)}"`,
          `"${this.escapeCsvField(translation.translation2)}"`,
          `"${this.escapeCsvField(translation.context || '')}"`,
          `"${this.escapeCsvField(translation.type)}"`
        ].join(',')
      })
    ]

    return csvRows.join('\n')
  },

  /**
   * Escape CSV field to handle commas and quotes
   */
  escapeCsvField(field: string): string {
    if (typeof field !== 'string') {
      return field || ''
    }
    return field.replace(/"/g, '""')
  },

  /**
   * Export saved translations with enhanced error handling
   */
  exportTranslations(): ServiceResult<string> {
    try {
      const csvContent = this.exportSavedTranslationsToCSV()

      if (csvContent) {
        return {
          success: true,
          data: csvContent,
          error: null
        }
      } else {
        return {
          success: false,
          data: null,
          error: 'No saved translations to export'
        }
      }
    } catch (error) {
      console.error('Export error:', error)
      return {
        success: false,
        data: null,
        error: (error as Error).message || 'Failed to export translations'
      }
    }
  },

  /**
   * Export settings and all contexts to JSON
   */
  exportSettings(): ServiceResult<string> {
    try {
      const settings = this.getSettings()
      const allContexts = getAllContexts()
      
      const exportData: ExportData = {
        settings: {
          motherlanguage: settings.motherlanguage,
          secondlanguage: settings.secondlanguage,
          learninglanguage: settings.learninglanguage,
          apiLink: settings.apiLink,
          apiKey: settings.apiKey,
          aiModel: settings.aiModel
        },
        contexts: allContexts
      }

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2),
        error: null
      }
    } catch (error) {
      console.error('Settings export error:', error)
      return {
        success: false,
        data: null,
        error: (error as Error).message || 'Failed to export settings'
      }
    }
  },

  /**
   * Export all data (settings, translations, contexts) to JSON
   */
  exportAllData(): ServiceResult<string> {
    try {
      const settings = this.getSettings()
      const allTranslations = historyService.getHistoryTranslations()
      const allContexts = getAllContexts()
      
      const exportData: ExportData = {
        settings: {
          motherlanguage: settings.motherlanguage,
          secondlanguage: settings.secondlanguage,
          learninglanguage: settings.learninglanguage,
          apiLink: settings.apiLink,
          apiKey: settings.apiKey,
          aiModel: settings.aiModel
        },
        translations: allTranslations,
        contexts: allContexts,
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0',
          counts: {
            translations: allTranslations.length,
            contexts: allContexts.length
          }
        }
      }

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2),
        error: null
      }
    } catch (error) {
      console.error('All data export error:', error)
      return {
        success: false,
        data: null,
        error: (error as Error).message || 'Failed to export all data'
      }
    }
  },

  /**
   * Import settings and contexts from JSON (overwrites settings only, preserves translations)
   */
  importSettings(jsonData: string): ServiceResult {
    try {
      const importData: ExportData = JSON.parse(jsonData)
      
      // Validate import data structure
      if (!importData.settings || !importData.contexts) {
        return {
          success: false,
          error: 'Invalid import file format. Missing settings or contexts.'
        }
      }

      // Validate settings structure with detailed error messages
      const requiredSettings = ['motherlanguage', 'secondlanguage', 'learninglanguage', 'apiLink', 'apiKey', 'aiModel']
      const missingSettings: string[] = []
      
      for (const setting of requiredSettings) {
        if (!(setting in importData.settings)) {
          missingSettings.push(setting)
        }
      }
      
      if (missingSettings.length > 0) {
        return {
          success: false,
          error: `Invalid settings format. Missing properties: ${missingSettings.join(', ')}`
        }
      }

      // Validate contexts structure
      if (!Array.isArray(importData.contexts)) {
        return {
          success: false,
          error: 'Invalid contexts format. Expected array.'
        }
      }

      // Import settings (overwrite existing)
      const settingsSuccess = storageService.save('translationSettings', importData.settings)
      
      // Import contexts (overwrite existing user contexts)
      const userContexts = importData.contexts.filter(ctx => !isDefaultContext(ctx.name))
      const contextsSuccess = storageService.save('userContexts', userContexts)

      if (settingsSuccess && contextsSuccess) {
        return {
          success: true,
          error: null
        }
      } else {
        return {
          success: false,
          error: 'Failed to save imported data'
        }
      }
    } catch (error) {
      console.error('Settings import error:', error)
      return {
        success: false,
        error: (error as Error).message || 'Failed to import settings'
      }
    }
  },

  /**
   * Import all data from JSON (complete overwrite)
   */
  importAllData(jsonData: string): ServiceResult {
    try {
      const importData: ExportData = JSON.parse(jsonData)
      
      // Validate import data structure
      if (!importData.settings || !importData.translations || !importData.contexts) {
        return {
          success: false,
          error: 'Invalid import file format. Missing required data sections.'
        }
      }

      // Validate settings structure with detailed error messages
      const requiredSettings = ['motherlanguage', 'secondlanguage', 'learninglanguage', 'apiLink', 'apiKey', 'aiModel']
      const missingSettings: string[] = []
      
      for (const setting of requiredSettings) {
        if (!(setting in importData.settings)) {
          missingSettings.push(setting)
        }
      }
      
      if (missingSettings.length > 0) {
        return {
          success: false,
          error: `Invalid settings format. Missing properties: ${missingSettings.join(', ')}`
        }
      }

      // Validate translations structure
      if (!Array.isArray(importData.translations)) {
        return {
          success: false,
          error: 'Invalid translations format. Expected array.'
        }
      }

      // Validate contexts structure
      if (!Array.isArray(importData.contexts)) {
        return {
          success: false,
          error: 'Invalid contexts format. Expected array.'
        }
      }

      // Import all data (complete overwrite)
      const settingsSuccess = storageService.save('translationSettings', importData.settings)
      const translationsSuccess = historyService.saveHistoryTranslations(importData.translations)
      const userContexts = importData.contexts.filter(ctx => !isDefaultContext(ctx.name))
      const contextsSuccess = storageService.save('userContexts', userContexts)

      if (settingsSuccess && translationsSuccess && contextsSuccess) {
        return {
          success: true,
          error: null
        }
      } else {
        return {
          success: false,
          error: 'Failed to save imported data'
        }
      }
    } catch (error) {
      console.error('All data import error:', error)
      return {
        success: false,
        error: (error as Error).message || 'Failed to import all data'
      }
    }
  }
}

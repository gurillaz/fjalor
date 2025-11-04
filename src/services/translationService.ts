// ================================
// TRANSLATION BUSINESS LOGIC SERVICE
// Handles translation workflow and business logic
// ================================

import { getLanguageName } from './languageService'
import { translationApiService } from './translationApiService'
import { getContextByName, getSelectedContext, getAllContexts } from './contextService'
import { historyService } from './historyService'
import { appDataService } from './appDataService'
import type { Settings, Translation, TranslationData, TranslationResult, TargetLanguages, ValidationResult } from './types'

export const translationService = {
  /**
   * Translate text using AI API with configurable target languages
   */
  async translateWithAI(
    text: string,
    sourceLanguage: string,
    targetLanguage1: string | null = null,
    targetLanguage2: string | null = null,
    settings: Settings
  ): Promise<TranslationResult> {
    if (!text || !text.trim()) {
      throw new Error('Text to translate cannot be empty')
    }

    try {
      const { context: selectedContext } = await this.setupTranslation(settings)

      let translation1 = ''
      let translation2 = ''

      // Translate to first target language if provided
      if (targetLanguage1) {
        translation1 = await translationApiService.translateSingleLanguage(
          text,
          sourceLanguage,
          targetLanguage1,
          selectedContext.prompt,
          settings
        )
      }

      // Translate to second target language if provided
      if (targetLanguage2) {
        translation2 = await translationApiService.translateSingleLanguage(
          text,
          sourceLanguage,
          targetLanguage2,
          selectedContext.prompt,
          settings
        )
      }

      return {
        source: text,
        target1: translation1,
        target2: translation2,
        timestamp: new Date().toISOString(),
        sourceLanguage: sourceLanguage,
        targetLanguage1: targetLanguage1 || '',
        targetLanguage2: targetLanguage2 || '',
        aiModel: settings.aiModel,
        context: selectedContext.name,
        contextPrompt: selectedContext.prompt
      }

    } catch (error) {
      console.error('Translation error:', error)
      throw error
    }
  },

  /**
   * Perform pre-translation setup (context, validation)
   * Consolidates common logic between translation methods
   */
  async setupTranslation(settings: Settings): Promise<{ context: any, isValid: boolean, errors: string[] }> {
    // Validate settings
    const validation = this.validateSettings(settings)
    if (!validation.isValid) {
      throw new Error('Settings validation failed: ' + validation.errors.join(', '))
    }

    // Get selected context
    const selectedContextName = getSelectedContext()
    const allContexts = getAllContexts()
    const selectedContext = getContextByName(selectedContextName, allContexts) ||
                         getContextByName('Expert', allContexts)

    if (!selectedContext) {
      throw new Error('No translation context available')
    }

    return { context: selectedContext, isValid: validation.isValid, errors: validation.errors }
  },

  /**
   * Validate translation settings
   */
  validateSettings(settings: Settings): ValidationResult {
    const errors: string[] = []

    if (!settings.apiKey || settings.apiKey.trim() === '') {
      errors.push('API key is required')
    }

    if (!settings.apiLink || settings.apiLink.trim() === '') {
      errors.push('API link is required')
    } else if (!this.isValidUrl(settings.apiLink)) {
      errors.push('API link must be a valid URL')
    }

    if (!settings.aiModel || settings.aiModel.trim() === '') {
      errors.push('AI model is required')
    }

    if (!settings.motherlanguage || settings.motherlanguage.trim() === '') {
      errors.push('Mother language is required')
    }

    if (!settings.secondlanguage || settings.secondlanguage.trim() === '') {
      errors.push('Second language is required')
    }

    if (!settings.learninglanguage || settings.learninglanguage.trim() === '') {
      errors.push('Learning language is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Check if a string is a valid URL
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * Detect source language using AI
   */
  async detectSourceLanguage(text: string, settings: Settings): Promise<string> {
    if (!text || !text.trim()) {
      throw new Error('Text to analyze cannot be empty')
    }

    const availableLanguages = [
      settings.motherlanguage,
      settings.secondlanguage,
      settings.learninglanguage
    ]

    const languageOptions = availableLanguages.map(code => getLanguageName(code)).join(', ')
    const languageCodes = availableLanguages.join(', ')

    return await translationApiService.detectLanguage(
      text,
      availableLanguages,
      languageOptions,
      languageCodes,
      settings
    )
  },

  /**
   * Determine target languages based on source language and selection
   */
  determineTargetLanguages(
    sourceLanguage: string, 
    targetSelection: string = 'both', 
    settings: Settings
  ): TargetLanguages {
    const allLanguages = [
      settings.motherlanguage,
      settings.secondlanguage,
      settings.learninglanguage
    ]

    const targets = allLanguages.filter(lang => lang !== sourceLanguage)
    
    if (targetSelection === 'both') {
      return {
        targetLanguage1: targets[0] || null,
        targetLanguage2: targets[1] || null
      }
    } else if (targetSelection === 'target1') {
      return {
        targetLanguage1: targets[0] || null,
        targetLanguage2: null
      }
    } else if (targetSelection === 'target2') {
      return {
        targetLanguage1: targets[1] || null,
        targetLanguage2: null
      }
    } else {
      // Default to both
      return {
        targetLanguage1: targets[0] || null,
        targetLanguage2: targets[1] || null
      }
    }
  },

  /**
   * Generate example translations based on original translation
   */
  async generateExampleTranslations(originalTranslation: Translation): Promise<Translation[]> {
    if (!originalTranslation) {
      throw new Error('Original translation is required')
    }

    const settings = appDataService.getSettings()
    
    // Validate settings
    const validation = this.validateSettings(settings)
    if (!validation.isValid) {
      throw new Error('Settings validation failed: ' + validation.errors.join(', '))
    }

    try {
      const examplesText = await translationApiService.generateExamples(
        originalTranslation.sourceText,
        originalTranslation.sourceLanguage,
        originalTranslation.targetLanguage1,
        originalTranslation.targetLanguage2,
        originalTranslation.context || '',
        settings
      )
      
      // Parse the response into individual examples
      const examples = this.parseExampleResponse(examplesText, originalTranslation)
      
      // Save examples to storage
      examples.forEach(example => {
        historyService.addTranslation(example)
      })

      return examples

    } catch (error: any) {
      console.error('Example generation error:', error)
      throw error
    }
  },

  /**
   * Parse example generation response into translation objects
   */
  parseExampleResponse(responseText: string, originalTranslation: Translation): Translation[] {
    const examples: Translation[] = []
    const lines = responseText.split('\n').filter(line => line.trim())
    
    lines.forEach((line, index) => {
      // Try dual language format first: "Example 1: [source] | [translation1] | [translation2]"
      const dualMatch = line.match(/^Example\s*\d+:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/)
      
      if (dualMatch) {
        const [, sourceText, translation1, translation2] = dualMatch
        
        examples.push({
          id: `example-${Date.now()}-${index}`,
          sourceText: sourceText?.trim() || '',
          translation1: translation1?.trim() || '',
          translation2: translation2?.trim() || '',
          timestamp: new Date().toISOString(),
          sourceLanguage: originalTranslation.sourceLanguage,
          targetLanguage1: originalTranslation.targetLanguage1,
          targetLanguage2: originalTranslation.targetLanguage2,
          aiModel: originalTranslation.aiModel,
          context: originalTranslation.context,
          type: 'ai_generated'
        })
      } else {
        // Try single language format: "Example 1: [source] | [translation]"
        const singleMatch = line.match(/^Example\s*\d+:\s*(.+?)\s*\|\s*(.+)$/)
        
        if (singleMatch) {
          const [, sourceText, translation1] = singleMatch
          
          examples.push({
            id: `example-${Date.now()}-${index}`,
            sourceText: sourceText?.trim() || '',
            translation1: translation1?.trim() || '',
            translation2: '', // Empty for single language
            timestamp: new Date().toISOString(),
            sourceLanguage: originalTranslation.sourceLanguage,
            targetLanguage1: originalTranslation.targetLanguage1,
            targetLanguage2: '', // Empty for single language
            aiModel: originalTranslation.aiModel,
            context: originalTranslation.context,
            type: 'ai_generated'
          })
        }
      }
    })
    
    return examples
  },

  /**
   * Validate API configuration by making a test request
   */
  async validateApiConfiguration(settings: Settings): Promise<{ valid: boolean; error?: string }> {
    return await translationApiService.validateApiConfiguration(settings)
  },

  /**
   * Perform complete translation workflow (main translation only)
   */
  async performTranslation(
    text: string,
    sourceSelection: string = 'autodetect',
    targetSelection: string = 'both'
  ): Promise<{ result: TranslationResult; translationData: TranslationData }> {
    if (!text || !text.trim()) {
      throw new Error('Text to translate cannot be empty')
    }

    // Load current settings
    const settings = appDataService.getSettings()

    // Determine source language
    let sourceLanguage
    if (sourceSelection === 'autodetect') {
      sourceLanguage = await this.detectSourceLanguage(text, settings)
    } else {
      sourceLanguage = sourceSelection
    }

    // Determine target languages based on selection
    const { targetLanguage1, targetLanguage2 } = this.determineTargetLanguages(sourceLanguage, targetSelection, settings)

    // Perform translation with correct languages
    const result = await this.translateWithAI(text, sourceLanguage, targetLanguage1, targetLanguage2, settings)

    // Create translation object for storage
    const translationObject: TranslationData = {
      id: `translation-${Date.now()}`,
      sourceText: result.source,
      translation1: result.target1,
      translation2: result.target2,
      timestamp: result.timestamp,
      sourceLanguage: result.sourceLanguage,
      targetLanguage1: result.targetLanguage1,
      targetLanguage2: result.targetLanguage2,
      aiModel: result.aiModel,
      context: result.context,
      type: 'user_input'
    }

    // Save translation to storage
    historyService.addTranslation(translationObject)

    return { result, translationData: translationObject }
  },

  /**
   * Generate example translations for a given translation (called from Results page)
   */
  async generateExamplesForTranslation(translationData: TranslationData): Promise<Translation[]> {
    if (!translationData) {
      throw new Error('Translation data is required')
    }

    try {
      const examples = await this.generateExampleTranslations(translationData as Translation)
      return examples
    } catch (error: any) {
      console.error('Example generation error:', error)
      throw error
    }
  }
}

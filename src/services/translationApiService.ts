// ================================
// PURE TRANSLATION API SERVICE
// Handles only API calls to translation services
// ================================

import axios from 'axios'
import { 
  translationPrompt, 
  languageDetectionPrompt, 
  singleLanguageExamplePrompt, 
  exampleTranslationPrompt 
} from './constants'
import type { Settings } from './types'

export interface ApiValidationResult {
  valid: boolean
  error?: string
}

// ================================
// PROMPT UTILITY FUNCTIONS
// ================================

/**
 * Replace template variables in prompt strings
 */
function replacePromptVariables(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return result
}

export const translationApiService = {
  /**
   * Make a single language translation API call
   */
  async translateSingleLanguage(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    contextPrompt: string,
    settings: Settings
  ): Promise<string> {
    if (!text || !text.trim()) {
      throw new Error('Text to translate cannot be empty')
    }

    if (!settings.apiKey) {
      throw new Error('API key is required. Please configure it in settings.')
    }

    if (!settings.apiLink) {
      throw new Error('API link is required. Please configure it in settings.')
    }

    if (!settings.aiModel) {
      throw new Error('AI model is required. Please configure it in settings.')
    }

    try {
      const prompt = this.buildTranslationPrompt(
        sourceLanguage,
        targetLanguage,
        text,
        contextPrompt
      )

      const response = await axios.post(
        settings.apiLink,
        {
          model: settings.aiModel,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Fjalor Translator'
          }
        }
      )

      const translation = response.data.choices[0].message.content.trim()
      
      if (!translation) {
        throw new Error('Empty translation response')
      }

      return translation

    } catch (error: any) {
      console.error('Single language translation error:', error)
      
      // Re-throw with more descriptive message
      if (error.response) {
        // API responded with error status
        const status = error.response.status
        const message = error.response.data?.error?.message || error.response.data?.message || 'Unknown API error'
        throw new Error(`API Error (${status}): ${message}`)
      } else if (error.request) {
        // Network error
        throw new Error('Network error: Could not reach the translation API')
      } else {
        // Other error
        throw error
      }
    }
  },

  /**
   * Detect source language using AI
   */
  async detectLanguage(
    text: string,
    availableLanguages: string[],
    languageOptions: string,
    languageCodes: string,
    settings: Settings
  ): Promise<string> {
    if (!text || !text.trim()) {
      throw new Error('Text to analyze cannot be empty')
    }

    const prompt = this.buildLanguageDetectionPrompt(languageOptions, languageCodes, text)

    try {
      const response = await axios.post(
        settings.apiLink,
        {
          model: settings.aiModel,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Fjalor Language Detection'
          }
        }
      )

      const detectedLanguage = response.data.choices[0].message.content.trim().toLowerCase()
      
      // Validate that the detected language is one of the available languages
      if (availableLanguages.includes(detectedLanguage)) {
        return detectedLanguage
      } else {
        // Fallback to first available language if detection fails
        console.warn(`Detected language "${detectedLanguage}" not in available languages, falling back to default`)
        return availableLanguages[0] || ''
      }

    } catch (error) {
      console.error('Language detection error:', error)
      // Fallback to first available language if detection fails
      return availableLanguages[0] || ''
    }
  },

  /**
   * Generate example translations using AI
   */
  async generateExamples(
    originalText: string,
    sourceLanguage: string,
    targetLanguage1: string,
    targetLanguage2: string | null,
    context: string,
    settings: Settings
  ): Promise<string> {
    if (!originalText) {
      throw new Error('Original text is required')
    }

    if (!settings.apiKey || !settings.apiLink || !settings.aiModel) {
      throw new Error('API configuration is incomplete')
    }

    try {
      let prompt
      
      if (targetLanguage2 && targetLanguage2 !== '') {
        // Dual language example generation
        prompt = this.buildDualLanguageExamplePrompt(
          originalText,
          sourceLanguage,
          targetLanguage1,
          targetLanguage2,
          context
        )
      } else if (targetLanguage1 && targetLanguage1 !== '') {
        // Single language example generation
        prompt = this.buildSingleLanguageExamplePrompt(
          originalText,
          sourceLanguage,
          targetLanguage1,
          context
        )
      } else {
        throw new Error('No target languages available for example generation')
      }

      const response = await axios.post(
        settings.apiLink,
        {
          model: settings.aiModel,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Fjalor Example Generator'
          }
        }
      )

      const examplesText = response.data.choices[0].message.content.trim()
      
      if (!examplesText) {
        throw new Error('Empty example generation response')
      }

      return examplesText

    } catch (error: any) {
      console.error('Example generation error:', error)
      
      // Re-throw with more descriptive message
      if (error.response) {
        const status = error.response.status
        const message = error.response.data?.error?.message || error.response.data?.message || 'Unknown API error'
        throw new Error(`API Error (${status}): ${message}`)
      } else if (error.request) {
        throw new Error('Network error: Could not reach the example generation API')
      } else {
        throw error
      }
    }
  },

  /**
   * Validate API configuration by making a test request
   */
  async validateApiConfiguration(settings: Settings): Promise<ApiValidationResult> {
    try {
      // Make a simple test request to validate the API configuration
      const response = await axios.post(
        settings.apiLink,
        {
          model: settings.aiModel,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ],
          temperature: 0.1,
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Fjalor API Test'
          }
        }
      )

      // If we get a successful response, the configuration is valid
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return { valid: true }
      } else {
        return { valid: false, error: 'Invalid API response format' }
      }

    } catch (error: any) {
      console.error('API validation error:', error)
      
      if (error.response) {
        // API responded with error status
        const status = error.response.status
        const message = error.response.data?.error?.message || error.response.data?.message || 'Unknown API error'
        return { valid: false, error: `API Error (${status}): ${message}` }
      } else if (error.request) {
        // Network error
        return { valid: false, error: 'Network error: Could not reach the API' }
      } else {
        // Other error
        return { valid: false, error: error.message || 'Unknown error occurred' }
      }
    }
  },

  // ================================
  // PROMPT BUILDING METHODS
  // ================================

  /**
   * Build translation prompt using centralized template
   */
  buildTranslationPrompt(
    sourceLanguage: string,
    targetLanguage: string,
    text: string,
    contextPrompt: string
  ): string {
    const basePrompt = replacePromptVariables(translationPrompt, {
      sourceLanguage,
      targetLanguage,
      text
    })
    
    return contextPrompt ? `${contextPrompt}\n\n${basePrompt}` : basePrompt
  },

  /**
   * Build language detection prompt using centralized template
   */
  buildLanguageDetectionPrompt(
    languageOptions: string,
    languageCodes: string,
    text: string
  ): string {
    return replacePromptVariables(languageDetectionPrompt, {
      languageOptions,
      languageCodes,
      text
    })
  },

  /**
   * Build single-language example prompt using centralized template
   */
  buildSingleLanguageExamplePrompt(
    originalText: string,
    sourceLanguage: string,
    targetLanguage: string,
    context: string
  ): string {
    return replacePromptVariables(singleLanguageExamplePrompt, {
      originalText,
      sourceLanguage,
      targetLanguage,
      context
    })
  },

  /**
   * Build dual-language example prompt using centralized template
   */
  buildDualLanguageExamplePrompt(
    originalText: string,
    sourceLanguage: string,
    targetLanguage1: string,
    targetLanguage2: string,
    context: string
  ): string {
    return replacePromptVariables(exampleTranslationPrompt, {
      originalText,
      sourceLanguage,
      targetLanguage1,
      targetLanguage2,
      context
    })
  }
}

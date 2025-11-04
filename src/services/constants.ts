// ================================
// STATIC CONSTANTS AND CONFIGURATION
// ================================

// ================================
// LANGUAGE CONFIGURATION
// ================================

export const languages: Record<string, string> = {
  'en': 'English',
  'sq': 'Albanian',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ar': 'Arabic',
  'tr': 'Turkish',
  'nl': 'Dutch',
  'pl': 'Polish'
}

// ================================
// PROMPT TEMPLATES
// ================================

// AI Translation Prompt Template - Single Language
export const translationPrompt = `Translate the following text from {sourceLanguage} to {targetLanguage}.
Provide only the translation, no additional text or explanations.

Text to translate: "{text}"`

// Language Detection Prompt Template
export const languageDetectionPrompt = `Detect which language this text is written from these options: {languageOptions}.
Respond with only the language code: {languageCodes}.

Text to translate: "{text}"`

// Example Translation Prompt Template - Single Language
export const singleLanguageExamplePrompt = `Based on the original text and the context provided, create 3 example sentences that are similar in context, theme, or structure.

Original text: "{originalText}"
Source language: "{sourceLanguage}"
Target language: "{targetLanguage}"
Context: "{context}"

Generate 3 realistic examples in the source language, then translate each to the target language. Make them practical.

Return the response in this format:
Example 1: [source sentence] | [translation]
Example 2: [source sentence] | [translation]
Example 3: [source sentence] | [translation]`

// Example Translation Prompt Template - Dual Language
export const exampleTranslationPrompt = `Based on the original text and the context provided, create 3 example sentences that are similar first in user inputed text(originalText) then in context, theme, or structure.

Original text: "{originalText}"
Source language: "{sourceLanguage}"
Target languages: "{targetLanguage1}, {targetLanguage2}"
Context: "{context}"

Generate 3 realistic examples in the source language, then translate each to both target languages. Make them practical.

Return the response in this format:
Example 1: [source sentence] | [translation1] | [translation2]
Example 2: [source sentence] | [translation1] | [translation2]
Example 3: [source sentence] | [translation1] | [translation2]`

// ================================
// DEFAULT CONTEXTS
// ================================

export const defaultContexts = [
  {
    name: 'Expert',
    prompt: 'Translate the following text professionally and accurately, maintaining proper grammar, terminology, and formal tone suitable for professional contexts.'
  }
]

// ================================
// DEFAULT SETTINGS
// ================================

export const defaultSettings = {
  motherlanguage: 'en',
  secondlanguage: 'sq',
  learninglanguage: 'es',
  apiLink: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: '',
  aiModel: 'openai/gpt-3.5-turbo',
  selectedContext: 'Expert'
}

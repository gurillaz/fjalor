// ================================
// SHARED TYPE DEFINITIONS
// ================================

// Translation Types
export interface Translation {
  id: string
  sourceText: string
  translation1: string
  translation2: string
  timestamp: string
  sourceLanguage: string
  targetLanguage1: string
  targetLanguage2: string
  aiModel: string
  context: string
  type: 'user_input' | 'ai_generated'
  saved?: boolean // Optional for saved translations
}

export interface TranslationData {
  id?: string
  source?: string // Legacy compatibility
  target1?: string // Legacy compatibility
  target2?: string // Legacy compatibility
  sourceText: string
  translation1: string
  translation2: string
  timestamp: string
  sourceLanguage: string
  targetLanguage1: string
  targetLanguage2: string
  aiModel: string
  context: string
  type: 'user_input' | 'ai_generated'
  saved?: boolean // For updates
}

export interface TranslationResult {
  source: string
  target1: string
  target2: string
  timestamp: string
  sourceLanguage: string
  targetLanguage1: string
  targetLanguage2: string
  aiModel: string
  context: string
  contextPrompt: string
}

export interface TargetLanguages {
  targetLanguage1: string | null
  targetLanguage2: string | null
}

// Settings Types
export interface Settings {
  motherlanguage: string
  secondlanguage: string
  learninglanguage: string
  apiLink: string
  apiKey: string
  aiModel: string
  selectedContext: string
}

// Context Types
export interface ContextOption {
  name: string
  prompt: string
}

export interface ContextData {
  name: string
  prompt: string
}

// Routine Types
export interface RoutineStep {
  id: string
  title: string
  order: number
}

export interface Routine {
  id: string
  name: string
  description?: string
  tags: string[]
  steps: RoutineStep[]
  createdAt: string
  updatedAt: string
}

export interface RoutineData {
  name: string
  description?: string
  tagsString?: string
  tags: string[]
  steps: Array<{
    id?: string
    title: string
    order?: number
  }>
}

// Import/Export Types
export interface ExportData {
  settings: {
    motherlanguage: string
    secondlanguage: string
    learninglanguage: string
    apiLink: string
    apiKey: string
    aiModel: string
  }
  contexts: any[]
  translations?: Translation[]
  metadata?: {
    exportDate: string
    version: string
    counts: {
      translations: number
      contexts: number
    }
  }
}

// Common Service Types
export interface ServiceResult<T = any> {
  success: boolean
  data?: T | null
  error?: string | null
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Language Types
export interface LanguageOption {
  value: string
  label: string
}

// ================================
// CONTEXT MANAGEMENT SERVICE
// ================================

import { storageService } from './storageService'
import { defaultContexts } from './constants'
import type { ContextOption, ValidationResult, ContextData, ServiceResult } from './types'

/**
 * Get default contexts (returns a copy to prevent mutation)
 */
export function getDefaultContexts(): ContextOption[] {
  return [...defaultContexts]
}

/**
 * Find context by name from default and user contexts
 */
export function getContextByName(contextName: string, userContexts: ContextOption[] = []): ContextOption | undefined {
  const allContexts = [...defaultContexts, ...userContexts]
  return allContexts.find(ctx => ctx.name === contextName)
}

/**
 * Validate a context object for correctness
 */
export function validateContext(context: ContextOption, existingContexts: ContextOption[] = []): ValidationResult {
  const errors: string[] = []
  
  if (!context.name || context.name.trim() === '') {
    errors.push('Context name is required')
  }
  
  if (!context.prompt || context.prompt.trim() === '') {
    errors.push('Context prompt is required')
  }
  
  if (context.name && context.name.length > 50) {
    errors.push('Context name must be 50 characters or less')
  }
  
  if (context.prompt && context.prompt.length > 500) {
    errors.push('Context prompt must be 500 characters or less')
  }
  
  // Check for duplicate names (case-insensitive)
  if (context.name && existingContexts.some(ctx => ctx.name.toLowerCase() === context.name.toLowerCase())) {
    errors.push('A context with this name already exists')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Check if a context is a default context
 */
export function isDefaultContext(contextName: string): boolean {
  const defaultContexts = getDefaultContexts()
  return defaultContexts.some(ctx => ctx.name === contextName)
}

/**
 * Check if a context can be deleted
 */
export function isDeletableContext(contextName: string): boolean {
  return contextName !== 'Expert'
}

/**
 * Add a new user context
 */
export function addContext(contextData: ContextData): ServiceResult<ContextOption> {
  try {
    // Get existing user contexts for validation
    const userContexts: ContextOption[] = storageService.load('userContexts', []) || []
    const allContexts = [...getDefaultContexts(), ...userContexts]
    
    // Validate context - convert ContextData to ContextOption for validation
    const contextOption: ContextOption = {
      name: contextData.name.trim(),
      prompt: contextData.prompt.trim()
    }
    const validation = validateContext(contextOption, allContexts)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      }
    }

    // Generate simplified context object
    const context: ContextOption = {
      name: contextData.name.trim(),
      prompt: contextData.prompt.trim()
    }

    // Add new context
    userContexts.push(context)
    const success = storageService.save('userContexts', userContexts)

    return {
      success,
      data: success ? context : undefined,
      error: success ? undefined : 'Failed to save context'
    }
  } catch (error) {
    console.error('Error adding context:', error)
    return {
      success: false,
      error: (error as Error).message || 'Failed to add context'
    }
  }
}

/**
 * Delete a user context
 */
export function deleteContext(contextName: string): ServiceResult {
  try {
    // Check if it's a default context
    if (!isDeletableContext(contextName)) {
      return {
        success: false,
        error: 'Cannot delete default context'
      }
    }

    // Get user contexts
    const userContexts: ContextOption[] = storageService.load('userContexts', []) || []
    const filteredContexts = userContexts.filter(ctx => ctx.name !== contextName)
    
    if (filteredContexts.length === userContexts.length) {
      return {
        success: false,
        error: 'Context not found'
      }
    }

    // Save updated contexts
    const success = storageService.save('userContexts', filteredContexts)

    // If deleted context was selected, reset to Expert
    if (getSelectedContext() === contextName) {
      setSelectedContext('Expert')
    }

    return {
      success,
      error: success ? null : 'Failed to delete context'
    }
  } catch (error) {
    console.error('Error deleting context:', error)
    return {
      success: false,
      error: (error as Error).message || 'Failed to delete context'
    }
  }
}

/**
 * Get all contexts (default + user-defined) as array
 */
export function getAllContexts(): ContextOption[] {
  const defaultContexts = getDefaultContexts()
  const userContexts = storageService.load('userContexts', []) || []
  
  // defaultContexts is already an array, so just combine them
  return [...defaultContexts, ...userContexts]
}

/**
 * Get selected context from settings
 */
export function getSelectedContext(): string {
  const settings = storageService.load('translationSettings')
  return settings?.selectedContext || 'Expert'
}

/**
 * Set selected context in settings
 */
export function setSelectedContext(contextName: string): boolean {
  const currentSettings = storageService.load('translationSettings') || {}
  const updatedSettings = { ...currentSettings, selectedContext: contextName }
  return storageService.save('translationSettings', updatedSettings)
}

// ================================
// PURE LOCALSTORAGE OPERATIONS
// ================================

/**
 * Pure localStorage service - only handles basic storage operations
 * No business logic, just simple get/set/remove operations
 */

export const storageService = {
  /**
   * Save data to localStorage
   */
  save(key: string, data: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error)
      return false
    }
  },

  /**
   * Load data from localStorage
   */
  load<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error)
      return defaultValue
    }
  },

  /**
   * Remove data from localStorage
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
      return false
    }
  },

  /**
   * Check if a key exists in localStorage
   */
  exists(key: string): boolean {
    return localStorage.getItem(key) !== null
  },

  /**
   * Clear all localStorage data
   */
  clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  },

  /**
   * Generate unique ID for entities
   */
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

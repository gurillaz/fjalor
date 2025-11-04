// ================================
// ROUTINES MANAGEMENT SERVICE
// ================================

import { storageService } from './storageService'
import type { Routine, RoutineData, ServiceResult } from './types'

// Re-export types for component usage
export type { Routine, RoutineData } from './types'

// Helper functions for consolidation
const validateRoutineData = (data: RoutineData): string | null => {
  if (!data.name?.trim()) return 'Routine name is required'
  if (!data.tags?.length) return 'At least one tag is required'
  return null
}

const cleanAndTransformSteps = (steps: RoutineData['steps']): Routine['steps'] => {
  return steps
    .map((step, index) => ({
      id: step.id || storageService.generateId(),
      title: step.title.trim(),
      order: step.order || (index + 1)
    }))
    .filter(step => step.title.length > 0)
}

const createRoutineFromData = (data: RoutineData, existingRoutine?: Routine): Routine => ({
  id: existingRoutine?.id || storageService.generateId(),
  name: data.name.trim(),
  description: data.description?.trim() || '',
  tags: data.tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
  steps: cleanAndTransformSteps(data.steps),
  createdAt: existingRoutine?.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

const handleServiceOperation = <T>(
  operation: () => T,
  errorMessage: string
): { success: boolean; data?: T; error?: string } => {
  try {
    const result = operation()
    return { success: true, data: result }
  } catch (error) {
    console.error(errorMessage, error)
    return { 
      success: false, 
      error: (error as Error).message || errorMessage 
    }
  }
}

const validateImportData = (data: any): Routine[] => {
  const routinesToImport = data.routines && Array.isArray(data.routines) 
    ? data.routines 
    : Array.isArray(data) ? data : []

  return routinesToImport
    .map((routine: any) => ({
      id: routine.id || storageService.generateId(),
      name: routine.name?.trim() || '',
      description: routine.description?.trim() || '',
      tags: Array.isArray(routine.tags) 
        ? routine.tags.map((tag: any) => tag.trim()).filter((tag: string) => tag.length > 0) 
        : [],
      steps: Array.isArray(routine.steps) 
        ? routine.steps.map((step: any, index: number) => ({
            id: step.id || storageService.generateId(),
            title: step.title?.trim() || '',
            order: step.order || (index + 1)
          })).filter((step: Routine['steps'][0]) => step.title.length > 0)
        : [],
      createdAt: routine.createdAt || new Date().toISOString(),
      updatedAt: routine.updatedAt || new Date().toISOString()
    }))
    .filter((routine: Routine) => routine.name.length > 0 && routine.tags.length > 0)
}

export const routinesService = {
  /**
   * Get all routines from storage
   */
  getRoutines(): Routine[] {
    return storageService.load('routines', []) || []
  },

  /**
   * Save routines to storage
   */
  saveRoutines(routines: Routine[]): boolean {
    return storageService.save('routines', routines)
  },

  /**
   * Create a new routine
   */
  createRoutine(routineData: RoutineData): ServiceResult<Routine> {
    const validationError = validateRoutineData(routineData)
    if (validationError) {
      return { success: false, error: validationError }
    }

    return handleServiceOperation(() => {
      const routines = this.getRoutines()
      const routine = createRoutineFromData(routineData)
      routines.unshift(routine)
      this.saveRoutines(routines)
      return routine
    }, 'Failed to create routine')
  },

  /**
   * Update an existing routine
   */
  updateRoutine(id: string, routineData: RoutineData): ServiceResult<Routine> {
    const validationError = validateRoutineData(routineData)
    if (validationError) {
      return { success: false, error: validationError }
    }

    return handleServiceOperation(() => {
      const routines = this.getRoutines()
      const index = routines.findIndex(r => r.id === id)
      
      if (index === -1) {
        throw new Error('Routine not found')
      }

      const existingRoutine = routines[index]!
      const updatedRoutine = createRoutineFromData(routineData, existingRoutine)
      routines[index] = updatedRoutine
      this.saveRoutines(routines)
      return updatedRoutine
    }, 'Failed to update routine')
  },

  /**
   * Delete a routine by ID
   */
  deleteRoutine(id: string): ServiceResult<boolean> {
    return handleServiceOperation(() => {
      const routines = this.getRoutines()
      const filteredRoutines = routines.filter(r => r.id !== id)
      
      if (filteredRoutines.length === routines.length) {
        throw new Error('Routine not found')
      }
      
      this.saveRoutines(filteredRoutines)
      return true
    }, 'Failed to delete routine')
  },

  /**
   * Get a single routine by ID
   */
  getRoutineById(id: string): Routine | null {
    return this.getRoutines().find(r => r.id === id) || null
  },

  /**
   * Get all unique tags from routines
   */
  getRoutineTags(): string[] {
    const allTags = new Set<string>()
    this.getRoutines().forEach(routine => {
      routine.tags.forEach(tag => {
        const trimmedTag = tag.trim()
        if (trimmedTag) allTags.add(trimmedTag)
      })
    })
    return Array.from(allTags).sort()
  },

  /**
   * Search routines by query and tag filter
   */
  searchRoutines(query: string = '', selectedTag: string = ''): Routine[] {
    let routines = this.getRoutines()

    if (selectedTag) {
      routines = routines.filter(routine => routine.tags.includes(selectedTag))
    }

    if (query) {
      const lowerQuery = query.toLowerCase()
      routines = routines.filter(routine =>
        routine.name.toLowerCase().includes(lowerQuery) ||
        routine.description?.toLowerCase().includes(lowerQuery) ||
        routine.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    }

    return routines
  },

  /**
   * Export routines to JSON
   */
  exportRoutines(): ServiceResult<string> {
    return handleServiceOperation(() => {
      const routines = this.getRoutines()
      
      if (routines.length === 0) {
        throw new Error('No routines to export')
      }

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        routines
      }

      return JSON.stringify(exportData, null, 2)
    }, 'Failed to export routines')
  },

  /**
   * Import routines from JSON
   */
  importRoutines(jsonData: string): ServiceResult<{ imported: number }> {
    return handleServiceOperation(() => {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      const validRoutines = validateImportData(parsed)
      
      if (validRoutines.length === 0) {
        throw new Error('No valid routines found in import data')
      }

      this.saveRoutines(validRoutines)
      return { imported: validRoutines.length }
    }, 'Failed to import routines')
  }
}

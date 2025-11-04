<template>
  <div class="page-layout">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-6 mt-2">
        <h1 class="text-xl font-bold">
          {{ isEditing ? 'Edit Routine' : 'New Routine' }}
        </h1>
        <Button variant="outline" @click="cancel" title="Back">
          <ArrowLeft class="h-4 w-4" />
        </Button>
      </div>

      <!-- Form Card -->
      <Card>
        <CardContent>
          <form @submit.prevent="saveRoutine" class="space-y-2">
            <!-- Routine Name -->
            <div class="space-y-2">
              <Label for="name">Routine Name *</Label>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  v-model="formData.name"
                  placeholder="e.g., Steps to register a car"
                  required
                  autofocus
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    v-if="formData.name"
                    variant="ghost"
                    size="icon-sm"
                    @click="formData.name = ''"
                    title="Clear routine name"
                  >
                    <XIcon class="size-4" />
                    <span class="sr-only">Clear routine name</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <InputGroup>
                <InputGroupTextarea
                  id="description"
                  v-model="formData.description"
                  placeholder="Brief description of the routine"
                  :rows="3"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    v-if="formData.description"
                    variant="ghost"
                    size="icon-sm"
                    @click="formData.description = ''"
                    title="Clear description"
                  >
                    <XIcon class="size-4" />
                    <span class="sr-only">Clear description</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <!-- Tags -->
            <div class="space-y-2">
              <Label for="tags">Tags (comma separated) *</Label>
              <InputGroup>
                <InputGroupInput
                  id="tags"
                  v-model="formData.tagsString"
                  placeholder="e.g., car, registration, official"
                  required
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    v-if="formData.tagsString"
                    variant="ghost"
                    size="icon-sm"
                    @click="formData.tagsString = ''"
                    title="Clear tags"
                  >
                    <XIcon class="size-4" />
                    <span class="sr-only">Clear tags</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <p class="text-xs text-muted-foreground">
                Separate tags with commas. These help organize and search your routines. At least one tag is required.
              </p>
            </div>

            <!-- Steps Section -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <Label>Steps ({{ formData.steps.length }})</Label>
                <div class="flex items-center gap-2">
                  <!-- Reorder Toggle Button (only for individual mode) -->
                  <Button
                    v-if="inputMode === 'individual'"
                    type="button"
                    :variant="isReorderMode ? 'default' : 'outline'"
                    @click="toggleReorderMode"
                    :title="isReorderMode ? 'Exit reorder mode' : 'Enter reorder mode'"
                    size="sm"
                  >
                    <ArrowUpDown class="h-4 w-4" />
                  </Button>
                  
                  <!-- Add Step Button (only for individual mode) -->
                  <Button
                    v-if="inputMode === 'individual'"
                    type="button"
                    @click="addStep"
                    variant="outline"
                    size="sm"
                  >
                    <Plus class="h-4 w-4" />
                  </Button>
                  
                  <!-- Input Mode Toggle Button -->
                  <Button
                    type="button"
                    :variant="inputMode === 'textarea' ? 'default' : 'outline'"
                    @click="toggleInputMode"
                    size="sm"
                  >
                    <FileText v-if="inputMode === 'individual'" class="h-4 w-4" />
                    <List v-else class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <!-- Individual Steps Mode -->
              <div v-if="inputMode === 'individual'" class="space-y-2">
                <div 
                  v-for="(step, index) in formData.steps"
                  :key="step.id || index"
                  :class="[
                    'group flex items-center gap-2 p-3 rounded-lg transition-all duration-200',
                    isReorderMode 
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-muted/50 hover:bg-muted'
                  ]"
                >
                  <!-- Step Input -->
                  <div class="flex-1 min-w-0">
                    <InputGroup>
                      <InputGroupInput
                        v-model="step.title"
                        :placeholder="`Step ${index + 1}`"
                        class="w-full text-sm"
                        :readonly="isReorderMode"
                        :class="[
                          'transition-all duration-200',
                          isReorderMode 
                            ? 'bg-primary/5 border-primary/30'
                            : ''
                        ]"
                      />
                      <InputGroupAddon v-if="!isReorderMode && step.title" align="inline-end">
                        <InputGroupButton
                          variant="ghost"
                          size="icon-sm"
                          @click="step.title = ''"
                          :title="`Clear step ${index + 1}`"
                        >
                          <XIcon class="size-4" />
                          <span class="sr-only">Clear step {{ index + 1 }}</span>
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>

                  <!-- Step Actions (Right Side) -->
                  <div class="flex items-center gap-1">
                    <!-- Reorder Arrows (Only visible in reorder mode) -->
                    <div v-if="isReorderMode" class="flex items-center gap-1 py-1">
                      <!-- Move Up -->
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="moveStepUp(index)"
                        :disabled="index === 0"
                        class="h-8 w-8 p-0"
                      >
                        <ChevronUp class="h-4 w-4" />
                      </Button>

                      <!-- Move Down -->
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="moveStepDown(index)"
                        :disabled="index === formData.steps.length - 1"
                        class="h-8 w-8 p-0"
                      >
                        <ChevronDown class="h-4 w-4" />
                      </Button>
                    </div>

                    <!-- Delete Button (Only visible in normal mode) -->
                    <Button
                      v-if="!isReorderMode"
                      type="button"
                      variant="ghost"
                      size="sm"
                      @click="removeStep(index)"
                      class="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <!-- Textarea Mode -->
              <div v-if="inputMode === 'textarea'">
                <InputGroup>
                  <InputGroupTextarea
                    v-model="stepsTextarea"
                    placeholder="Enter each step on a new line. Example:
1. Gather required documents
2. Fill out application form
3. Submit to the appropriate office"
                    :rows="8"
                    class="w-full font-mono text-sm"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      v-if="stepsTextarea"
                      variant="ghost"
                      size="icon-sm"
                      @click="stepsTextarea = ''"
                      title="Clear all steps"
                    >
                      <XIcon class="size-4" />
                      <span class="sr-only">Clear all steps</span>
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <p class="text-xs text-muted-foreground mt-2">
                  {{ stepsTextarea.split('\n').filter(line => line.trim()).length }} steps will be created
                </p>
              </div>

              <!-- Empty Steps State (only for individual mode) -->
              <div 
                v-if="inputMode === 'individual' && formData.steps.length === 0"
                class="text-center py-8 border-2 border-dashed rounded-lg border-muted-foreground/25"
              >
                <List class="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p class="text-sm mb-1">No steps added yet</p>
                <p class="text-xs text-muted-foreground">Click "+" to get started or switch to text mode</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-6 border-t">
              <Button type="button" variant="outline" @click="cancel" class="flex-1">
                <X class="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" class="flex-1" :disabled="!canSave">
                <Plus v-if="!isEditing" class="h-4 w-4 mr-2" />
                <ArrowLeft v-else class="h-4 w-4 mr-2" />
                {{ isEditing ? 'Update Routine' : 'Create Routine' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group'
import { routinesService } from '@/services/routinesService'
import type { Routine, RoutineData, RoutineStep } from '@/services/routinesService'
import {
  ArrowLeft,
  Plus,
  ArrowUpDown,
  FileText,
  List,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-vue-next'

// Alias X as XIcon to match naming convention
const XIcon = X

const router = useRouter()
const route = useRoute()

const isEditing = computed(() => !!route.params.id)
const routineId = computed(() => route.params.id as string)

const formData = ref<RoutineData>({
  name: '',
  description: '',
  tagsString: '',
  tags: [],
  steps: []
})

const isReorderMode = ref(false)
const inputMode = ref<'individual' | 'textarea'>('individual')
const stepsTextarea = ref('')

const canSave = computed(() => {
  const hasName = formData.value.name.trim().length > 0
  const hasTags = (formData.value.tagsString || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0).length > 0
  return hasName && hasTags
})

const loadRoutine = () => {
  if (isEditing.value) {
    const routine = routinesService.getRoutineById(routineId.value)
    if (routine) {
      formData.value = {
        name: routine.name,
        description: routine.description || '',
        tagsString: routine.tags.join(', '),
        tags: routine.tags,
        steps: routine.steps.map(step => ({ ...step }))
      }
    } else {
      // Routine not found, redirect to routines list
      router.push('/routines')
    }
  } else {
    initializeNewRoutine()
  }
}

const initializeNewRoutine = () => {
  // Start with one empty step
  formData.value.steps = [{
    id: `step_${Date.now()}_0`,
    title: '',
    order: 1
  }]
}

const saveRoutine = () => {
  if (!formData.value.name.trim()) {
    alert('Please enter a routine name')
    return
  }

  const tags = (formData.value.tagsString || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  if (tags.length === 0) {
    alert('Please add at least one tag')
    return
  }

  const routineData: RoutineData = {
    name: formData.value.name.trim(),
    description: (formData.value.description || '').trim(),
    tags: tags,
    steps: formData.value.steps.map((step, index) => ({
      title: step.title.trim(),
      order: index + 1
    })).filter(step => step.title.length > 0)
  }

  if (isEditing.value) {
    const result = routinesService.updateRoutine(routineId.value, routineData)
    if (result.success) {
      router.push('/routines')
    } else {
      alert(result.error || 'Failed to update routine')
    }
  } else {
    const result = routinesService.createRoutine(routineData)
    if (result.success) {
      router.push('/routines')
    } else {
      alert(result.error || 'Failed to create routine')
    }
  }
}

const cancel = () => {
  // Check if there are unsaved changes
  if (hasUnsavedChanges()) {
    if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
      router.push('/routines')
    }
  } else {
    router.push('/routines')
  }
}

const hasUnsavedChanges = () => {
  // Simple check for unsaved changes
  return formData.value.name.trim() ||
         (formData.value.description || '').trim() ||
         (formData.value.tagsString || '').trim() ||
         formData.value.steps.some(step => step.title.trim())
}

const addStep = () => {
  formData.value.steps.push({
    id: `step_${Date.now()}_${formData.value.steps.length}`,
    title: '',
    order: formData.value.steps.length + 1
  })
}

const removeStep = (index: number) => {
  formData.value.steps.splice(index, 1)
}

const moveStepUp = (index: number) => {
  if (index > 0) {
    const step = formData.value.steps.splice(index, 1)[0]
    if (step) {
      formData.value.steps.splice(index - 1, 0, step)
    }
  }
}

const moveStepDown = (index: number) => {
  if (index < formData.value.steps.length - 1) {
    const step = formData.value.steps.splice(index, 1)[0]
    if (step) {
      formData.value.steps.splice(index + 1, 0, step)
    }
  }
}

const toggleReorderMode = () => {
  isReorderMode.value = !isReorderMode.value
}

const toggleInputMode = () => {
  const newMode = inputMode.value === 'individual' ? 'textarea' : 'individual'
  inputMode.value = newMode
  
  if (newMode === 'textarea') {
    // Switching to textarea: sync current steps to textarea
    syncStepsToTextarea()
  } else {
    // Switching to individual: sync textarea to steps
    syncTextareaToSteps()
  }
}

const syncStepsToTextarea = () => {
  // Convert steps array to newline-separated text
  stepsTextarea.value = formData.value.steps
    .map(step => step.title.trim())
    .filter(title => title.length > 0)
    .join('\n')
}

const syncTextareaToSteps = () => {
  // Convert textarea text to steps array
  const lines = stepsTextarea.value.split('\n')
  const newSteps = lines
    .map((line, index) => {
      const title = line.trim()
      if (title.length > 0) {
        return {
          id: `step_${Date.now()}_${index}`,
          title: title,
          order: index + 1
        }
      }
      return null
    })
    .filter(step => step !== null) as RoutineStep[]

  formData.value.steps = newSteps
}

// Watch for changes to sync between modes
watch(
  () => formData.value.steps,
  () => {
    if (inputMode.value === 'individual') {
      syncStepsToTextarea()
    }
  },
  { deep: true }
)

watch(stepsTextarea, () => {
  if (inputMode.value === 'textarea') {
    syncTextareaToSteps()
  }
})

onMounted(() => {
  loadRoutine()
})
</script>

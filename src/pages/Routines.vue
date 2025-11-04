<template>
  <div class="page-layout">
    <!-- Search and Filters Card -->
    <Card>
      <CardContent>
        <div class="space-y-4">
          <!-- Search Bar -->
          <div class="relative">
            <Input
              v-model="searchQuery"
              placeholder="Search routines, tags, description..."
              class="w-full "
            />
          </div>

          <!-- Tag Filter -->
          <ToggleSelector
            v-if="tagFilterOptions.length > 1"
            v-model="selectedTag"
            :options="tagFilterOptions"
            :multiple="false"
            />
        </div>
      </CardContent>
    </Card>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRoutines.length === 0" class="text-center py-12">
        <div class="mx-auto w-12 h-12 text-muted-foreground mb-4">
          <ClipboardList class="w-full h-full" />
        </div>
        <h3 class="text-lg font-medium mb-2">
          No routines found
        </h3>
        <p class="mb-4 text-muted-foreground">
          {{ searchQuery ?
            'Try adjusting your search query.' :
            'Create your first routine to get started.' }}
        </p>
        <Button @click="$router.push('/routines/new')" v-if="!searchQuery">
          <Plus class="h-4 w-4 mr-2" />
          Add Routine
        </Button>
      </div>

      <!-- Routines List -->
      <div v-else>
        <!-- Routines Title with Add Button -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-foreground">
            Routines ({{ filteredRoutines.length }})
          </h2>
          <Button @click="$router.push('/routines/new')" title="Add new routine" size="sm">
            <Plus class="h-4 w-4" />
            Add
          </Button>
        </div>
        
        <div class="space-y-4">
          <RoutineCard
            v-for="routine in filteredRoutines"
            :key="routine.id"
            :routine="routine"
            @edit="editRoutine"
            @delete="deleteRoutine"
          />
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import RoutineCard from '@/components/RoutineCard.vue'
import ToggleSelector from '@/components/ToggleSelector.vue'
import { Card, CardContent } from '@/components/ui/card'
import { routinesService } from '@/services/routinesService'
import { Plus, ClipboardList } from 'lucide-vue-next'
import type { Routine } from '@/services/routinesService'

const router = useRouter()

const routines = ref<Routine[]>([])
const searchQuery = ref('')
const selectedTag = ref('')
const isLoading = ref(false)

const availableTags = computed(() => {
  const allTags = new Set<string>()
  routines.value.forEach(routine => {
    if (routine.tags && Array.isArray(routine.tags)) {
      routine.tags.forEach(tag => {
        if (tag.trim().length > 0) {
          allTags.add(tag.trim())
        }
      })
    }
  })
  return Array.from(allTags).sort()
})

// Generate tag filter options for ToggleSelector
const tagFilterOptions = computed(() => {
  const tags = availableTags.value
  
  // Create options array with "All" first, then tags alphabetically
  const options = [
    { value: '', label: 'All' },
    ...tags
      .filter(tag => tag) // Filter out empty tag names
      .sort() // Sort alphabetically
      .map(tag => ({ value: tag, label: tag }))
  ]
  
  return options
})

const filteredRoutines = computed(() => {
  let filtered = routines.value

  // Filter by selected tag
  if (selectedTag.value) {
    filtered = filtered.filter(routine =>
      routine.tags.includes(selectedTag.value)
    )
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(routine =>
      routine.name.toLowerCase().includes(query) ||
      (routine.description && routine.description.toLowerCase().includes(query)) ||
      routine.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

const loadRoutines = () => {
  isLoading.value = true
  // Simulate async loading for better UX
  setTimeout(() => {
    routines.value = routinesService.getRoutines()
    isLoading.value = false
  }, 300)
}

const editRoutine = (routine: Routine) => {
  router.push(`/routines/edit/${routine.id}`)
}

const deleteRoutine = (id: string) => {
  if (confirm('Are you sure you want to delete this routine?')) {
    const result = routinesService.deleteRoutine(id)
    if (result.success) {
      loadRoutines()
      // You could add a toast notification here
    } else {
      alert(result.error || 'Failed to delete routine')
    }
  }
}

onMounted(() => {
  loadRoutines()
})
</script>

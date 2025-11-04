<template>
  <Card class="cursor-pointer transition-all duration-200 hover:shadow-md" @click="toggleExpanded">
    <CardContent >
      <!-- Header Section (Always Visible) -->
      <div class="space-y-1">
        <h3 class="text-md font-semibold text-foreground">
          {{ routine.name }}
        </h3>
        <p v-if="routine.description" class="text-sm text-muted-foreground whitespace-pre-line">
          {{ routine.description }}
        </p>

        <!-- Tags, Step Count and Expand Button -->
        <div class="flex items-center justify-between text-xs mt-3">
          <!-- Tags (Left side) -->
          <div v-if="routine.tags && routine.tags.length > 0" class="flex items-center gap-1">
            <Badge v-for="tag in routine.tags.slice(0, 2)" :key="tag" variant="secondary" class="text-xs">
              {{ tag }}
            </Badge>
            <Badge v-if="routine.tags.length > 2" variant="outline" class="text-xs">
              +{{ routine.tags.length - 2 }}
            </Badge>
          </div>
          <!-- Empty space if no tags -->
          <div v-else></div>

          <!-- Step Count and Expand Button (Right side) -->
          <div class="flex items-center gap-2">
            <span class="text-muted-foreground">
              {{ routine.steps?.length || 0 }} steps
            </span>

            <!-- Expand Button (Always Visible) -->
            <Button 
              variant="ghost" 
              size="sm" 
              @click.stop="toggleExpanded"
              :title="isExpanded ? 'Collapse' : 'Expand'"
              class="h-6 w-6 p-0"
            >
              <ChevronDown 
                :class="[
                  'h-4 w-4 transition-transform duration-200',
                  isExpanded ? 'rotate-180' : ''
                ]" 
              />
            </Button>
          </div>
        </div>
      </div>

      <!-- Expandable Content -->
      <div v-if="isExpanded" class="border-t pt-3 mt-3 space-y-4">
        <!-- Steps List -->
        <div v-if="routine.steps && routine.steps.length > 0" class="space-y-2">
          <div 
            v-for="(step, index) in routine.steps" 
            :key="step.id || index"
            class="flex items-start gap-3 p-2 rounded-lg bg-muted/50 border"
          >
            <div class="  ">
              <p class="text-sm break-words">{{ index + 1 }}. {{ step.title }}</p>
            </div>
        
          </div>
        </div>

        <!-- Empty Steps State -->
        <div v-else class="text-center py-2 text-muted-foreground">
          <p class="text-sm">No steps added yet</p>
        </div>

        <!-- Bottom Section with Date and Action Buttons -->
        <div class="flex items-center justify-between pt-2 border-t">
          <!-- Created Date (Left side) -->
          <div v-if="routine.createdAt" class="text-xs text-muted-foreground">
            {{ formatDate(routine.createdAt) }}
          </div>

          <!-- Action Buttons (Right side) -->
          <div class="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              @click.stop="$emit('edit', routine)"
              title="Edit routine"
              class="h-8 w-8 p-0"
            >
              <Pencil class="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              @click.stop="$emit('delete', routine.id)"
              title="Delete routine"
              class="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Pencil, Trash2 } from 'lucide-vue-next'
import type { Routine } from '@/services/routinesService'

interface Props {
  routine: Routine
}

interface Emits {
  (e: 'edit', routine: Routine): void
  (e: 'delete', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isExpanded = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const formatDate = (timestamp: string) => {
  if (!timestamp) return ''
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return ''
  }
}
</script>

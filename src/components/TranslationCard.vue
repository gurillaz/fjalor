<template>
  <div class="space-y-3 sm:space-y-4">
    <!-- Single Translation Card with Expandable Content -->
    <Card class="py-0 transition-all duration-200 hover:shadow-md relative">

      <CardContent class="p-4">
        <!-- Header Section (Always Visible) -->
        <div class="space-y-1">
          <!-- Badges -->
         

          <!-- Source Language (Always Visible) -->
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <h4 class="text-xs font-small">{{ getLanguageName(translationData.sourceLanguage || '') }}</h4>
            </div>
            <p class="text-md leading-relaxed">
              {{ source }}
              <button
                @click.stop="copyToClipboard(source, 'source')"
                :class="[
                  'h-3 w-3 ml-2 transition-colors duration-200 inline-flex',
                  sourceCopied ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'
                ]"
                title="Copy text"
              >
                <Copy class="h-3 w-3" />
              </button>
            </p>
          </div>

          <!-- Target Languages Preview (Always Visible) -->
          <div class="space-y-1 ">
            <!-- Target Language 1 Preview -->
            <div v-if="target1 && target1.trim()" class="space-y-1 border-t pt-2">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <h4 class="text-xs font-small">{{ getLanguageName(translationData.targetLanguage1 || '') }}</h4>
              </div>
               <p class="text-md leading-relaxed ">
                {{ target1 }}
                <button
                  @click.stop="copyToClipboard(target1, 'target1')"
                  :class="[
                    'h-3 w-3 ml-2 transition-colors duration-200 inline-flex',
                    target1Copied ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'
                  ]"
                  title="Copy text"
                >
                  <Copy class="h-3 w-3" />
                </button>
              </p>
            </div>

            <!-- Target Language 2 Preview -->
            <div v-if="target2 && target2.trim()" class="space-y-1 border-t pt-2">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 class="text-xs font-small">{{ getLanguageName(translationData.targetLanguage2 || '') }}</h4>
              </div>
               <p class="text-md leading-relaxed">
                {{ target2 }}
                <button
                  @click.stop="copyToClipboard(target2, 'target2')"
                  :class="[
                    'h-3 w-3 ml-2 transition-colors duration-200 inline-flex',
                    target2Copied ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'
                  ]"
                  title="Copy text"
                >
                  <Copy class="h-3 w-3" />
                </button>
              </p>
            </div>
          </div>

          <!-- Bottom Section with Context, Date, Carousel Toggle and Action Icons (Always Visible) -->
          <div class="flex items-center justify-between">
            <!-- Left side: Context, Date, and Carousel Toggle on same line - Clickable Area -->
            <button
              @click.stop="toggleExpanded"
              :title="isExpanded ? 'Collapse carousel' : 'Expand carousel'"
              class="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <span v-if="context">{{ context }}</span>
              <span v-if="context && timestamp"> - </span>
              <span v-if="timestamp">{{ formattedDate }}</span>
              
              <!-- Carousel Toggle Icon -->
              <ChevronDown 
                :class="[
                  'h-3 w-3 transition-transform duration-200',
                  isExpanded ? 'rotate-180' : ''
                ]" 
              />
            </button>

            <!-- Right side: Delete and Bookmark Icons -->
            <div class="flex items-center gap-2">
              <!-- Delete Button -->
              <button
                v-if="showDeleteButton"
                @click.stop="confirmDelete"
                :disabled="isDeleting"
                class="h-6 w-6 p-0 hover:bg-muted/50 rounded-sm transition-colors"
                title="Delete translation"
              >
                <Trash2 class="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
              
              <!-- Bookmark Button -->
              <button
                v-if="showSaveButton"
                @click.stop="saveTranslation"
                :disabled="isSaving"
                class="h-6 w-6 p-0 hover:bg-muted/50 rounded-sm transition-colors"
                :title="isSaved ? 'Unsave translation' : 'Save translation'"
              >
                <Bookmark v-if="isSaved" class="h-4 w-4 text-foreground fill-current" />
                <BookmarkIcon v-else class="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <!-- Expandable Content -->
        <div v-if="isExpanded" class="border-t pt-3 mt-3 space-y-4">
          <!-- Translation Details -->
          <div v-if="timestamp || aiModel || context" class="space-y-3">
            <h4 class="text-xs sm:text-sm font-medium text-muted-foreground">Translation Details</h4>
            <div class="space-y-1 text-xs text-muted-foreground">
              <div v-if="context" class="flex items-center gap-1">
                <span class="font-medium">Context:</span>
                <span>{{ context }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="font-medium">Type:</span>
                <span>{{ translationType === 'ai_generated' ? 'AI Generated' : 'User Generated' }}</span>
              </div>
              <div v-if="timestamp" class="flex items-center gap-1">
                <span class="font-medium">Translated:</span>
                <span>{{ formattedTimestamp }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="font-medium">AI Model:</span>
                <span>{{ aiModel }}</span>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { historyService, type TranslationData } from '@/services/historyService'
import { getLanguageName } from '@/services/languageService'
import { Card, CardContent } from '@/components/ui/card'
import { Bookmark, BookmarkIcon, Trash2, ChevronDown, Copy } from 'lucide-vue-next'

// Props
interface Props {
  source: string
  target1?: string
  target2?: string
  timestamp?: string
  id?: string
  showSaveButton?: boolean
  showDeleteButton?: boolean
  translationData: TranslationData
}

const props = withDefaults(defineProps<Props>(), {
  target1: '',
  target2: '',
  timestamp: '',
  id: '',
  showSaveButton: true,
  showDeleteButton: true,
  translationData: () => ({} as TranslationData)
})

// Emits
const emit = defineEmits<{
  saved: [translationData: TranslationData]
  deleted: [id: string]
}>()

// Reactive data
const isSaving = ref(false)
const isDeleting = ref(false)
const isSaved = ref(false)
const isExpanded = ref(false)
const sourceCopied = ref(false)
const target1Copied = ref(false)
const target2Copied = ref(false)

// Computed properties
const formattedTimestamp = computed(() => {
  if (!props.timestamp) return ''
  try {
    return new Date(props.timestamp).toLocaleString()
  } catch (error) {
    return props.timestamp
  }
})

const formattedDate = computed(() => {
  if (!props.timestamp) return ''
  try {
    const date = new Date(props.timestamp)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return ''
  }
})

const aiModel = computed(() => {
  // Return the AI model saved with the translation
  return props.translationData.aiModel || 'Unknown Model'
})

const context = computed(() => {
  // Return the context saved with the translation
  return props.translationData.context || ''
})

const translationType = computed(() => {
  // Return the translation type from the translation data
  return props.translationData.type || 'user_input'
})

// Methods
const checkIfSaved = () => {
  // Check if translation is saved using the ID
  isSaved.value = historyService.isTranslationSaved(props.id)
}

const saveTranslation = async () => {
  isSaving.value = true

  try {

    let result
    if (isSaved.value) {
      // Unsave translation
      result = { success: historyService.unsaveTranslationById(props.id!) }
    } else {
      // Save translation
      result = { success: historyService.saveTranslationById(props.id!) }
    }

    if (result.success) {
      isSaved.value = !isSaved.value
      emit('saved', props.translationData)
    }
  } catch (error) {
    console.error('Error toggling save status:', error)
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = () => {
  if (confirm('Are you sure you want to delete this translation? This action cannot be undone.')) {
    deleteTranslation()
  }
}

const deleteTranslation = async () => {
  isDeleting.value = true

  try {
    const result = historyService.deleteTranslation(props.id!)

    if (result) {
      emit('deleted', props.id)
    }
  } catch (error) {
    console.error('Error deleting translation:', error)
  } finally {
    isDeleting.value = false
  }
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const copyToClipboard = async (text: string, type: 'source' | 'target1' | 'target2') => {
  try {
    // Modern clipboard API with fallback for iOS Safari
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers and iOS Safari
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
      } catch (err) {
        console.error('Fallback copy failed:', err)
        throw err
      } finally {
        document.body.removeChild(textArea)
      }
    }
    
    // Set the appropriate copied state to true
    if (type === 'source') {
      sourceCopied.value = true
    } else if (type === 'target1') {
      target1Copied.value = true
    } else if (type === 'target2') {
      target2Copied.value = true
    }
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      if (type === 'source') {
        sourceCopied.value = false
      } else if (type === 'target1') {
        target1Copied.value = false
      } else if (type === 'target2') {
        target2Copied.value = false
      }
    }, 2000)
  } catch (error) {
    console.error('Failed to copy text:', error)
  }
}

// Lifecycle
onMounted(() => {
  checkIfSaved()
})
</script>

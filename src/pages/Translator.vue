<template>
  <div class="page-layout">
 
    <div style="margin-top: 42dvh;"></div>


    <!-- Context Selection -->
    <ToggleSelector 
      v-model="selectedContext"
      :options="contextOptions"
      direction="horizontal"
      :disabled="isOffline"
    />
    
    <!-- Main Translation Input Group -->
    <InputGroup>
      <InputGroupTextarea
        id="translation-input"
        v-model="inputText"
        placeholder="Type your text to translate..."
        :disabled="isLoading || isOffline "
        :class="[
          'min-h-[100px] resize-none sm:min-h-[120px] pr-9',
          isLoading ? 'animate-pulse border-primary bg-primary/5' : ''
        ]"
        aria-label="Text to translate"
        aria-describedby="translation-help"
      />
      
      <!-- Clear Button -->
      <InputGroupAddon class="right-2 top-1" style="position: absolute;">
        <InputGroupButton
          v-if="inputText"
          variant="ghost"
          size="icon-sm"
          @click="inputText = ''"
          title="Clear text"
          :disabled="isOffline"
        >
          <XIcon class="size-4" />
          <span class="sr-only">Clear text</span>
        </InputGroupButton>
      </InputGroupAddon>
      
      <!-- Translate Button -->
      <InputGroupButton
        variant="default"
        class="w-13/14 py-4 mb-2"
        @click="translateText"
        :disabled="!inputText.trim() || isLoading || isOffline"
      >
        <ArrowUpIcon v-if="!isLoading" class="size-4 mr-2" />
        <Loader2Icon v-else class="size-4 mr-2 animate-spin" />
        Translate
      </InputGroupButton>
      
      <InputGroupAddon align="block-end" class="flex justify-between gap-2">
        <!-- Source Language Dropdown -->
        <div class="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <InputGroupButton variant="ghost" :disabled="isLoading || isOffline" class="w-full">
                <LanguagesIcon class="size-4 mr-2" />
                {{ getSelectedSourceLanguageDisplay() }}
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" class="[--radius:0.95rem]">
              <DropdownMenuItem 
                value="autodetect"
                @click="selectedSourceLanguage = 'autodetect'"
              >
                <SparklesIcon class="size-4 mr-2" />
                Autodetect
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                v-for="lang in sourceLanguageOptions" 
                :key="lang.value" 
                @click="selectedSourceLanguage = lang.value"
              >
                {{ lang.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <!-- Target Language Dropdown -->
        <div class="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <InputGroupButton 
                variant="ghost" 
                :disabled="isLoading || selectedSourceLanguage === 'autodetect' || isOffline"
                class="w-full"
              >
                <TargetIcon class="size-4 mr-2" />
                {{ getTargetSelectionDisplay() }}
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" class="[--radius:0.95rem]">
              <DropdownMenuItem 
                value="both"
                @click="targetSelection = 'both'"
              >
                Both languages
              </DropdownMenuItem>
              <DropdownMenuItem 
                value="target1"
                @click="targetSelection = 'target1'"
              >
                {{ getTargetLanguageName(1) }} only
              </DropdownMenuItem>
              <DropdownMenuItem 
                value="target2"
                @click="targetSelection = 'target2'"
              >
                {{ getTargetLanguageName(2) }} only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <!-- Example Generation Toggle -->
        <div class="flex-1 flex items-center justify-center gap-2">
          <Switch
            id="example-generation-toggle"
            v-model="generateExamples"
            :disabled="isLoading || isOffline"
            aria-label="Toggle example sentence generation"
            title="Toggle example generation"
          />
          <label for="example-generation-toggle" class="text-xs font-medium cursor-pointer">
            Sentences
          </label>
        </div>
      </InputGroupAddon>
    </InputGroup>
    


    <!-- Autodetect Info -->
    <div v-if="selectedSourceLanguage === 'autodetect'" id="translation-help" class="mt-3 text-sm text-muted-foreground">
      <InfoIcon class="inline size-4 mr-1" />
      When autodetect is selected, translations are made to both languages.
    </div>
  


    <!-- Error Message Only -->
    <div v-if="error" class="space-y-4">
      <Alert variant="destructive">
        <AlertCircleIcon class="size-4" />
        <AlertTitle>Translation Error</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { translationService } from '@/services/translationService'
import { appDataService } from '@/services/appDataService'
import { getAllContexts } from '@/services/contextService'
import { getLanguageName } from '@/services/languageService'
import { useNetworkStatus } from '@/services/pwaService'

// Import shadcn-vue components
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import ToggleSelector from '@/components/ToggleSelector.vue'

// Import icons
import { 
  LanguagesIcon, 
  TargetIcon, 
  ArrowUpIcon, 
  Loader2Icon,
  InfoIcon,
  AlertCircleIcon,
  SparklesIcon,
  X as XIcon
} from 'lucide-vue-next'

const router = useRouter()

// Network status
const { isOffline } = useNetworkStatus()

// Default translation parameters - always use these values
const defaultTranslationParams = {
  sourceLanguage: 'autodetect' as const,
  selectedContext: 'Expert',
  generateExamples: true,
  targetSelection: 'both' as const
}

// Reactive data - initialized from defaults
const inputText = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedSourceLanguage = ref<'autodetect' | string>(defaultTranslationParams.sourceLanguage)
const selectedContext = ref(defaultTranslationParams.selectedContext)
const generateExamples = ref<boolean>(defaultTranslationParams.generateExamples)
const targetSelection = ref<'both' | 'target1' | 'target2'>(defaultTranslationParams.targetSelection)

// Cache expensive computations
const settings = computed(() => {
  try {
    return appDataService.getSettings()
  } catch (error) {
    console.error('Error getting settings:', error)
    return {
      motherlanguage: 'en',
      secondlanguage: 'sq',
      learninglanguage: 'es'
    }
  }
})

// Computed properties
const sourceLanguageOptions = computed(() => {
  const currentSettings = settings.value
  return [
    { value: currentSettings.motherlanguage, label: getLanguageName(currentSettings.motherlanguage) },
    { value: currentSettings.secondlanguage, label: getLanguageName(currentSettings.secondlanguage) },
    { value: currentSettings.learninglanguage, label: getLanguageName(currentSettings.learninglanguage) }
  ]
})

const contextOptions = computed(() => {
  try {
    return getAllContexts()
  } catch (error) {
    console.error('Error getting context options:', error)
    return []
  }
})



// Methods
const getSelectedSourceLanguageDisplay = (): string => {
  if (selectedSourceLanguage.value === 'autodetect') {
    return 'Auto'
  }
  const lang = sourceLanguageOptions.value.find(l => l.value === selectedSourceLanguage.value)
  return lang ? lang.label : 'Auto'
}

const getTargetSelectionDisplay = (): string => {
  if (selectedSourceLanguage.value === 'autodetect') {
    return 'Both'
  }
  switch (targetSelection.value) {
    case 'both':
      return 'Both'
    case 'target1':
      return getTargetLanguageName(1)
    case 'target2':
      return getTargetLanguageName(2)
    default:
      return 'Both'
  }
}


const translateText = async () => {
  if (!inputText.value.trim()) {
    return
  }
  
  // Check if offline
  if (isOffline.value) {
    error.value = 'Translation is not available while offline. Please check your internet connection and try again.'
    return
  }
  
  isLoading.value = true
  error.value = null
  
  try {
    // When autodetect is selected, always use 'both' for target selection
    const effectiveTargetSelection = selectedSourceLanguage.value === 'autodetect' ? 'both' : targetSelection.value
    
    // Call the translation service with source selection and target selection
    const { translationData } = await translationService.performTranslation(inputText.value, selectedSourceLanguage.value, effectiveTargetSelection)
    
    // Navigate to results page on success with translation data and context
    router.push({
      path: '/results',
      state: { 
        translationData: translationData as any,
        translationContext: {
          inputText: inputText.value,
          selectedSourceLanguage: selectedSourceLanguage.value,
          selectedContext: selectedContext.value,
          generateExamples: generateExamples.value,
          targetSelection: effectiveTargetSelection
        }
      }
    })
    
  } catch (err) {
    console.error('Translation failed:', err)
    error.value = (err as Error).message || 'Failed to translate text'
  } finally {
    isLoading.value = false
  }
}



// Helper function to get effective source language
const getEffectiveSourceLanguage = (): string => {
  const currentSettings = settings.value
  return selectedSourceLanguage.value === 'autodetect' 
    ? currentSettings.motherlanguage 
    : selectedSourceLanguage.value
}

// Helper function to get target languages array
const getTargetLanguages = (): string[] => {
  const currentSettings = settings.value
  const sourceLang = getEffectiveSourceLanguage()
  const allLanguages = [currentSettings.motherlanguage, currentSettings.secondlanguage, currentSettings.learninglanguage]
  return allLanguages.filter(lang => lang !== sourceLang)
}

const getTargetLanguageName = (targetIndex: number): string => {
  try {
    const targets = getTargetLanguages()
    
    if (targetIndex === 1 && targets[0]) {
      return getLanguageName(targets[0])
    } else if (targetIndex === 2 && targets[1]) {
      return getLanguageName(targets[1])
    }
    return 'Unknown'
  } catch (error) {
    console.error('Error getting target language name:', error)
    return 'Unknown'
  }
}

// Lifecycle
onMounted(() => {
  // Check for incoming translation context from router state
  const routerState = history.state as any;
  if (routerState?.translationContext) {
    // Restore translation context from previous session
    const context = routerState.translationContext;
    inputText.value = context.inputText || '';
    selectedSourceLanguage.value = context.selectedSourceLanguage || defaultTranslationParams.sourceLanguage;
    selectedContext.value = context.selectedContext || defaultTranslationParams.selectedContext;
    generateExamples.value = context.generateExamples !== undefined ? context.generateExamples : defaultTranslationParams.generateExamples;
    targetSelection.value = context.targetSelection || defaultTranslationParams.targetSelection;
  } else {
    // Ensure generateExamples is set to default value for fresh start
    generateExamples.value = defaultTranslationParams.generateExamples;
  }
})
</script>

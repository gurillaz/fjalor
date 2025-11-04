<template>
  <div class="setup-full-height">
    <!-- Progress Indicator -->
    <div class="w-full mb-8 flex-shrink-0">
      <Stepper 
        :model-value="currentStep" 
        @update:model-value="currentStep = $event"
        orientation="horizontal"
        class="flex w-full items-start gap-2"
      >
        <StepperItem
          v-for="step in steps"
          :key="step.step"
          v-slot="{ state }"
          class="relative flex w-full flex-col items-center justify-center"
          :step="step.step!"
        >
          <StepperSeparator
            v-if="step.step !== steps[steps.length - 1]?.step"
            class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
          />

          <StepperTrigger as-child>
            <Button
              :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
              size="icon"
              class="z-10 rounded-full shrink-0"
              :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
            >
              <Check v-if="state === 'completed'" class="size-5" />
              <Circle v-if="state === 'active'" />
              <Dot v-if="state === 'inactive'" />
            </Button>
          </StepperTrigger>

          <div class="mt-5 flex flex-col items-center text-center">
            <StepperTitle
              :class="[state === 'active' && 'text-primary']"
              class="text-sm font-semibold transition lg:text-base"
            >
              {{ step.title }}
            </StepperTitle>
            <StepperDescription
              :class="[state === 'active' && 'text-primary']"
              class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm"
            >
              {{ step.description }}
            </StepperDescription>
          </div>
        </StepperItem>
      </Stepper>
    </div>

    <!-- Setup Content -->
    <div class="flex-1 overflow-y-auto mx-auto">
      <!-- Step 1: Welcome -->
      <div v-if="currentStep === 1" class="text-center space-y-6">
        <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <img src="/icon-192.png" alt="Fjalor App Icon" class="w-20 h-20" />
        </div>
        <p class="text-muted-foreground mb-8">
          Your intelligent translation companion for language learning. Let's get you set up in just a few steps.
        </p>
        
        <!-- Data Import Option -->
        <Card class="mb-6">
          <CardHeader>
            <CardTitle class="text-lg">📥 Restore Existing Data?</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground mb-4">
              Do you have previous translation data you'd like to import?
            </p>
            
            <input
              ref="importFileInput"
              type="file"
              accept=".json"
              @change="handleImportFile"
              class="hidden"
            />
            <Button
              @click="importFileInput?.click()"
              :disabled="isImporting"
              class="w-full mb-3"
              variant="outline"
            >
              <template v-if="isImporting">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </template>
              <template v-else>
                Choose File to Import
              </template>
            </Button>
            
            <!-- Import Status -->
            <div v-if="importStatus" class="text-sm">
              <div v-if="importStatus.success" class="text-green-600 mb-2">
                ✓ {{ importStatus.message }}
              </div>
              <div v-else class="text-red-600 mb-2">
                ✗ {{ importStatus.message }}
              </div>
            </div>
            
            <div class="text-xs text-muted-foreground">
              You can also skip this and start fresh
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-primary rounded-full"></div>
                <span class="text-sm">Configure your language learning journey</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-primary rounded-full"></div>
                <span class="text-sm">Set up AI translation preferences</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Step 2: Language Configuration -->
      <div v-if="currentStep === 2" class="space-y-6">
        <h2 class="text-2xl font-bold text-center">Language Learning Setup</h2>
        <p class="text-muted-foreground text-center">
          Configure your languages for personalized translation experience
        </p>
        
        <div class="space-y-4">
          <!-- Mother Language -->
          <div>
            <Label for="motherLanguage" class="block text-sm font-medium mb-2">Mother Language (L1)</Label>
            <Select v-model="languageConfig.motherlanguage" @update:modelValue="validateLanguages">
              <SelectTrigger :class="{ 'border-red-500': languageErrors.motherlanguage }" class="w-full">
                <SelectValue placeholder="Select your mother language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="lang in availableLanguages" :key="lang.value" :value="lang.value">
                  {{ lang.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="languageErrors.motherlanguage" class="text-xs text-red-600 mt-1">{{ languageErrors.motherlanguage }}</p>
          </div>

          <!-- Second Language -->
          <div>
            <Label for="secondLanguage" class="block text-sm font-medium mb-2">Second Language (L2)</Label>
            <Select v-model="languageConfig.secondlanguage" @update:modelValue="validateLanguages">
              <SelectTrigger :class="{ 'border-red-500': languageErrors.secondlanguage }" class="w-full">
                <SelectValue placeholder="Select your second language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="lang in availableLanguages" :key="lang.value" :value="lang.value">
                  {{ lang.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="languageErrors.secondlanguage" class="text-xs text-red-600 mt-1">{{ languageErrors.secondlanguage }}</p>
          </div>

          <!-- Target Language -->
          <div>
            <Label for="targetLanguage" class="block text-sm font-medium mb-2">Target Language (L3) <span class="text-primary">★ Learning</span></Label>
            <Select v-model="languageConfig.learninglanguage" @update:modelValue="validateLanguages">
              <SelectTrigger :class="{ 'border-red-500': languageErrors.learninglanguage }" class="w-full">
                <SelectValue placeholder="Select language to learn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="lang in availableLanguages" :key="lang.value" :value="lang.value">
                  {{ lang.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="languageErrors.learninglanguage" class="text-xs text-red-600 mt-1">{{ languageErrors.learninglanguage }}</p>
          </div>
        </div>

        <!-- Language Preview -->
        <Card v-if="isLanguageConfigValid">
          <CardHeader>
            <CardTitle class="text-base">Your Language Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-center text-sm">
                <span class="w-3 h-3 bg-primary rounded-full mr-3"></span>
                <span>Mother: <strong>{{ getLanguageNameFunction(languageConfig.motherlanguage) }}</strong></span>
              </div>
              <div class="flex items-center text-sm">
                <span class="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span>Second: <strong>{{ getLanguageNameFunction(languageConfig.secondlanguage) }}</strong></span>
              </div>
              <div class="flex items-center text-sm">
                <span class="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                <span>Learning: <strong>{{ getLanguageNameFunction(languageConfig.learninglanguage) }}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Step 3: AI Configuration -->
      <div v-if="currentStep === 3" class="space-y-6">
        <h2 class="text-2xl font-bold text-center mb-2">AI Configuration</h2>
        <p class="text-muted-foreground text-center mb-8">
          Set up your AI service for intelligent translations
        </p>
        
        <div class="space-y-4">
          <!-- API Info Card -->
          <Card>
          
            <CardContent>
              <h4 class="text-sm">AI Service Information</h4>
              <div class="text-xs text-muted-foreground space-y-2">
                <p>This app works with any <strong>OpenAI-compatible API</strong>.</p>
              </div>
              
              <!-- OpenRouter Free Model Info -->
   
            </CardContent>
          </Card>

          <!-- API URL -->
          <div>
            <Label for="apiUrl">AI API URL</Label>
            <InputGroup>
              <InputGroupInput
                id="apiUrl"
                v-model="aiConfig.apiLink"
                type="url"
                placeholder="https://openrouter.ai/api/v1/chat/completions"
                class="w-full"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  v-if="aiConfig.apiLink"
                  variant="ghost"
                  size="icon-sm"
                  @click="aiConfig.apiLink = 'https://openrouter.ai/api/v1/chat/completions'"
                  title="Reset to default URL"
                >
                  <XIcon class="size-4" />
                  <span class="sr-only">Reset to default URL</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <p class="text-xs text-muted-foreground mt-1">Default URL works for OpenRouter.ai</p>
          </div>

          <!-- API Key -->
          <div>
            <Label for="apiKey">API Key</Label>
            <InputGroup>
              <InputGroupInput
                id="apiKey"
                v-model="aiConfig.apiKey"
                type="password"
                placeholder="sk-or-v1-..."
                class="w-full"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  v-if="aiConfig.apiKey"
                  variant="ghost"
                  size="icon-sm"
                  @click="aiConfig.apiKey = ''"
                  title="Clear API key"
                >
                  <XIcon class="size-4" />
                  <span class="sr-only">Clear API key</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <p class="text-xs text-muted-foreground mt-1">Get your API key from your provider's dashboard</p>
          </div>

          <!-- AI Model -->
          <div>
            <Label for="aiModel">AI Model</Label>
            <InputGroup>
              <InputGroupInput
                id="aiModel"
                v-model="aiConfig.aiModel"
                type="text"
                placeholder="deepseek/deepseek-chat-v3.1:free"
                class="w-full"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  v-if="aiConfig.aiModel"
                  variant="ghost"
                  size="icon-sm"
                  @click="aiConfig.aiModel = 'deepseek/deepseek-chat-v3.1:free'"
                  title="Reset to default model"
                >
                  <XIcon class="size-4" />
                  <span class="sr-only">Reset to default model</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <p class="text-xs text-muted-foreground mt-1">Recommended free model: deepseek/deepseek-chat-v3.1:free</p>
          </div>

          <!-- Test Connection -->
          <div class="space-y-3">
            <Button
              @click="testConnection"
              :disabled="!aiConfig.apiLink || !aiConfig.apiKey || isTestingConnection"
              class="w-full"
              variant="outline"
            >
              <template v-if="isTestingConnection">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </template>
              <template v-else>
                Test Connection
              </template>
            </Button>

            <div v-if="connectionStatus" :class="[
              'w-full text-sm font-medium p-3 rounded-lg',
              connectionStatus.valid ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
            ]">
              {{ connectionStatus.valid ? '✓ Connection successful!' : '✗ ' + connectionStatus.error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Complete -->
      <div v-if="currentStep === 4" class="text-center space-y-6">
        <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold mb-4">Setup Complete!</h1>
        <p class="text-muted-foreground mb-8">
          Your Fjalor app is ready to use. You can start translating and learning languages right away.
        </p>
        
        <!-- Setup Summary -->
        <Card>
          <CardHeader>
            <CardTitle>Your Configuration:</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-sm space-y-2">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Languages:</span>
                <span>{{ getLanguageNameFunction(languageConfig.motherlanguage) }}, {{ getLanguageNameFunction(languageConfig.secondlanguage) }}, {{ getLanguageNameFunction(languageConfig.learninglanguage) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">AI Model:</span>
                <span>{{ aiConfig.aiModel }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Connection:</span>
                <span class="text-green-600">✓ Configured</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="w-full mt-auto pt-8 flex gap-4 flex-shrink-0">
      <Button
        v-if="currentStep > 1"
        @click="previousStep"
        variant="outline"
        class="flex-1"
      >
        Back
      </Button>
      
      <Button
        v-if="currentStep < 4"
        @click="nextStep"
        :disabled="!canProceed"
        class="flex-1"
      >
        Next
      </Button>
      
      <Button
        v-if="currentStep === 4"
        @click="completeSetup"
        class="flex-1"
      >
        Start Using App
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Circle, Dot, X } from 'lucide-vue-next'

// Alias X as XIcon to match naming convention
const XIcon = X
import { appDataService } from '@/services/appDataService'
import { translationService } from '@/services/translationService'
import { getLanguageName, getLanguageOptions } from '@/services/languageService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'

const router = useRouter()

// Steps configuration
const steps = [
  {
    step: 1,
    title: "Welcome",
    description: "Get started with Fjalor",
  },
  {
    step: 2,
    title: "Languages",
    description: "Configure your languages",
  },
  {
    step: 3,
    title: "AI Setup",
    description: "Set up AI translation",
  },
  {
    step: 4,
    title: "Complete",
    description: "Review and finish",
  },
]

// Reactive state
const currentStep = ref(1)
const isTestingConnection = ref(false)
const connectionStatus = ref<{ valid: boolean; error?: string } | null>(null)
const isImporting = ref(false)
const importStatus = ref<{ success: boolean; message: string } | null>(null)

// Language configuration
const languageConfig = ref({
  motherlanguage: '',
  secondlanguage: '',
  learninglanguage: ''
})

// AI configuration
const aiConfig = ref({
  apiLink: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: '',
  aiModel: 'deepseek/deepseek-chat-v3.1:free'
})

// Language validation errors
const languageErrors = ref({
  motherlanguage: '',
  secondlanguage: '',
  learninglanguage: ''
})

const availableLanguages = computed(() => {
  return getLanguageOptions()
})

const isLanguageConfigValid = computed(() => {
  return languageConfig.value.motherlanguage &&
         languageConfig.value.secondlanguage &&
         languageConfig.value.learninglanguage &&
         !Object.values(languageErrors.value).some(error => error)
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return true
    case 2:
      return isLanguageConfigValid.value
    case 3:
      return aiConfig.value.apiLink && aiConfig.value.apiKey && connectionStatus.value?.valid
    case 4:
      return true
    default:
      return false
  }
})

const importFileInput = ref<HTMLInputElement>()

// Methods
const validateLanguages = () => {
  // Clear previous errors
  languageErrors.value = {
    motherlanguage: '',
    secondlanguage: '',
    learninglanguage: ''
  }

  const languages = [
    { field: 'motherlanguage', value: languageConfig.value.motherlanguage },
    { field: 'secondlanguage', value: languageConfig.value.secondlanguage },
    { field: 'learninglanguage', value: languageConfig.value.learninglanguage }
  ]

  let isValid = true

  languages.forEach(({ field, value }) => {
    if (!value) {
      languageErrors.value[field as keyof typeof languageErrors.value] = 'Please select a language'
      isValid = false
    }
  })

  // Check for duplicates
  const selectedLanguages = Object.values(languageConfig.value).filter(Boolean)
  const uniqueLanguages = [...new Set(selectedLanguages)]
  
  if (selectedLanguages.length !== uniqueLanguages.length) {
    Object.keys(languageConfig.value).forEach(field => {
      const value = languageConfig.value[field as keyof typeof languageConfig.value]
      if (value && selectedLanguages.filter(lang => lang === value).length > 1) {
        languageErrors.value[field as keyof typeof languageErrors.value] = 'This language is already selected'
        isValid = false
      }
    })
  }

  return isValid
}

const getLanguageNameFunction = (code: string) => {
  return getLanguageName(code)
}

// Stepper helper methods
const getStepTitle = (step: number) => {
  const titles = ['', 'Welcome', 'Languages', 'AI Setup', 'Complete']
  return titles[step] || `Step ${step}`
}

const getStepDescription = (step: number) => {
  const descriptions = [
    '', 
    'Get started with Fjalor', 
    'Configure your languages', 
    'Set up AI translation', 
    'Review and finish'
  ]
  return descriptions[step] || ''
}

const testConnection = async () => {
  isTestingConnection.value = true
  connectionStatus.value = null

  try {
    // Create a complete settings object for API validation
    const testSettings = {
      ...languageConfig.value,
      ...aiConfig.value,
      selectedContext: 'general' // Add missing required property
    }
    
    // Create a test translation request to validate API configuration
    const testResult = await translationService.validateApiConfiguration(testSettings)
    
    connectionStatus.value = testResult
  } catch (error) {
    connectionStatus.value = { 
      valid: false, 
      error: (error as Error).message 
    }
  } finally {
    isTestingConnection.value = false
  }
}

const handleImportFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  isImporting.value = true
  importStatus.value = null

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const jsonContent = e.target?.result as string
      
      // Parse the imported data to populate form fields before importing
      const importedData = JSON.parse(jsonContent)
      const dataToImport = importedData.data || importedData
      
      // Populate language configuration if available
      if (dataToImport.settings) {
        languageConfig.value = {
          motherlanguage: dataToImport.settings.motherlanguage || '',
          secondlanguage: dataToImport.settings.secondlanguage || '',
          learninglanguage: dataToImport.settings.learninglanguage || ''
        }
        
        // Populate AI configuration if available
        aiConfig.value = {
          apiLink: dataToImport.settings.apiLink || 'https://openrouter.ai/api/v1/chat/completions',
          apiKey: dataToImport.settings.apiKey || '',
          aiModel: dataToImport.settings.aiModel || 'deepseek/deepseek-chat-v3.1:free'
        }
      }
      
      // Now import the data to storage
      const result = appDataService.importAllData(jsonContent)
      
      // Auto-test connection if API key is available
      if (aiConfig.value.apiKey) {
        setTimeout(() => {
          testConnection()
        }, 500)
      }
      
      importStatus.value = {
        success: result.success,
        message: result.success 
          ? `Imported successfully! Setup has been pre-filled!` 
          : result.error || 'Import failed'
      }
    } catch (error) {
      importStatus.value = {
        success: false,
        message: (error as Error).message
      }
    } finally {
      isImporting.value = false
    }
  }

  reader.onerror = () => {
    importStatus.value = {
      success: false,
      message: 'Error reading file'
    }
    isImporting.value = false
  }

  reader.readAsText(file)
}

const nextStep = () => {
  if (canProceed.value) {
    currentStep.value++
    
    // Auto-test connection when reaching AI configuration step
    if (currentStep.value === 3 && aiConfig.value.apiKey) {
      testConnection()
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeSetup = async () => {
  try {
    // Save all configurations
    const settings = {
      ...appDataService.getSettings(),
      ...languageConfig.value,
      ...aiConfig.value,
      selectedContext: 'general' // Add missing required property
    }

    appDataService.updateSettings(settings)
    appDataService.markSetupCompleted()

    // Redirect to main app
    router.push('/')
  } catch (error) {
    console.error('Failed to complete setup:', error)
  }
}
</script>

<template>
  <div class="page-layout">
    <!-- Dark/Light Mode -->
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>
          Choose your preferred color theme
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <ToggleGroup
            v-model="theme"
            type="single"
            variant="outline"
            class="grid grid-cols-3 w-full"
          >
            <ToggleGroupItem value="light" class="w-full">
              <Icon icon="radix-icons:sun" class="mr-2 h-4 w-4" />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" class="w-full">
              <Icon icon="radix-icons:moon" class="mr-2 h-4 w-4" />
              Dark
            </ToggleGroupItem>
            <ToggleGroupItem value="auto" class="w-full">
              <Icon icon="radix-icons:desktop" class="mr-2 h-4 w-4" />
              Auto
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>

    <!-- Translation Languages -->
    <Card>
      <CardHeader>
        <CardTitle>Translation Languages</CardTitle>
        <CardDescription>
          Configure your preferred languages for translation
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-4">
          <div class="space-y-2">
            <Label for="mother-language">Mother Language</Label>
            <Select v-model="settings.motherlanguage">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select mother language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="lang in languageOptions" 
                  :key="lang.value" 
                  :value="lang.value"
                >
                  {{ lang.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="second-language">Second Language</Label>
            <Select v-model="settings.secondlanguage">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select second language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="lang in languageOptions" 
                  :key="lang.value" 
                  :value="lang.value"
                >
                  {{ lang.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="learning-language">Learning Language</Label>
            <Select v-model="settings.learninglanguage">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select learning language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="lang in languageOptions" 
                  :key="lang.value" 
                  :value="lang.value"
                >
                  {{ lang.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <!-- Language Journey Preview -->
        <Card class="mt-4">
          <CardHeader>
            <CardTitle class="text-base">Your Language Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-sm text-muted-foreground space-y-2">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-primary rounded-full mr-2"></div>
                <span>Mother Language: <strong>{{ getLanguageName(settings.motherlanguage) }}</strong></span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Second Language: <strong>{{ getLanguageName(settings.secondlanguage) }}</strong></span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span>Learning: <strong>{{ getLanguageName(settings.learninglanguage) }}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button @click="saveSettings" class="w-full mt-4">
          Save
        </Button>
      </CardContent>
    </Card>

    <!-- Context Management -->
    <Card>
      <CardHeader>
        <CardTitle>Context Management</CardTitle>
        <CardDescription>
          Manage translation contexts that define the tone and style of translations
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Add New Context -->
        <div class="space-y-4">
          <h4 class="text-lg font-medium">Add New Context</h4>
          <div class="space-y-2">
            <Label for="context-name">Context Name</Label>
            <InputGroup>
              <InputGroupInput 
                id="context-name"
                v-model="newContext.name"
                type="text"
                placeholder="e.g., Friendly, Formal, Hoch Deutsch"
                maxlength="50"
                class="w-full"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  v-if="newContext.name"
                  variant="ghost"
                  size="icon-sm"
                  @click="newContext.name = ''"
                  title="Clear context name"
                >
                  <XIcon class="size-4" />
                  <span class="sr-only">Clear context name</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
          
          <div class="space-y-2">
            <Label for="context-prompt">Context Prompt</Label>
            <InputGroup>
              <InputGroupTextarea 
                id="context-prompt"
                v-model="newContext.prompt"
                placeholder="e.g., Translate the text in a friendly, casual tone."
                rows="3"
                maxlength="500"
                class="w-full"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  v-if="newContext.prompt"
                  variant="ghost"
                  size="icon-sm"
                  @click="newContext.prompt = ''"
                  title="Clear context prompt"
                >
                  <XIcon class="size-4" />
                  <span class="sr-only">Clear context prompt</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
          
          <Button 
            @click="addContextHandler"
            :disabled="!newContext.name.trim() || !newContext.prompt.trim()"
            class="w-full"
          >
            Add Context
          </Button>
          
          <Alert v-if="contextMessage" :variant="contextMessage.type as 'default' | 'destructive'">
            <AlertDescription>
              {{ contextMessage.text }}
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        <!-- Existing Contexts -->
        <div class="space-y-4">
          <h4 class="text-lg font-medium">Existing Contexts</h4>
          <div v-if="allContexts.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">No contexts available. Add your first context above.</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="context in allContexts" 
              :key="context.name"
              class="flex items-start justify-between p-4 border rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="font-medium">{{ context.name }}</h4>
                  <Badge v-if="context.name === 'Expert'" variant="secondary">Default</Badge>
                </div>
                <p class="text-sm text-muted-foreground">{{ context.prompt }}</p>
              </div>
              <Button 
                v-if="context.name !== 'Expert'"
                variant="outline" 
                size="sm"
                @click="deleteContextHandler(context.name)"
              >
                <Icon icon="radix-icons:trash" class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- AI Configuration -->
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
        <CardDescription>
          Configure AI API for translations (OpenAI-compatible APIs)
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="api-link">API Link</Label>
          <InputGroup>
            <InputGroupInput 
              id="api-link"
              v-model="settings.apiLink"
              type="text"
              placeholder="Enter API endpoint URL"
              class="w-full"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                v-if="settings.apiLink"
                variant="ghost"
                size="icon-sm"
                @click="settings.apiLink = ''"
                title="Clear API link"
              >
                <XIcon class="size-4" />
                <span class="sr-only">Clear API link</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <p class="text-sm text-muted-foreground">
            Example: https://openrouter.ai/api/v1/chat/completions
          </p>
        </div>

        <div class="space-y-2">
          <Label for="api-key">API Key</Label>
          <InputGroup>
            <InputGroupInput 
              id="api-key"
              v-model="settings.apiKey"
              type="password"
              placeholder="Enter your API key"
              class="w-full"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                v-if="settings.apiKey"
                variant="ghost"
                size="icon-sm"
                @click="settings.apiKey = ''"
                title="Clear API key"
              >
                <XIcon class="size-4" />
                <span class="sr-only">Clear API key</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <p class="text-sm text-muted-foreground">
            Your API key will be stored securely in localStorage
          </p>
        </div>

        <div class="space-y-2">
          <Label for="ai-model">AI Model</Label>
          <InputGroup>
            <InputGroupInput 
              id="ai-model"
              v-model="settings.aiModel"
              type="text"
              placeholder="Enter model name"
              class="w-full"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                v-if="settings.aiModel"
                variant="ghost"
                size="icon-sm"
                @click="settings.aiModel = ''"
                title="Clear AI model"
              >
                <XIcon class="size-4" />
                <span class="sr-only">Clear AI model</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <p class="text-sm text-muted-foreground">
            Examples: gpt-3.5-turbo, gpt-4, claude-3-sonnet, gemini-pro
          </p>
        </div>
        
        <!-- Test Connection -->
        <div class="space-y-2">
          <!-- Offline Message -->

          
          <Button 
            @click="testConnection" 
            variant="outline" 
            class="w-full"
            :disabled="!settings.apiLink || !settings.apiKey || isTestingConnection || isOffline"
          >
            <Icon v-if="isTestingConnection" icon="radix-icons:reload" class="mr-2 h-4 w-4 animate-spin" />
            <Icon v-else icon="radix-icons:check" class="mr-2 h-4 w-4" />
            {{ isTestingConnection ? 'Testing...' : 'Test Connection' }}
          </Button>
          
          <div v-if="connectionStatus" :class="[
            'text-sm font-medium',
            connectionStatus.valid ? 'text-green-600' : 'text-red-600'
          ]">
            {{ connectionStatus.valid ? '✓ Connection successful' : '✗ ' + connectionStatus.error }}
          </div>
        </div>
        
        <Button @click="saveSettings" class="w-full mt-4">
          Save
        </Button>
      </CardContent>
    </Card>

    <!-- Data Management -->
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Import and export your data for backup and sharing
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Storage Usage Info -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Translations:</span>
                <span>{{ storageInfo.translations }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Routines:</span>
                <span>{{ storageInfo.routines }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Contexts:</span>
                <span>{{ storageInfo.contexts }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Storage size:</span>
                <span>{{ formatBytes(storageInfo.total) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Export Section -->
        <div class="space-y-4">
          <h4 class="text-lg font-medium">Export Data</h4>
          <div class="space-y-3">
            <Button @click="exportSettings" variant="outline" class="w-full">
              Export Settings (JSON)
            </Button>
            
            <Button @click="exportSavedTranslations" variant="outline" class="w-full">
              Export Translations (CSV)
            </Button>
            
            <Button @click="exportAllData" variant="outline" class="w-full">
              Export All Data (JSON)
            </Button>
          </div>
          
          <div class="space-y-2 text-sm text-muted-foreground">
            <p><strong>Settings:</strong> Exports languages, AI configuration, and all contexts.</p>
            <p><strong>Translations:</strong> Exports all saved translations as CSV file.</p>
            <p><strong>All Data:</strong> Complete backup including settings, translations, and contexts.</p>
          </div>
        </div>

        <Separator />

        <!-- Import Section -->
        <div class="space-y-4">
          <h4 class="text-lg font-medium">Import Data</h4>
          <div class="space-y-3">
            <Label for="settings-import">Import Settings (JSON)</Label>
            <div class="space-y-3">
              <Input 
                id="settings-import"
                type="file" 
                @change="handleSettingsImport"
                accept=".json"
                class="w-full"
              />
              <Button 
                @click="importSettings"
                :disabled="!settingsImportFile"
                variant="outline"
                class="w-full"
              >
                Import Settings
              </Button>
            </div>
            <p class="text-sm text-muted-foreground">
              Overwrites settings and contexts only. Preserves all translations.
            </p>
          </div>
          
          <div class="space-y-3">
            <Label for="all-data-import">Import All Data (JSON)</Label>
            <div class="space-y-3">
              <Input 
                id="all-data-import"
                type="file" 
                @change="handleAllDataImport"
                accept=".json"
                class="w-full"
              />
              <Button 
                @click="importAllData"
                :disabled="!allDataImportFile"
                variant="outline"
                class="w-full"
              >
                Import All Data
              </Button>
            </div>
            <p class="text-sm text-destructive">
              ⚠️ Deletes and overwrites ALL existing data!
            </p>
          </div>
        </div>

        <Separator />

        <!-- Reset App Section -->
        <div class="space-y-4">
          <h4 class="text-lg font-medium">Reset Application</h4>
          <Button 
            @click="resetApp" 
            variant="destructive" 
            class="w-full"
          >
            <Icon icon="radix-icons:trash" class="mr-2 h-4 w-4" />
            Reset App
          </Button>
          <p class="text-sm text-muted-foreground">
            Delete all data and start fresh. This action cannot be undone.
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- App Information -->
    <Card>
      <CardHeader>
        <CardTitle>App Information</CardTitle>
        <CardDescription>
          Application details and version information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-4 text-sm">
          <div>
            <div class="font-medium mb-1 text-muted-foreground">Version</div>
            <div>1.0.0</div>
          </div>
          <div>
            <div class="font-medium mb-1 text-muted-foreground">Last Updated</div>
            <div>{{ formatDate(new Date()) }}</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Global Messages -->
    <div class="mt-8 space-y-4">
      <Alert v-if="saved" variant="default">
        <AlertDescription>Settings saved successfully!</AlertDescription>
      </Alert>
      
      <Alert v-if="error" variant="destructive">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
      
      <Alert v-if="exportMessage" :variant="exportMessage.type as 'default' | 'destructive'">
        <AlertDescription>{{ exportMessage.text }}</AlertDescription>
      </Alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { appDataService, type Settings } from '@/services/appDataService'
import { getAllContexts, addContext, deleteContext } from '@/services/contextService'
import type { ContextOption, ContextData } from '@/services/types'
import { historyService } from '@/services/historyService'
import { routinesService } from '@/services/routinesService'
import { getLanguageOptions } from '@/services/languageService'
import { useNetworkStatus } from '@/services/pwaService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group'
import { Icon } from '@iconify/vue'
import { X as XIcon } from 'lucide-vue-next'
import { useColorMode } from '@vueuse/core'

// Use VueUse color mode for reactive theme management
const colorMode = useColorMode()

// Network status
const { isOffline } = useNetworkStatus()

// Create a ref for theme toggle to ensure proper reactivity
const theme = ref('auto')

// Reactive data
const settings = ref<Settings>({} as Settings)
const saved = ref(false)
const error = ref<string | null>(null)
const exportMessage = ref<{ type: string; text: string } | null>(null)
const newContext = ref<ContextData>({ name: '', prompt: '' })
const contextMessage = ref<{ type: string; text: string } | null>(null)
const settingsImportFile = ref<File | null>(null)
const allDataImportFile = ref<File | null>(null)
const contexts = ref<ContextOption[]>([])
const isTestingConnection = ref(false)
const connectionStatus = ref<{ valid: boolean; error?: string } | null>(null)

// Computed properties
const languageOptions = getLanguageOptions()
const allContexts = computed(() => contexts.value)
const storageInfo = computed(() => {
  const translations = historyService.getHistoryTranslations().length
  const routines = routinesService.getRoutines().length
  const contexts = getAllContexts().length
  
  // Calculate approximate storage size
  let totalSize = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length
    }
  }
  
  return {
    translations,
    routines,
    contexts,
    total: totalSize
  }
})

// Helper function to get language name by code
const getLanguageName = (code: string) => {
  const language = languageOptions.find(lang => lang.value === code)
  return language ? language.label : code
}

// Helper function to format bytes
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper function to format date
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Methods
const saveSettings = () => {
  try {
    // Update settings using app data service
    const success = appDataService.updateSettings(settings.value)
    
    if (success) {
      saved.value = true
      error.value = null
      setTimeout(() => {
        saved.value = false
      },2000)
    } else {
      throw new Error('Failed to save settings to storage')
    }
  } catch (err) {
    error.value = 'Failed to save settings: ' + (err as Error).message
    setTimeout(() => {
      error.value = null
    }, 3000)
  }
}

const loadSettings = () => {
  settings.value = { ...appDataService.getSettings() }
}

const loadContexts = () => {
  try {
    contexts.value = getAllContexts()
  } catch (error) {
    console.error('Error loading contexts:', error)
    contexts.value = []
  }
}

const exportSavedTranslations = () => {
  try {
    const result = appDataService.exportTranslations()

    if (result.success && result.data) {
      // Create and download CSV file
      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `saved_translations_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      exportMessage.value = { type: 'default', text: 'Translations exported successfully!' }
    } else {
      exportMessage.value = { type: 'destructive', text: result.error || 'No saved translations to export.' }
    }
  } catch (error) {
    console.error('Export error:', error)
    exportMessage.value = { type: 'destructive', text: 'Failed to export translations.' }
  }

  // Clear message after 3 seconds
  setTimeout(() => {
    exportMessage.value = null
  }, 3000)
}

const addContextHandler = () => {
  try {
    const result = addContext(newContext.value)
    
    if (result.success) {
      contextMessage.value = { type: 'default', text: 'Context added successfully!' }
      newContext.value = { name: '', prompt: '' }
      
      // Reload contexts to update reactive data
      loadContexts()
    } else {
      contextMessage.value = { type: 'destructive', text: result.error || 'Failed to add context.' }
    }
  } catch (error) {
    console.error('Add context error:', error)
    contextMessage.value = { type: 'destructive', text: 'Failed to add context.' }
  }

  // Clear message after 3 seconds
  setTimeout(() => {
    contextMessage.value = null
  }, 3000)
}

const deleteContextHandler = (contextId: string) => {
  if (confirm('Are you sure you want to delete this context? This action cannot be undone.')) {
    try {
      const result = deleteContext(contextId)
      
      if (result.success) {
        contextMessage.value = { type: 'default', text: 'Context deleted successfully!' }
        
        // Reload contexts to update reactive data
        loadContexts()
      } else {
        contextMessage.value = { type: 'destructive', text: result.error || 'Failed to delete context.' }
      }
    } catch (error) {
      console.error('Delete context error:', error)
      contextMessage.value = { type: 'destructive', text: 'Failed to delete context.' }
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      contextMessage.value = null
    }, 3000)
  }
}

// New export/import methods
const exportSettings = () => {
  try {
    const result = appDataService.exportSettings()

    if (result.success && result.data) {
      // Create and download JSON file
      const blob = new Blob([result.data], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `fjalor_settings_${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      exportMessage.value = { type: 'default', text: 'Settings exported successfully!' }
    } else {
      exportMessage.value = { type: 'destructive', text: result.error || 'Failed to export settings.' }
    }
  } catch (error) {
    console.error('Settings export error:', error)
    exportMessage.value = { type: 'destructive', text: 'Failed to export settings.' }
  }

  setTimeout(() => {
    exportMessage.value = null
  }, 3000)
}

const exportAllData = () => {
  try {
    const result = appDataService.exportAllData()

    if (result.success && result.data) {
      // Create and download JSON file
      const blob = new Blob([result.data], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `fjalor_backup_${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      exportMessage.value = { type: 'default', text: 'All data exported successfully!' }
    } else {
      exportMessage.value = { type: 'destructive', text: result.error || 'Failed to export all data.' }
    }
  } catch (error) {
    console.error('All data export error:', error)
    exportMessage.value = { type: 'destructive', text: 'Failed to export all data.' }
  }

  setTimeout(() => {
    exportMessage.value = null
  }, 3000)
}

const handleSettingsImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  settingsImportFile.value = target.files?.[0] || null
}

const handleAllDataImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  allDataImportFile.value = target.files?.[0] || null
}

const importSettings = () => {
  if (!settingsImportFile.value) {
    exportMessage.value = { type: 'destructive', text: 'Please select a settings file to import.' }
    setTimeout(() => {
      exportMessage.value = null
    }, 3000)
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const jsonData = e.target?.result as string
      const result = appDataService.importSettings(jsonData)

      if (result.success) {
        exportMessage.value = { type: 'default', text: 'Settings imported successfully! Reloading page...' }
        settingsImportFile.value = null
        // Clear file input
        const fileInput = document.getElementById('settings-import') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        // Reload settings and contexts after a short delay
        setTimeout(() => {
          loadSettings()
          loadContexts()
        }, 1000)
      } else {
        exportMessage.value = { type: 'destructive', text: result.error || 'Failed to import settings.' }
      }
    } catch (error) {
      console.error('Settings import error:', error)
      exportMessage.value = { type: 'destructive', text: 'Failed to import settings file.' }
    }

    setTimeout(() => {
      exportMessage.value = null
    }, 3000)
  }

  reader.onerror = () => {
    exportMessage.value = { type: 'destructive', text: 'Failed to read the selected file.' }
    setTimeout(() => {
      exportMessage.value = null
    }, 3000)
  }

  reader.readAsText(settingsImportFile.value!)
}

const importAllData = () => {
  if (!allDataImportFile.value) {
    exportMessage.value = { type: 'destructive', text: 'Please select a backup file to import.' }
    setTimeout(() => {
      exportMessage.value = null
    }, 3000)
    return
  }

  if (!confirm('⚠️ WARNING: This will delete and overwrite ALL existing data including translations, settings, and contexts. This action cannot be undone. Are you sure you want to continue?')) {
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const jsonData = e.target?.result as string
      const result = appDataService.importAllData(jsonData)

      if (result.success) {
        exportMessage.value = { type: 'default', text: 'All data imported successfully! Reloading page...' }
        allDataImportFile.value = null
        // Clear file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>
        fileInputs.forEach(input => input.value = '')
        
        // Reload everything after a short delay
        setTimeout(() => {
          loadSettings()
          loadContexts()
        }, 1000)
      } else {
        exportMessage.value = { type: 'destructive', text: result.error || 'Failed to import all data.' }
      }
    } catch (error) {
      console.error('All data import error:', error)
      exportMessage.value = { type: 'destructive', text: 'Failed to import backup file.' }
    }

    setTimeout(() => {
      exportMessage.value = null
    }, 3000)
  }

  reader.onerror = () => {
    exportMessage.value = { type: 'destructive', text: 'Failed to read the selected file.' }
    setTimeout(() => {
      exportMessage.value = null
    }, 3000)
  }

  reader.readAsText(allDataImportFile.value!)
}

const testConnection = async () => {
  if (!settings.value.apiLink || !settings.value.apiKey) {
    connectionStatus.value = { valid: false, error: 'API Link and API Key are required' }
    return
  }

  isTestingConnection.value = true
  connectionStatus.value = null

  try {
    // Simple test request to validate API configuration
    const response = await fetch(settings.value.apiLink, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.value.apiKey}`
      },
      body: JSON.stringify({
        model: settings.value.aiModel || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
    })

    if (response.ok) {
      connectionStatus.value = { valid: true }
    } else {
      const errorData = await response.json().catch(() => ({}))
      connectionStatus.value = { 
        valid: false, 
        error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}` 
      }
    }
  } catch (error) {
    connectionStatus.value = { 
      valid: false, 
      error: (error as Error).message || 'Network error occurred' 
    }
  } finally {
    isTestingConnection.value = false
  }
}

// Reset app handler with two-step confirmation
const resetApp = () => {
  // Step 1: Initial confirmation
  if (!confirm('Are you sure you want to reset the app? This will delete all data and cannot be undone.')) {
    return
  }
  
  // Step 2: Final confirmation
  if (!confirm('This is your last chance. Are you absolutely sure you want to delete all data?')) {
    return
  }
  
  // Execute reset
  const result = appDataService.resetApp()
  if (result.success) {
    // Redirect to setup immediately
    window.location.href = '/setup'
  } else {
    error.value = result.error || 'Failed to reset app'
    setTimeout(() => {
      error.value = null
    }, 3000)
  }
}

// Initialize theme from storage on mount
onMounted(() => {
  const savedTheme = appDataService.getTheme()
  theme.value = savedTheme || 'auto'
  
  // Load settings and contexts from storage
  loadSettings()
  loadContexts()
})

// Watch theme ref changes and update storage and VueUse
watch(theme, (newTheme) => {
  // Update storage and VueUse when theme changes
  appDataService.updateTheme(newTheme)
  colorMode.value = newTheme as 'light' | 'dark' | 'auto'
})

</script>

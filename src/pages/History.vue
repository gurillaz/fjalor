<template>
  <div class="page-layout">
    <!-- View Toggle -->
    <Card>
      <CardContent class="">
        <div class="space-y-4">
          <!-- Search Bar -->
          

          <ToggleGroup
            v-model="currentView"
            type="single"
            variant="outline"
            class="grid grid-cols-2 w-full"
          >
            <ToggleGroupItem value="all" class="flex items-center gap-2 w-full">
              All History
              <Badge variant="secondary">{{ allTranslations.length }}</Badge>
            </ToggleGroupItem>
            <ToggleGroupItem value="saved" class="flex items-center gap-2 w-full">
              Saved Only
              <Badge variant="secondary">{{ savedTranslations.length }}</Badge>
            </ToggleGroupItem>
          </ToggleGroup>
<div class="relative">
            <Input
              v-model="searchQuery"
              placeholder="Search translations, languages, context, AI model..."
              class="w-full"
            />
          </div>
          <!-- Context Filter -->
          <ToggleSelector
            v-if="contextFilterOptions.length > 1"
            v-model="selectedContextFilter"
            :options="contextFilterOptions"
            :multiple="false"
            :show-label="true"
          />

  
        </div>
      </CardContent>
    </Card>

    <!-- Translations List -->
    <div v-if="displayedTranslations.length > 0" class="space-y-4">
      <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-foreground">
            {{ currentView === 'all' ? 'All History' : 'Saved Only' }} ({{ displayedTranslations.length }})
          </h2>
          <Button 
            @click="currentView === 'all' ? deleteAllTranslations() : exportTranslations()" 
            :variant="currentView === 'all' ? 'destructive' : 'default'"
            size="sm"
            :title="currentView === 'all' ? 'Delete all history' : 'Export saved translations'"
          >
            <Trash2 v-if="currentView === 'all'" class="h-4 w-4 mr-2" />
            <Download v-else class="h-4 w-4 mr-2" />
            {{ currentView === 'all' ? 'Delete All' : 'Export' }}
          </Button>
        </div>
      <TranslationCard
        v-for="translation in displayedTranslations"
        :key="translation.id || `${translation.timestamp}-${Math.random()}`"
        :id="translation.id"
        :source="translation.sourceText"
        :target1="translation.translation1"
        :target2="translation.translation2"
        :timestamp="translation.timestamp"
        :translationData="translation"
        :showSaveButton="true"
        :showDeleteButton="currentView === 'all'"
        @saved="onTranslationSaved"
        @deleted="onTranslationDeleted"
      />
    </div>

    <!-- Empty State -->
    <Card v-else>
      <CardContent class="pt-6">
        <div class="text-center space-y-4">
          <Alert v-if="currentView === 'saved'">
            <AlertTitle>No saved translations yet</AlertTitle>
            <AlertDescription>
              Save translations from your history to see them here.
            </AlertDescription>
          </Alert>
          <Alert v-else>
            <AlertTitle>No translation history yet</AlertTitle>
            <AlertDescription>
              Translate some text to see your history here.
            </AlertDescription>
          </Alert>
          
          <div class="flex justify-center">
            <Button
              v-if="currentView === 'saved' && allTranslations.length > 0"
              @click="currentView = 'all'"
              variant="outline"
              class="w-full sm:w-auto"
            >
              View All History
            </Button>
            <Button
              v-else
              @click="$router.push('/')"
              class="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Go to Translator
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TranslationCard from '@/components/TranslationCard.vue'
import ToggleSelector from '@/components/ToggleSelector.vue'
import { historyService, type Translation as TranslationType } from '@/services/historyService'
import { appDataService } from '@/services/appDataService'
import { getAllContexts } from '@/services/contextService'
import { Card, CardContent } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Trash2, Download } from 'lucide-vue-next'

const allTranslations = ref<TranslationType[]>([])
const savedTranslations = ref<TranslationType[]>([])
const currentView = ref<'all' | 'saved'>('saved')
const selectedContextFilter = ref<string>('all')
const searchQuery = ref<string>('')

// Generate context filter options
const contextFilterOptions = computed(() => {
  const allContexts = getAllContexts()
  const contextNames = allContexts.map((ctx: any) => ctx.name)
  
  // Create options array with "All", "User", "AI", then contexts alphabetically
  const options = [
    { value: 'all', label: 'All' },
    { value: 'user_input', label: 'User' },
    { value: 'ai_generated', label: 'AI' },
    ...contextNames
      .filter((name: any) => name) // Filter out empty context names
      .sort() // Sort alphabetically
      .map((name: any) => ({ value: name, label: name }))
  ]
  
  return options
})

// Filter translations based on view, context, and search
const displayedTranslations = computed(() => {
  let baseTranslations = currentView.value === 'saved' 
    ? savedTranslations.value 
    : allTranslations.value
  
  // Apply filter if not "all"
  if (selectedContextFilter.value !== 'all') {
    // Check if it's a type filter (user_input or ai_generated)
    if (selectedContextFilter.value === 'user_input' || selectedContextFilter.value === 'ai_generated') {
      baseTranslations = baseTranslations.filter(translation => 
        translation.type === selectedContextFilter.value
      )
    } else {
      // It's a context filter
      baseTranslations = baseTranslations.filter(translation => 
        translation.context === selectedContextFilter.value
      )
    }
  }
  
  // Apply search filter if search query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    baseTranslations = baseTranslations.filter(translation => {
      // Search in source text
      if (translation.sourceText?.toLowerCase().includes(query)) return true
      
      // Search in translation 1
      if (translation.translation1?.toLowerCase().includes(query)) return true
      
      // Search in translation 2
      if (translation.translation2?.toLowerCase().includes(query)) return true
      
      // Search in source language
      if (translation.sourceLanguage?.toLowerCase().includes(query)) return true
      
      // Search in target language 1
      if (translation.targetLanguage1?.toLowerCase().includes(query)) return true
      
      // Search in target language 2
      if (translation.targetLanguage2?.toLowerCase().includes(query)) return true
      
      // Search in context
      if (translation.context?.toLowerCase().includes(query)) return true
      
      // Search in AI model
      if (translation.aiModel?.toLowerCase().includes(query)) return true
      
      // Search in type
      if (translation.type?.toLowerCase().includes(query)) return true
      
      // Search in timestamp (formatted date)
      if (translation.timestamp) {
        const date = new Date(translation.timestamp)
        const dateStr = date.toLocaleDateString()
        const dateStrLower = dateStr.toLowerCase()
        if (dateStrLower.includes(query)) return true
      }
      
      return false
    })
  }
  
  return baseTranslations
})

const loadAllTranslations = () => {
  // Use centralized method to get all translation data
  const data = historyService.getAllTranslationData()
  allTranslations.value = data.allTranslations
  savedTranslations.value = data.savedTranslations
}

const onTranslationSaved = (_translationData: any) => {
  // Refresh() data when a translation is saved
  loadAllTranslations()
}

const onTranslationDeleted = (_translationId: string) => {
  // Refresh() data when a translation is deleted
  loadAllTranslations()
}

const deleteAllTranslations = () => {
  if (confirm('Are you sure you want to delete all translation history? This action cannot be undone.')) {
    const success = historyService.saveHistoryTranslations([])
    if (success) {
      loadAllTranslations()
      // You could add a toast notification here
    } else {
      alert('Failed to delete all translations')
    }
  }
}

const exportTranslations = () => {
  const result = appDataService.exportTranslations()
  if (result.success && result.data) {
    // Create a blob and download the file
    const blob = new Blob([result.data], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `translations-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    alert(result.error || 'Failed to export translations')
  }
}

onMounted(() => {
  loadAllTranslations()
})
</script>

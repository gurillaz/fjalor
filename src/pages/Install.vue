<template>
  <div class="page-layout">
    <div class="max-w-md mx-auto space-y-6">
      <!-- App Icon and Title -->
      <div class="text-center space-y-4">
        <div class="w-24 h-24 mx-auto rounded-full overflow-hidden shadow-2xl">
          <img src="/icon-192.png" alt="Fjalor Icon" class="w-full h-full object-cover" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-foreground">Install Fjalor</h1>
          <p class="text-muted-foreground mt-2">
                      Your intelligent translation companion for language learning.

          </p>
        </div>
      </div>

      <!-- Installation Required Notice -->
      <div class="flex items-center space-x-2 p-3 border border-primary/20 bg-primary/5 rounded-lg">
        <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Lock class="w-3 h-3 text-primary-foreground" />
        </div>
        <div>
          <h3 class="font-medium text-sm text-foreground">Installation Required</h3>
          <p class="text-xs text-muted-foreground">Fjalor can only be used after installing it as an app</p>
        </div>
      </div>

      <!-- Platform-Specific Instructions -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <Smartphone class="w-5 h-5" />
            <span>{{ instructions.title }}</span>
          </CardTitle>
          <CardDescription>
            Follow these steps to install Fjalor on your device
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-3">
            <div 
              v-for="(step, index) in instructions.steps" 
              :key="index"
              class="flex space-x-3"
            >
              <div class="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground">
                {{ index + 1 }}
              </div>
              <p class="text-sm text-foreground leading-relaxed">{{ step }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Benefits Section -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <Star class="w-5 h-5" />
            <span>Why Install Fjalor?</span>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex items-center space-x-3">
            <WifiOff class="w-4 h-4 text-muted-foreground" />
            <div>
              <p class="font-medium text-foreground">Offline Use</p>
              <p class="text-sm text-muted-foreground">Use Fjalor without internet connection</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <Zap class="w-4 h-4 text-muted-foreground" />
            <div>
              <p class="font-medium text-foreground">Faster Loading</p>
              <p class="text-sm text-muted-foreground">Instant startup and smooth performance</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <Smartphone class="w-4 h-4 text-muted-foreground" />
            <div>
              <p class="font-medium text-foreground">Native Experience</p>
              <p class="text-sm text-muted-foreground">Feels like a real app on your device</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <Lock class="w-4 h-4 text-muted-foreground" />
            <div>
              <p class="font-medium text-foreground">Exclusive Access</p>
              <p class="text-sm text-muted-foreground">Fjalor only works after installation</p>
            </div>
          </div>
        </CardContent>
      </Card>


      <!-- Installation Status -->
      <Card v-if="isInstalledPWA" class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent class="pt-6">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check class="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 class="font-semibold text-green-800 dark:text-green-200">Successfully Installed!</h3>
              <p class="text-sm text-green-600 dark:text-green-400">Fjalor is now installed on your device</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Refresh Button (only shown when installed) -->
      <div v-if="isInstalledPWA" class="text-center">
        <Button @click="refreshApp" class="w-full">
          <RefreshCw class="w-4 h-4 mr-2" />
          Start Using Fjalor
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePWAInstall } from '@/services/pwaService'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import Button from '@/components/ui/button/Button.vue'
import { 
  Lock, 
  Smartphone, 
  Star, 
  WifiOff, 
  Zap, 
  Share, 
  ChevronDown, 
  Plus, 
  Home, 
  Check, 
  RefreshCw 
} from 'lucide-vue-next'

const { 
  isInstalledPWA, 
  isIOS, 
  getInstallInstructions,
  markInstallationCompleted 
} = usePWAInstall()

const instructions = computed(() => getInstallInstructions.value)

const refreshApp = () => {
  // Mark installation as completed
  markInstallationCompleted()
  // Reload the app to start fresh
  window.location.reload()
}

onMounted(() => {
  // If already installed as PWA, mark installation as completed
  if (isInstalledPWA.value) {
    markInstallationCompleted()
  }
})
</script>

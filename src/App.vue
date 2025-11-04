<template>
  <div class="ios-safe-area bg-background font-sans antialiased no-copy-paste">
    <!-- iOS status bar for PWA -->
    <div class="ios-status-bar"></div>
    
    <main :class="shouldShowNavigation ? 'pb-20 pt-4 px-2' : 'pt-4 px-2'">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <Navigation v-if="shouldShowNavigation" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { usePWAInstall } from './services/pwaService'
import { appDataService } from './services/appDataService'
import Navigation from './components/Navigation.vue'

const route = useRoute()
const router = useRouter()
const mode = useColorMode()
const { isInstalledPWA } = usePWAInstall()

// Determine if navigation should be shown
const shouldShowNavigation = computed(() => {
  // Don't show navigation on install or setup pages
  if (route.path === '/install' || route.path === '/setup') {
    return false
  }
  
  // Only show navigation when running as installed PWA
  return isInstalledPWA.value
})

// Update theme-color meta tag based on current theme
const updateThemeColor = (theme: string) => {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  if (themeColorMeta) {
    // Set theme color based on current theme using exact CSS variable values
    const color = theme === 'dark' ? 'oklch(0.18 0.005 285.823)' : 'oklch(0.98 0 0)'
    themeColorMeta.setAttribute('content', color)
  }
}

// Watch for theme changes
watch(mode, (newTheme) => {
  updateThemeColor(newTheme as string)
}, { immediate: true })

onMounted(() => {
  // Initialize theme from localStorage or system preference
  const savedTheme = localStorage.getItem('vueuse-color-mode')
  if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
    mode.value = savedTheme as 'light' | 'dark' | 'auto'
  }

  // Update theme color on initial load
  updateThemeColor(mode.value as string)

  // PWA enforcement is now handled by router guards
  // No need for additional checks here
})
</script>

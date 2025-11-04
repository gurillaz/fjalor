<template>
 
  <nav 
    ref="navbar"
    class="fixed bottom-0 left-0 right-0 flex px-4 py-4 h-[100px] border-t bg-background/80 backdrop-blur-md sm:px-6 sm:py-4 z-50 items-start transition-transform duration-300 ease-in-out" 
    :class="{ 'translate-y-full': isHidden }"
  >
    <!-- Offline indicator - red dot with text -->
    <div v-if="isOffline" class="absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 z-10">
      <div class="w-2 h-2 bg-red-500 rounded-full"></div>
      <span class="text-xs text-red-500 font-medium">offline</span>
    </div>
    <!-- Settings -->
    <router-link to="/settings" class="flex-1 flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-accent transition-colors" :class="{ 'text-foreground': $route.path === '/settings' }">
      <Settings class="h-5 w-5" :class="$route.path === '/settings' ? 'text-foreground' : 'text-muted-foreground'" />
      <span class="text-xs font-medium" :class="$route.path === '/settings' ? 'text-foreground' : 'text-muted-foreground'">Settings</span>
    </router-link>

    <!-- History -->
    <router-link to="/history" class="flex-1 flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-accent transition-colors" :class="{ 'text-foreground': $route.path === '/history' }">
      <History class="h-5 w-5" :class="$route.path === '/history' ? 'text-foreground' : 'text-muted-foreground'" />
      <span class="text-xs font-medium" :class="$route.path === '/history' ? 'text-foreground' : 'text-muted-foreground'">History</span>
    </router-link>

    <!-- Routines -->
    <router-link to="/routines" class="flex-1 flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-accent transition-colors" :class="{ 'text-foreground': $route.path === '/routines' }">
      <ClipboardList class="h-5 w-5" :class="$route.path === '/routines' ? 'text-foreground' : 'text-muted-foreground'" />
      <span class="text-xs font-medium" :class="$route.path === '/routines' ? 'text-foreground' : 'text-muted-foreground'">Routines</span>
    </router-link>

    <!-- Translate -->
    <router-link to="/" class="flex-1 flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-accent transition-colors" :class="{ 'text-foreground': $route.path === '/' }">
      <Languages class="h-5 w-5" :class="$route.path === '/' ? 'text-foreground' : 'text-muted-foreground'" />
      <span class="text-xs font-medium" :class="$route.path === '/' ? 'text-foreground' : 'text-muted-foreground'">Translate</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Settings, History, ClipboardList, Languages } from 'lucide-vue-next'
import { useNetworkStatus } from '../services/pwaService'

// Network status
const { isOffline } = useNetworkStatus()

// Reactive state for navbar visibility
const isHidden = ref(false)
const lastScrollY = ref(0)
const scrollThreshold = 100 // Minimum scroll amount before hiding/showing

// Handle scroll events
const handleScroll = () => {
  const currentScrollY = window.scrollY
  
  // Only hide/show if scrolled past threshold
  if (Math.abs(currentScrollY - lastScrollY.value) > scrollThreshold) {
    // Scrolling down - hide navbar
    if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
      isHidden.value = true
    }
    // Scrolling up - show navbar
    else {
      isHidden.value = false
    }
    
    lastScrollY.value = currentScrollY
  }
}

onMounted(() => {
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll, { passive: true })
  lastScrollY.value = window.scrollY
})

onUnmounted(() => {
  // Clean up scroll event listener
  window.removeEventListener('scroll', handleScroll)
})
</script>

import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Network status service for detecting online/offline state
 * Uses browser's navigator.onLine API and listens for connection events
 */
export const useNetworkStatus = () => {
  const isOnline = ref(navigator.onLine)
  
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }
  
  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  })
  
  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  })
  
  return { 
    isOnline,
    isOffline: computed(() => !isOnline.value)
  }
}

/**
 * PWA installation detection and management service
 * Handles PWA installation status and provides installation guidance
 */
export const usePWAInstall = () => {
  const hasSeenInstructions = ref(false)
  
  // Check if app is running as installed PWA
  const isInstalledPWA = computed(() => {
    // Check for standalone display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    // Check for iOS standalone mode
    const isIOSStandalone = (window.navigator as any).standalone === true
    // Check for Android app referrer
    const isFromReferrer = document.referrer.includes('android-app://')
    
    return isStandalone || isIOSStandalone || isFromReferrer
  })
  
  // Check if user has completed installation
  const hasCompletedInstallation = computed(() => {
    return localStorage.getItem('pwa-installed') === 'true'
  })
  
  // Check if installation instructions should be shown
  const shouldShowInstallInstructions = computed(() => {
    return !isInstalledPWA.value && !hasCompletedInstallation.value
  })
  
  // Mark installation as completed
  const markInstallationCompleted = () => {
    localStorage.setItem('pwa-installed', 'true')
  }
  
  // Check if running on iOS Safari
  const isIOS = computed(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  })
  
  // Check if running on Android
  const isAndroid = computed(() => {
    return /Android/.test(navigator.userAgent)
  })
  
  // Check if running on desktop
  const isDesktop = computed(() => {
    return !isIOS.value && !isAndroid.value && !(/Mobi|Android/i.test(navigator.userAgent))
  })
  
  // Get platform-specific installation instructions
  const getInstallInstructions = computed(() => {
    if (isIOS.value) {
      return {
        title: 'Install on iPhone/iPad',
        steps: [
          'Tap the Share button (square with arrow)',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install Fjalor on your home screen',
          'Open Fjalor from your home screen to start using it'
        ],
        icon: 'share',
        platform: 'iOS Safari'
      }
    } else if (isAndroid.value) {
      return {
        title: 'Install on Android',
        steps: [
          'Tap the menu button (three dots)',
          'Tap "Install app" or "Add to Home screen"',
          'Tap "Install" to add Fjalor to your home screen',
          'Open Fjalor from your home screen to start using it'
        ],
        icon: 'menu',
        platform: 'Chrome Android'
      }
    } else {
      return {
        title: 'Install on Desktop',
        steps: [
          'Click the install button in the address bar',
          'Or look for a download/install icon in the browser',
          'Follow the prompts to install Fjalor',
          'Open Fjalor from your applications to start using it'
        ],
        icon: 'download',
        platform: 'Desktop Browser'
      }
    }
  })
  
  return {
    isInstalledPWA,
    shouldShowInstallInstructions,
    hasCompletedInstallation,
    markInstallationCompleted,
    isIOS,
    isAndroid,
    isDesktop,
    getInstallInstructions
  }
}

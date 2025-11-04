import { createRouter, createWebHistory } from 'vue-router'
import Translator from '@/pages/Translator.vue'
import Results from '@/pages/Results.vue'
import Settings from '@/pages/Settings.vue'
import History from '@/pages/History.vue'
import Setup from '@/pages/Setup.vue'
import Routines from '@/pages/Routines.vue'
import RoutineForm from '@/pages/RoutineForm.vue'
import Install from '@/pages/Install.vue'
import { usePWAInstall } from '@/services/pwaService'
import { appDataService } from '@/services/appDataService'

const routes = [
  { path: '/install', component: Install },
  { path: '/setup', component: Setup },
  { path: '/', component: Translator },
  { path: '/results', component: Results },
  { path: '/settings', component: Settings },
  { path: '/history', component: History },
  { path: '/routines', component: Routines },
  { path: '/routines/new', component: RoutineForm },
  { path: '/routines/edit/:id', component: RoutineForm }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// PWA enforcement route guard
router.beforeEach((to, from, next) => {
  const { isInstalledPWA, shouldShowInstallInstructions } = usePWAInstall()
  
  // If trying to access any route other than /install and not running as PWA
  if (to.path !== '/install' && shouldShowInstallInstructions.value) {
    // Redirect to install page
    next('/install')
    return
  }
  
  // If accessing install page but already installed as PWA, redirect to setup or main app
  if (to.path === '/install' && isInstalledPWA.value) {
    // Check if setup is completed
    if (!appDataService.isSetupCompleted()) {
      next('/setup')
    } else {
      next('/')
    }
    return
  }
  
  // Normal route guard for setup (only applies when running as PWA)
  if (isInstalledPWA.value && to.path !== '/setup' && !appDataService.isSetupCompleted()) {
    next('/setup')
    return
  }
  
  next()
})

export default router

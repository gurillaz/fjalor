<template>
  <div class="toggle-selector">
    <label v-if="showLabel" class="toggle-selector-label text-sm font-medium mb-2 block">
      {{ label }}
    </label>
    <div class="toggle-selector-container">
      <div class="toggle-scroll-container">
        <!-- Single Selection: RadioGroup -->
        <RadioGroup 
          v-if="!multiple"
          :model-value="modelValue" 
          @update:model-value="handleSingleUpdate"
          :disabled="disabled"
          class="flex gap-2 min-w-max"
        >
          <RadioGroupPill 
            v-for="option in normalizedOptions" 
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled || disabled"
          >
            {{ option.label }}
          </RadioGroupPill>
        </RadioGroup>

        <!-- Multiple Selection: ToggleGroup -->
        <ToggleGroup 
          v-else
          :model-value="modelValue" 
          @update:model-value="handleMultipleUpdate"
          :disabled="disabled"
          type="multiple"
          class="flex gap-2 min-w-max"
        >
          <ToggleGroupItem 
            v-for="option in normalizedOptions" 
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled || disabled"
          >
            {{ option.label }}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Import shadcn-vue components
import { RadioGroup } from '@/components/ui/radio-group'
import { RadioGroupPill } from '@/components/ui/radio-group'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { ToggleGroupItem } from '@/components/ui/toggle-group'

// Interfaces
interface ToggleOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface ContextOption {
  name: string
  prompt: string
}

interface Props {
  modelValue: string | number | (string | number)[] | null
  options: ToggleOption[] | ContextOption[]
  multiple?: boolean
  disabled?: boolean
  showLabel?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  direction?: 'horizontal' | 'vertical'
  allowEmpty?: boolean
  minSelections?: number
  maxSelections?: number
}

interface Emits {
  'update:modelValue': [value: string | number | (string | number)[] | null]
  'change': [selectedOptions: ToggleOption[], value: string | number | (string | number)[] | null]
}

// Props and emits
const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  disabled: false,
  showLabel: false,
  size: 'md',
  direction: 'horizontal',
  allowEmpty: true
})

const emit = defineEmits<Emits>()

// Normalize options to handle both ToggleOption and ContextOption
const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if ('name' in option) {
      // ContextOption
      return {
        value: option.name,
        label: option.name,
        disabled: false
      } as ToggleOption
    } else {
      // ToggleOption
      return option as ToggleOption
    }
  })
})

// Handle single selection
const handleSingleUpdate = (value: string | number) => {
  const selectedOption = normalizedOptions.value.find(opt => opt.value === value)
  emit('update:modelValue', value)
  emit('change', selectedOption ? [selectedOption] : [], value)
}

// Handle multiple selection with validation
const handleMultipleUpdate = (payload: any) => {
  // Convert payload to array for multiple selection
  const values = Array.isArray(payload) ? payload : payload ? [payload] : []
  
  // Filter out invalid values and convert to string | number
  const filteredValues = values.filter((val): val is string | number => 
    typeof val === 'string' || typeof val === 'number'
  )
  
  // Validate min/max selections
  if (props.minSelections && filteredValues.length < props.minSelections) {
    return // Could emit validation error in future
  }
  if (props.maxSelections && filteredValues.length > props.maxSelections) {
    return // Could emit validation error in future
  }
  
  const selectedOptions = normalizedOptions.value.filter(opt => filteredValues.includes(opt.value))
  emit('update:modelValue', filteredValues)
  emit('change', selectedOptions, filteredValues)
}
</script>

<style scoped>
/* Hide scrollbar while maintaining scroll functionality */
.toggle-scroll-container {
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.toggle-scroll-container::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}

/* Component uses default shadcn-vue styling */
</style>

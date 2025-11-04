<script setup lang="ts">
import type { RadioGroupItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { RadioGroupItem as RadioGroupItemPrimitive, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-vue-next"

const props = defineProps<RadioGroupItemProps & {
  class?: HTMLAttributes["class"]
}>()

const delegatedProps = reactiveOmit(props, "class")
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <RadioGroupItemPrimitive
    v-slot="{ checked }"
    data-slot="radio-group-item"
    v-bind="forwardedProps"
    :class="cn(
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
  >
    <div
      :class="cn(
        'flex items-center justify-center',
        checked ? 'opacity-100' : 'opacity-0'
      )"
    >
      <CheckIcon class="h-3.5 w-3.5" />
    </div>
  </RadioGroupItemPrimitive>
</template>

<script setup lang="ts">
import type { RadioGroupItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { RadioGroupItem as RadioGroupItemPrimitive, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<RadioGroupItemProps & {
  class?: HTMLAttributes["class"]
}>()

const delegatedProps = reactiveOmit(props, "class")
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <RadioGroupItemPrimitive
    data-slot="radio-group-pill"
    v-bind="forwardedProps"
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-2 py-1 min-w-[60px] cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:hover:bg-primary/90 data-[state=checked]:border-primary data-[state=checked]:shadow-sm data-[state=checked]:shadow-primary/20',
      props.class
    )"
  >
    <slot />
  </RadioGroupItemPrimitive>
</template>

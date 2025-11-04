<script setup lang="ts">
import type { RadioGroupRootEmits, RadioGroupRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { RadioGroupRoot, useForwardPropsEmits } from "reka-ui"
import { provide } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<RadioGroupRootProps & {
  class?: HTMLAttributes["class"]
}>()
const emits = defineEmits<RadioGroupRootEmits>()

provide("radioGroup", props)

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <RadioGroupRoot
    v-slot="slotProps"
    data-slot="radio-group"
    v-bind="forwarded"
    :class="cn('grid gap-3', props.class)"
  >
    <slot v-bind="slotProps" />
  </RadioGroupRoot>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    pressed?: boolean;
    busy?: boolean;
  }>(),
  {
    variant: "secondary",
    size: "md",
    type: "button",
    disabled: false,
    pressed: undefined,
    busy: false,
  },
);

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand text-brand-contrast hover:opacity-90",
  secondary: "border border-control bg-surface-raised text-content hover:bg-surface-sunken",
  ghost: "text-content-muted hover:bg-surface-sunken hover:text-content",
  danger: "bg-danger text-brand-contrast hover:opacity-90",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm gap-1.5",
  md: "min-h-11 px-4 text-sm gap-2",
};

const classes = computed(() => [
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
  "disabled:cursor-not-allowed disabled:opacity-60",
  VARIANT_CLASSES[props.variant],
  SIZE_CLASSES[props.size],
]);
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || busy"
    :aria-pressed="pressed"
    :aria-busy="busy || undefined"
  >
    <slot />
  </button>
</template>

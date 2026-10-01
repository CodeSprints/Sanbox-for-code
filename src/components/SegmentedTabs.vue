<script setup lang="ts" generic="TValue extends string">
import { ref } from "vue";

const props = defineProps<{
  label: string;
  items: readonly { value: TValue; label: string; controls?: string }[];
  size?: "sm" | "md";
}>();

const model = defineModel<TValue>({ required: true });

const tabs = ref<HTMLButtonElement[]>([]);

function focusTab(index: number): void {
  const total = props.items.length;
  const target = (index + total) % total;
  const item = props.items[target];

  if (!item) {
    return;
  }

  model.value = item.value;
  tabs.value[target]?.focus();
}

function onKeydown(event: KeyboardEvent, index: number): void {
  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      event.preventDefault();
      focusTab(index + 1);
      break;
    case "ArrowLeft":
    case "ArrowUp":
      event.preventDefault();
      focusTab(index - 1);
      break;
    case "Home":
      event.preventDefault();
      focusTab(0);
      break;
    case "End":
      event.preventDefault();
      focusTab(props.items.length - 1);
      break;
    default:
      break;
  }
}
</script>

<template>
  <div
    role="tablist"
    :aria-label="label"
    class="inline-flex rounded-lg border border-control bg-surface-sunken p-1"
  >
    <button
      v-for="(item, index) in items"
      :key="item.value"
      ref="tabs"
      type="button"
      role="tab"
      :aria-selected="model === item.value"
      :aria-controls="item.controls"
      :tabindex="model === item.value ? 0 : -1"
      class="rounded-md font-medium transition-colors"
      :class="[
        size === 'sm' ? 'min-h-9 px-3 text-xs' : 'min-h-10 px-4 text-sm',
        model === item.value
          ? 'bg-surface-raised text-content shadow-sm'
          : 'text-content-muted hover:text-content',
      ]"
      @click="model = item.value"
      @keydown="onKeydown($event, index)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="TValue extends string">
import { useId } from "vue";

defineProps<{
  label: string;
  options: readonly { value: TValue; label: string }[];
  describedBy?: string;
  compact?: boolean;
}>();

const model = defineModel<TValue>({ required: true });

const selectId = useId();
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="selectId" class="text-xs font-medium text-content-muted">{{ label }}</label>
    <select
      :id="selectId"
      v-model="model"
      :aria-describedby="describedBy"
      class="min-h-11 rounded-lg border border-control bg-surface-raised px-3 py-2 text-sm text-content"
      :class="compact ? 'sm:min-w-40' : 'w-full'"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

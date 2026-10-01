<script setup lang="ts">
import { useId } from "vue";

defineProps<{
  label: string;
  description?: string;
}>();

const model = defineModel<boolean>({ required: true });

const descriptionId = useId();
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      type="button"
      role="switch"
      :aria-checked="model"
      :aria-describedby="description ? descriptionId : undefined"
      class="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-content"
      @click="model = !model"
    >
      <span
        aria-hidden="true"
        class="relative h-6 w-11 shrink-0 rounded-full border border-control transition-colors"
        :class="model ? 'bg-brand' : 'bg-surface-sunken'"
      >
        <span
          class="absolute top-0.5 h-4.5 w-4.5 rounded-full bg-surface-raised shadow transition-all"
          :class="model ? 'left-5.5' : 'left-0.5'"
        />
      </span>
      {{ label }}
    </button>
    <span v-if="description" :id="descriptionId" class="visually-hidden">{{ description }}</span>
  </div>
</template>

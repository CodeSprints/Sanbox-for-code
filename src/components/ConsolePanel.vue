<script setup lang="ts">
import { computed, ref } from "vue";

import BaseButton from "@/components/BaseButton.vue";
import SegmentedTabs from "@/components/SegmentedTabs.vue";
import type { ConsoleEntry } from "@/features/web-playground/preview-message";
import { useI18n } from "@/i18n";

const props = defineProps<{ entries: readonly ConsoleEntry[] }>();
const emit = defineEmits<{ clear: [] }>();

const { t } = useI18n();

type Filter = "all" | "error" | "warn" | "log";

const filter = ref<Filter>("all");

const filterItems = computed(() => [
  { value: "all" as const, label: t("console.all") },
  { value: "error" as const, label: t("console.errors") },
  { value: "warn" as const, label: t("console.warnings") },
  { value: "log" as const, label: t("console.logs") },
]);

const visible = computed(() =>
  props.entries.filter((entry) => {
    if (filter.value === "all") {
      return true;
    }

    if (filter.value === "log") {
      return entry.level === "log" || entry.level === "info";
    }

    return entry.level === filter.value;
  }),
);

const summary = computed(() =>
  t("console.summary", {
    errors: props.entries.filter((entry) => entry.level === "error").length,
    warnings: props.entries.filter((entry) => entry.level === "warn").length,
    logs: props.entries.filter((entry) => entry.level === "log" || entry.level === "info").length,
  }),
);

const LEVEL_CLASSES: Record<ConsoleEntry["level"], string> = {
  error: "text-danger",
  warn: "text-warning",
  info: "text-content",
  log: "text-content",
};

function formatTime(time: number): string {
  return new Date(time).toLocaleTimeString();
}
</script>

<template>
  <section class="panel min-h-40" :aria-label="t('console.title')">
    <header class="panel-header flex-wrap">
      <h3 class="panel-title">{{ t("console.title") }}</h3>
      <div class="flex flex-wrap items-center gap-2">
        <SegmentedTabs
          v-model="filter"
          size="sm"
          :label="t('console.filter')"
          :items="filterItems"
        />
        <BaseButton size="sm" variant="ghost" @click="emit('clear')">
          {{ t("console.clear") }}
        </BaseButton>
      </div>
    </header>

    <p class="border-b px-3 py-1 text-xs text-content-muted" aria-live="polite">{{ summary }}</p>

    <ol
      v-if="visible.length > 0"
      class="min-h-0 flex-1 overflow-auto font-mono text-xs"
      role="log"
      aria-live="polite"
    >
      <li
        v-for="entry in visible"
        :key="entry.id"
        class="flex gap-3 border-b border-line/60 px-3 py-1.5"
        :class="LEVEL_CLASSES[entry.level]"
      >
        <span class="shrink-0 text-content-muted">{{ formatTime(entry.time) }}</span>
        <span class="shrink-0 uppercase">{{ entry.level }}</span>
        <span class="whitespace-pre-wrap break-words">{{ entry.message }}</span>
      </li>
    </ol>

    <p v-else class="flex-1 p-3 text-sm text-content-muted">{{ t("console.empty") }}</p>
  </section>
</template>

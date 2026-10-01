<script setup lang="ts">
import { computed } from "vue";

import BaseSelect from "@/components/BaseSelect.vue";
import SegmentedTabs from "@/components/SegmentedTabs.vue";
import { useTheme, type ThemePreference } from "@/composables/useTheme";
import { useI18n, type Locale } from "@/i18n";
import type { WorkspaceMode } from "@/types/workspace";

const mode = defineModel<WorkspaceMode>("mode", { required: true });

const { t, locale, setLocale } = useI18n();
const { preference, setPreference } = useTheme();

const modeItems = computed(() => [
  { value: "web" as const, label: t("modes.web"), controls: "panel-web" },
  { value: "runner" as const, label: t("modes.runner"), controls: "panel-runner" },
]);

const themeOptions = computed(() => [
  { value: "system" as const, label: t("settings.themeSystem") },
  { value: "light" as const, label: t("settings.themeLight") },
  { value: "dark" as const, label: t("settings.themeDark") },
]);

const localeOptions = computed(() => [
  { value: "pl" as const, label: t("settings.languagePolish") },
  { value: "en" as const, label: t("settings.languageEnglish") },
]);

const themeModel = computed<ThemePreference>({
  get: () => preference.value,
  set: (value) => setPreference(value),
});

const localeModel = computed<Locale>({
  get: () => locale.value,
  set: (value) => setLocale(value),
});
</script>

<template>
  <header class="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:gap-6">
    <div class="flex items-center gap-3">
      <span
        aria-hidden="true"
        class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-brand-contrast font-bold"
      >
        CS
      </span>
      <div class="min-w-0">
        <h1 class="truncate text-base font-semibold">{{ t("app.name") }}</h1>
        <p class="truncate text-xs text-content-muted">{{ t("app.tagline") }}</p>
      </div>
    </div>

    <nav :aria-label="t('modes.label')" class="lg:ml-auto">
      <SegmentedTabs v-model="mode" :label="t('modes.label')" :items="modeItems" />
    </nav>

    <div class="flex flex-wrap items-end gap-3">
      <BaseSelect
        v-model="themeModel"
        :label="t('settings.theme')"
        :options="themeOptions"
        compact
      />
      <BaseSelect
        v-model="localeModel"
        :label="t('settings.language')"
        :options="localeOptions"
        compact
      />
    </div>
  </header>
</template>

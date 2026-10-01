<script setup lang="ts">
import { ref, watch } from "vue";

import AppHeader from "@/components/AppHeader.vue";
import CodeRunnerView from "@/components/CodeRunnerView.vue";
import StatusBar from "@/components/StatusBar.vue";
import WebPlaygroundView from "@/components/WebPlaygroundView.vue";
import { useTheme } from "@/composables/useTheme";
import { useI18n } from "@/i18n";
import { readStored, writeStored } from "@/platform/storage";
import { isWorkspaceMode, type WorkspaceMode } from "@/types/workspace";

const { t, locale } = useI18n();

useTheme();

const mode = ref<WorkspaceMode>(readStored<WorkspaceMode>("mode", "web", isWorkspaceMode));

watch(mode, (value) => writeStored("mode", value));

watch(
  locale,
  (value) => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = value;
      document.title = `${t("app.name")} — ${t("app.tagline")}`;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex h-dvh flex-col bg-surface text-content">
    <a href="#main-content" class="skip-link">
      {{ t("app.skipToContent") }}
    </a>

    <AppHeader v-model:mode="mode" />

    <main
      id="main-content"
      :aria-label="t('app.mainLabel')"
      class="flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      <section
        v-show="mode === 'web'"
        id="panel-web"
        role="tabpanel"
        :aria-label="t('modes.web')"
        :hidden="mode !== 'web'"
        class="flex min-h-0 flex-1 flex-col"
      >
        <WebPlaygroundView v-if="mode === 'web'" />
      </section>

      <section
        v-show="mode === 'runner'"
        id="panel-runner"
        role="tabpanel"
        :aria-label="t('modes.runner')"
        :hidden="mode !== 'runner'"
        class="flex min-h-0 flex-1 flex-col"
      >
        <CodeRunnerView v-if="mode === 'runner'" />
      </section>
    </main>

    <StatusBar />
  </div>
</template>

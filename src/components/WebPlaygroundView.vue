<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import BaseButton from "@/components/BaseButton.vue";
import BaseSelect from "@/components/BaseSelect.vue";
import BaseSwitch from "@/components/BaseSwitch.vue";
import CodeMirrorEditor from "@/components/CodeMirrorEditor.vue";
import ConsolePanel from "@/components/ConsolePanel.vue";
import FileExplorer from "@/components/FileExplorer.vue";
import PackagesPanel from "@/components/PackagesPanel.vue";
import PreviewSurface from "@/components/PreviewSurface.vue";
import SegmentedTabs from "@/components/SegmentedTabs.vue";
import { useMediaQuery } from "@/composables/useMediaQuery";
import { useRunShortcut } from "@/composables/useRunShortcut";
import { detectLanguage } from "@/features/languages/registry";
import { WORKSPACE_TEMPLATES } from "@/features/web-playground/templates";
import { UI_LIBRARY_CATALOG } from "@/features/web-playground/ui-libraries";
import type { UiLibrary } from "@/features/web-playground/workspace";
import { useI18n } from "@/i18n";
import { copyToClipboard } from "@/platform/runtime";
import { useWebPlaygroundStore } from "@/stores/web-playground";

type Pane = "editors" | "output";

const store = useWebPlaygroundStore();
const { t } = useI18n();
const { matches: isWide } = useMediaQuery("(min-width: 1024px)");

const pane = ref<Pane>("editors");
const sidePanel = ref<"files" | "packages">("files");
const announcement = ref("");

const templateOptions = computed(() =>
  WORKSPACE_TEMPLATES.map((template) => ({ value: template.id, label: template.label })),
);

const uiLibraryOptions = computed(() =>
  UI_LIBRARY_CATALOG.map((entry) => ({
    value: entry.value,
    label: entry.value === "none" ? t("web.uiLibraryNone") : entry.label,
  })),
);

const paneItems = computed(() => [
  { value: "editors" as const, label: t("web.editors"), controls: "web-editors" },
  { value: "output" as const, label: t("web.preview"), controls: "web-preview" },
]);

const sidePanelItems = computed(() => [
  { value: "files" as const, label: t("files.title") },
  { value: "packages" as const, label: t("packages.title") },
]);

const templateModel = computed<string>({
  get: () => store.workspace.templateId,
  set: (value) => store.applyTemplate(value),
});

const uiLibraryModel = computed<UiLibrary>({
  get: () => store.workspace.uiLibrary,
  set: (value) => store.setUiLibrary(value),
});

const autoRunModel = computed<boolean>({
  get: () => store.autoRun,
  set: (value) => store.setAutoRun(value),
});

const activePath = computed(() => store.activeFile?.path ?? "");
const activeLanguage = computed(() => detectLanguage(activePath.value));

const activeContent = computed<string>({
  get: () => store.activeFile?.content ?? "",
  set: (value) => store.updateActiveFile(value),
});

const activeDiagnostics = computed(() => store.diagnosticsFor(activePath.value));

const fileProblems = computed(() => {
  const errors = activeDiagnostics.value.filter((entry) => entry.severity === "error").length;
  const warnings = activeDiagnostics.value.filter((entry) => entry.severity === "warning").length;

  return errors + warnings === 0 ? t("editor.clean") : t("editor.problems", { errors, warnings });
});

const showEditors = computed(() => isWide.value || pane.value === "editors");
const showPreview = computed(() => isWide.value || pane.value === "output");

async function refresh(): Promise<void> {
  await store.refresh();
  announcement.value = t("web.previewUpdated");
}

async function copyDocument(): Promise<void> {
  const copied = await copyToClipboard(store.document);
  announcement.value = copied ? t("web.copied") : t("web.copyFailed");
}

useRunShortcut(() => {
  void refresh();
});

onMounted(() => {
  if (store.document.length === 0) {
    void store.refresh();
  }
});
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3 p-3">
    <div class="flex flex-wrap items-end gap-3">
      <BaseSelect
        v-model="templateModel"
        :label="t('web.template')"
        :options="templateOptions"
        compact
      />
      <BaseSelect
        v-model="uiLibraryModel"
        :label="t('web.uiLibrary')"
        :options="uiLibraryOptions"
        compact
      />
      <BaseSwitch
        v-model="autoRunModel"
        :label="t('web.autoRun')"
        :description="t('web.autoRunHint')"
      />
      <div class="flex flex-wrap gap-2">
        <BaseButton variant="primary" size="sm" :busy="store.building" @click="refresh">
          {{ store.building ? t("web.building") : t("web.run") }}
        </BaseButton>
        <BaseButton size="sm" @click="copyDocument">{{ t("web.copy") }}</BaseButton>
        <BaseButton variant="ghost" size="sm" @click="store.reset()">
          {{ t("web.reset") }}
        </BaseButton>
      </div>
    </div>

    <SegmentedTabs
      v-model="pane"
      class="self-start lg:hidden"
      size="sm"
      :label="t('modes.label')"
      :items="paneItems"
    />

    <div class="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[18rem_1fr_1fr]">
      <div v-show="showEditors" class="flex min-h-0 flex-col gap-2 lg:max-h-full">
        <SegmentedTabs
          v-model="sidePanel"
          class="self-start"
          size="sm"
          :label="t('files.title')"
          :items="sidePanelItems"
        />
        <FileExplorer v-show="sidePanel === 'files'" class="min-h-48 flex-1" />
        <PackagesPanel v-show="sidePanel === 'packages'" class="min-h-48 flex-1" />
      </div>

      <section
        v-show="showEditors"
        id="web-editors"
        class="panel min-h-72"
        :aria-label="t('editor.label', { name: activePath })"
      >
        <header class="panel-header">
          <h2 class="panel-title font-mono normal-case tracking-normal">{{ activePath }}</h2>
          <span class="rounded bg-surface-sunken px-2 py-0.5 text-[0.6875rem] text-content-muted">
            {{ activeLanguage.label }}
          </span>
        </header>

        <CodeMirrorEditor
          v-if="store.activeFile"
          :key="activePath"
          v-model="activeContent"
          :language="activeLanguage.id"
          :ariaLabelText="t('editor.label', { name: activePath })"
          :diagnostics="activeDiagnostics"
        />

        <footer class="flex items-center justify-between gap-2 border-t px-3 py-1.5">
          <p class="text-[0.6875rem] text-content-muted">{{ t("editor.tabHint") }}</p>
          <p
            class="text-[0.6875rem]"
            :class="activeDiagnostics.length > 0 ? 'text-danger' : 'text-content-muted'"
            aria-live="polite"
          >
            {{ fileProblems }}
          </p>
        </footer>
      </section>

      <div v-show="showPreview" id="web-preview" class="flex min-h-0 flex-col gap-3">
        <PreviewSurface class="flex-1" />
        <ConsolePanel
          class="h-56 shrink-0"
          :entries="store.consoleEntries"
          @clear="store.clearConsole()"
        />
      </div>
    </div>

    <p aria-live="polite" class="visually-hidden">{{ announcement }}</p>
  </div>
</template>

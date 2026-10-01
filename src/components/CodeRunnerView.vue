<script setup lang="ts">
import { computed, ref, useId } from "vue";

import BaseButton from "@/components/BaseButton.vue";
import BaseSelect from "@/components/BaseSelect.vue";
import CodeMirrorEditor from "@/components/CodeMirrorEditor.vue";
import SegmentedTabs from "@/components/SegmentedTabs.vue";
import { useMediaQuery } from "@/composables/useMediaQuery";
import { useRunShortcut } from "@/composables/useRunShortcut";
import { RUNNABLE_LANGUAGES } from "@/features/code-runner/languages";
import { detectLanguage } from "@/features/languages/registry";
import { useI18n, type MessageKey } from "@/i18n";
import { useCodeRunnerStore } from "@/stores/code-runner";

type Pane = "editors" | "output";

const store = useCodeRunnerStore();
const { t } = useI18n();
const { matches: isWide } = useMediaQuery("(min-width: 1024px)");

const pane = ref<Pane>("editors");
const showLibraries = ref(false);
const stdinId = useId();
const stdinHintId = useId();

const languageOptions = computed(() =>
  RUNNABLE_LANGUAGES.map((language) => ({ value: language.id, label: language.label })),
);

const paneItems = computed(() => [
  { value: "editors" as const, label: t("runner.source"), controls: "runner-source" },
  { value: "output" as const, label: t("runner.console"), controls: "runner-console" },
]);

const languageModel = computed<string>({
  get: () => store.language.id,
  set: (value) => store.selectLanguage(value),
});

const sourceModel = computed<string>({
  get: () => store.source,
  set: (value) => {
    store.source = value;
  },
});

const editorLanguage = computed(() => detectLanguage(store.language.filename).id);
const showEditors = computed(() => isWide.value || pane.value === "editors");
const showConsole = computed(() => isWide.value || pane.value === "output");

const statusMessage = computed(() => {
  switch (store.status) {
    case "running":
      return t("runner.running");
    case "succeeded":
      return t("runner.succeeded", {
        duration: store.lastResult?.durationMs ?? 0,
        code: store.lastResult?.exitCode ?? 0,
      });
    case "failed":
      return t("runner.failed", { code: store.lastResult?.exitCode ?? 1 });
    case "cancelled":
      return t("runner.cancelled");
    case "error":
      return t(`runner.errors.${store.errorCode ?? "unknown"}` as MessageKey);
    default:
      return t("runner.idle");
  }
});

const isFailure = computed(() => store.status === "failed" || store.status === "error");

function run(): void {
  void store.run();
}

useRunShortcut(run);
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3 p-3">
    <div class="flex flex-wrap items-end gap-3">
      <BaseSelect
        v-model="languageModel"
        :label="t('runner.language')"
        :options="languageOptions"
        compact
      />
      <div class="flex flex-wrap gap-2">
        <BaseButton variant="primary" size="sm" :busy="store.isRunning" @click="run">
          {{ store.isRunning ? t("runner.running") : t("runner.run") }}
        </BaseButton>
        <BaseButton v-if="store.isRunning" size="sm" @click="store.cancel()">
          {{ t("runner.cancel") }}
        </BaseButton>
        <BaseButton variant="ghost" size="sm" @click="store.reset()">
          {{ t("runner.reset") }}
        </BaseButton>
        <BaseButton
          v-if="store.availableLibraries.length > 0"
          size="sm"
          variant="ghost"
          :pressed="showLibraries"
          @click="showLibraries = !showLibraries"
        >
          {{ t("runner.libraries") }} ({{ store.activeLibraries.length }})
        </BaseButton>
      </div>
      <p class="text-xs text-content-muted">{{ t("runner.shortcut") }}</p>
    </div>

    <section
      v-if="showLibraries && store.availableLibraries.length > 0"
      class="panel max-h-72 shrink-0"
      :aria-label="t('runner.libraries')"
    >
      <header class="panel-header">
        <h2 class="panel-title">{{ t("runner.libraries") }}</h2>
        <p class="text-xs text-content-muted">
          {{ t("runner.selected", { count: store.activeLibraries.length }) }}
        </p>
      </header>
      <p class="border-b px-3 py-1.5 text-xs text-content-muted">{{ t("runner.librariesHint") }}</p>
      <ul class="grid min-h-0 flex-1 gap-1 overflow-auto p-2 sm:grid-cols-2 xl:grid-cols-3">
        <li
          v-for="entry in store.availableLibraries"
          :key="entry.id"
          class="flex items-start gap-2 rounded-lg border px-2 py-1.5"
        >
          <input
            :id="`library-${entry.id}`"
            type="checkbox"
            class="mt-1 size-4 shrink-0 accent-[var(--color-brand)]"
            :checked="store.activeLibraries.some((item) => item.id === entry.id)"
            @change="store.toggleLibrary(entry.id)"
          />
          <label :for="`library-${entry.id}`" class="min-w-0 flex-1 cursor-pointer">
            <span class="block truncate text-sm font-medium">{{ entry.name }}</span>
            <span class="block text-xs text-content-muted">{{ entry.summary }}</span>
          </label>
          <BaseButton
            size="sm"
            variant="ghost"
            :aria-label="`${t('runner.insert')}: ${entry.name}`"
            @click="store.insertSnippet(entry.id)"
          >
            +
          </BaseButton>
        </li>
      </ul>
    </section>

    <SegmentedTabs
      v-model="pane"
      class="self-start lg:hidden"
      size="sm"
      :label="t('modes.label')"
      :items="paneItems"
    />

    <div class="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
      <div v-show="showEditors" id="runner-source" class="flex min-h-0 flex-col gap-3">
        <section class="panel min-h-64 flex-1" :aria-label="t('runner.source')">
          <header class="panel-header">
            <h2 class="panel-title font-mono normal-case tracking-normal">
              {{ store.language.filename }}
            </h2>
            <span class="rounded bg-surface-sunken px-2 py-0.5 text-[0.6875rem] text-content-muted">
              {{ store.language.label }}
            </span>
          </header>
          <CodeMirrorEditor
            :key="store.language.id"
            v-model="sourceModel"
            :language="editorLanguage"
            :ariaLabelText="t('editor.label', { name: store.language.filename })"
            :diagnostics="store.diagnostics"
          />
        </section>

        <section
          v-if="store.manifest"
          class="panel h-40 shrink-0"
          :aria-label="t('runner.manifest')"
        >
          <header class="panel-header">
            <h2 class="panel-title font-mono normal-case tracking-normal">
              {{ store.manifest.path }}
            </h2>
          </header>
          <pre class="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs">{{
            store.manifest.content
          }}</pre>
        </section>

        <section class="panel h-32 shrink-0" :aria-label="t('runner.stdin')">
          <header class="panel-header">
            <h3 class="panel-title">
              <label :for="stdinId">{{ t("runner.stdin") }}</label>
            </h3>
          </header>
          <textarea
            :id="stdinId"
            v-model="store.stdin"
            :aria-describedby="stdinHintId"
            spellcheck="false"
            class="min-h-0 flex-1 resize-none bg-transparent p-3 font-mono text-[0.8125rem] text-content outline-none"
          />
          <p :id="stdinHintId" class="border-t px-3 py-1.5 text-[0.6875rem] text-content-muted">
            {{ t("runner.stdinHint") }}
          </p>
        </section>
      </div>

      <section
        v-show="showConsole"
        id="runner-console"
        class="panel min-h-72"
        :aria-label="t('runner.console')"
      >
        <header class="panel-header">
          <h2 class="panel-title">{{ t("runner.console") }}</h2>
          <p
            class="text-xs font-medium"
            :class="isFailure ? 'text-danger' : 'text-content-muted'"
            aria-live="polite"
          >
            {{ statusMessage }}
          </p>
        </header>
        <pre
          class="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-3 font-mono text-[0.8125rem] leading-relaxed"
          :class="isFailure ? 'text-danger' : 'text-content'"
          tabindex="0"
          role="log"
          aria-live="polite"
          >{{ store.output || statusMessage }}</pre>
      </section>
    </div>
  </div>
</template>

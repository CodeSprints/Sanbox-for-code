<script setup lang="ts">
import { computed } from "vue";

import BaseButton from "@/components/BaseButton.vue";
import { detectLanguage } from "@/features/languages/registry";
import { useI18n } from "@/i18n";
import { useWebPlaygroundStore } from "@/stores/web-playground";

const store = useWebPlaygroundStore();
const { t } = useI18n();

const files = computed(() =>
  store.workspace.files.map((file) => ({
    path: file.path,
    language: detectLanguage(file.path).label,
    isEntry: file.path === store.workspace.entry,
    errors: store.diagnostics.filter(
      (entry) => entry.file === file.path && entry.severity === "error",
    ).length,
  })),
);

function addFile(): void {
  const name = globalThis.prompt?.(t("files.addPrompt"), "component.ts");

  if (name && name.trim().length > 0) {
    store.addFile(name.trim());
  }
}

function renameFile(path: string): void {
  const name = globalThis.prompt?.(t("files.renamePrompt"), path);

  if (name && name.trim().length > 0) {
    store.rename(path, name.trim());
  }
}
</script>

<template>
  <section class="panel" :aria-label="t('files.title')">
    <header class="panel-header">
      <h3 class="panel-title">{{ t("files.title") }}</h3>
      <BaseButton size="sm" variant="ghost" @click="addFile">{{ t("files.add") }}</BaseButton>
    </header>

    <ul
      class="min-h-0 flex-1 overflow-auto p-1.5"
      :aria-label="t('files.count', { count: files.length })"
    >
      <li v-for="file in files" :key="file.path" class="flex items-center gap-1">
        <button
          type="button"
          class="flex min-h-10 flex-1 items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm"
          :class="
            file.path === store.activePath
              ? 'bg-brand text-brand-contrast'
              : 'text-content hover:bg-surface-sunken'
          "
          :aria-current="file.path === store.activePath ? 'true' : undefined"
          @click="store.selectFile(file.path)"
        >
          <span class="truncate font-mono text-xs">{{ file.path }}</span>
          <span
            v-if="file.isEntry"
            class="shrink-0 rounded bg-surface-sunken px-1 text-[0.625rem] text-content-muted"
          >
            {{ t("files.entryBadge") }}
          </span>
          <span v-if="file.errors > 0" class="ml-auto shrink-0 text-xs font-semibold text-danger">
            {{ file.errors }}
          </span>
        </button>

        <details class="relative">
          <summary
            class="grid min-h-10 w-8 cursor-pointer list-none place-items-center rounded-md text-content-muted hover:bg-surface-sunken"
            :aria-label="t('files.actionsFor', { name: file.path })"
          >
            <span aria-hidden="true">⋯</span>
          </summary>
          <div
            class="absolute right-0 z-20 mt-1 flex w-48 flex-col gap-1 rounded-lg border border-control bg-surface-raised p-1 shadow-lg"
          >
            <button
              type="button"
              class="min-h-9 rounded px-2 text-left text-sm hover:bg-surface-sunken"
              @click="renameFile(file.path)"
            >
              {{ t("files.rename") }}
            </button>
            <button
              type="button"
              class="min-h-9 rounded px-2 text-left text-sm hover:bg-surface-sunken"
              @click="store.setEntry(file.path)"
            >
              {{ t("files.makeEntry") }}
            </button>
            <button
              type="button"
              class="min-h-9 rounded px-2 text-left text-sm text-danger hover:bg-surface-sunken disabled:opacity-50"
              :disabled="file.isEntry"
              @click="store.deleteFile(file.path)"
            >
              {{ t("files.remove") }}
            </button>
          </div>
        </details>
      </li>
    </ul>
  </section>
</template>

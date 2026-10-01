import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

import type { BundleDiagnostic } from "@/features/web-playground/bundler";
import { buildPreview } from "@/features/web-playground/document-builder";
import type { ConsoleEntry, ConsoleLevel } from "@/features/web-playground/preview-message";
import { createWorkspace, DEFAULT_WORKSPACE } from "@/features/web-playground/templates";
import {
  missingDependencies,
  normalizePath,
  removeDependency,
  removeFile,
  renameFile,
  setDependency,
  uniquePath,
  upsertFile,
  UI_LIBRARIES,
  type UiLibrary,
  type WebWorkspace,
} from "@/features/web-playground/workspace";
import type { FileDiagnostic } from "@/features/languages/diagnostics";
import { readStored, writeStored } from "@/platform/storage";

export const DEVICE_PRESETS = ["responsive", "mobile", "tablet", "desktop"] as const;

export type DevicePreset = (typeof DEVICE_PRESETS)[number];

export const DEVICE_SIZES: Record<DevicePreset, { width: number; height: number } | null> = {
  responsive: null,
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1280, height: 800 },
};

const WORKSPACE_KEY = "web-workspace";
const AUTO_RUN_KEY = "web-auto-run";
const DEBOUNCE_MS = 450;
const MAX_CONSOLE_ENTRIES = 200;

function isWorkspace(value: unknown): value is WebWorkspace {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<WebWorkspace>;

  return (
    typeof candidate.entry === "string" &&
    typeof candidate.templateId === "string" &&
    Array.isArray(candidate.files) &&
    candidate.files.every(
      (file) => typeof file?.path === "string" && typeof file?.content === "string",
    ) &&
    typeof candidate.dependencies === "object" &&
    candidate.dependencies !== null &&
    UI_LIBRARIES.includes(candidate.uiLibrary as UiLibrary)
  );
}

export const useWebPlaygroundStore = defineStore("web-playground", () => {
  const workspace = ref<WebWorkspace>(
    readStored<WebWorkspace>(WORKSPACE_KEY, DEFAULT_WORKSPACE, isWorkspace),
  );
  const autoRun = ref<boolean>(
    readStored<boolean>(
      AUTO_RUN_KEY,
      true,
      (value): value is boolean => typeof value === "boolean",
    ),
  );
  const activePath = ref<string>(workspace.value.entry);
  const document = ref<string>("");
  const diagnostics = ref<BundleDiagnostic[]>([]);
  const consoleEntries = ref<ConsoleEntry[]>([]);
  const building = ref(false);
  const lastBuiltAt = ref(0);
  const buildDurationMs = ref(0);
  const devicePreset = ref<DevicePreset>("responsive");

  let debounceHandle: ReturnType<typeof setTimeout> | null = null;
  let consoleCounter = 0;

  const activeFile = computed(
    () =>
      workspace.value.files.find((file) => file.path === activePath.value) ??
      workspace.value.files[0],
  );

  const errorCount = computed(
    () => diagnostics.value.filter((entry) => entry.severity === "error").length,
  );

  const warningCount = computed(
    () => diagnostics.value.filter((entry) => entry.severity === "warning").length,
  );

  const consoleErrorCount = computed(
    () => consoleEntries.value.filter((entry) => entry.level === "error").length,
  );

  const unresolvedDependencies = computed(() => missingDependencies(workspace.value));

  function diagnosticsFor(path: string): FileDiagnostic[] {
    return diagnostics.value
      .filter((entry) => entry.file === path)
      .map((entry) => ({
        line: entry.line,
        column: entry.column,
        message: entry.message,
        severity: entry.severity,
        source: "build",
      }));
  }

  async function refresh(): Promise<void> {
    building.value = true;

    try {
      const build = await buildPreview(workspace.value);
      document.value = build.document;
      diagnostics.value = build.diagnostics;
      buildDurationMs.value = build.durationMs;
      lastBuiltAt.value = Date.now();
    } finally {
      building.value = false;
    }
  }

  function scheduleRefresh(): void {
    if (debounceHandle) {
      clearTimeout(debounceHandle);
    }

    debounceHandle = setTimeout(() => {
      void refresh();
    }, DEBOUNCE_MS);
  }

  function selectFile(path: string): void {
    activePath.value = normalizePath(path);
  }

  function updateActiveFile(content: string): void {
    const file = activeFile.value;

    if (!file) {
      return;
    }

    workspace.value = upsertFile(workspace.value, file.path, content);
  }

  function addFile(path: string, content = ""): string {
    const target = uniquePath(workspace.value, path);
    workspace.value = upsertFile(workspace.value, target, content);
    activePath.value = target;

    return target;
  }

  function deleteFile(path: string): void {
    const next = removeFile(workspace.value, path);

    if (next !== workspace.value) {
      workspace.value = next;
      activePath.value = workspace.value.entry;
    }
  }

  function rename(from: string, to: string): void {
    workspace.value = renameFile(workspace.value, from, to);
    activePath.value = normalizePath(to);
  }

  function setEntry(path: string): void {
    workspace.value = { ...workspace.value, entry: normalizePath(path) };
  }

  function setUiLibrary(library: UiLibrary): void {
    workspace.value = { ...workspace.value, uiLibrary: library };
  }

  function addDependency(name: string, version: string): void {
    workspace.value = setDependency(workspace.value, name, version);
  }

  function dropDependency(name: string): void {
    workspace.value = removeDependency(workspace.value, name);
  }

  function applyTemplate(templateId: string): void {
    workspace.value = createWorkspace(templateId);
    activePath.value = workspace.value.entry;
    consoleEntries.value = [];
    void refresh();
  }

  function reset(): void {
    applyTemplate(workspace.value.templateId);
  }

  function pushConsoleEntry(level: ConsoleLevel, message: string, time = Date.now()): void {
    consoleCounter += 1;
    const entries = [...consoleEntries.value, { id: consoleCounter, level, message, time }];
    consoleEntries.value = entries.slice(-MAX_CONSOLE_ENTRIES);
  }

  function clearConsole(): void {
    consoleEntries.value = [];
  }

  function setAutoRun(value: boolean): void {
    autoRun.value = value;
    writeStored(AUTO_RUN_KEY, value);

    if (value) {
      scheduleRefresh();
    }
  }

  function setDevicePreset(preset: DevicePreset): void {
    devicePreset.value = preset;
  }

  watch(
    workspace,
    (value) => {
      writeStored(WORKSPACE_KEY, value);

      if (autoRun.value) {
        scheduleRefresh();
      }
    },
    { deep: true },
  );

  return {
    workspace,
    activePath,
    activeFile,
    autoRun,
    document,
    diagnostics,
    consoleEntries,
    building,
    lastBuiltAt,
    buildDurationMs,
    devicePreset,
    errorCount,
    warningCount,
    consoleErrorCount,
    unresolvedDependencies,
    diagnosticsFor,
    refresh,
    selectFile,
    updateActiveFile,
    addFile,
    deleteFile,
    rename,
    setEntry,
    setUiLibrary,
    addDependency,
    dropDependency,
    applyTemplate,
    reset,
    pushConsoleEntry,
    clearConsole,
    setAutoRun,
    setDevicePreset,
  };
});

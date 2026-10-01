import { defineStore } from "pinia";
import { computed, ref } from "vue";

import {
  DEFAULT_LANGUAGE,
  findLanguage,
  type RunnableLanguage,
} from "@/features/code-runner/languages";
import { librariesFor, manifestFor, type LanguageLibrary } from "@/features/code-runner/libraries";
import { parseOutputDiagnostics } from "@/features/code-runner/output-diagnostics";
import {
  ExecutionError,
  runCode,
  type ExecutionErrorCode,
  type RunResult,
} from "@/features/code-runner/runner";
import type { FileDiagnostic } from "@/features/languages/diagnostics";
import { readStored, writeStored } from "@/platform/storage";

export type RunnerStatus = "idle" | "running" | "succeeded" | "failed" | "cancelled" | "error";

const LANGUAGE_KEY = "runner-language";
const SOURCES_KEY = "runner-sources";
const LIBRARIES_KEY = "runner-libraries";

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}

export const useCodeRunnerStore = defineStore("code-runner", () => {
  const sources = ref<Record<string, string>>(
    readStored<Record<string, string>>(SOURCES_KEY, {}, isStringRecord),
  );
  const language = ref<RunnableLanguage>(
    findLanguage(
      readStored<string>(
        LANGUAGE_KEY,
        DEFAULT_LANGUAGE.id,
        (value): value is string => typeof value === "string",
      ),
    ),
  );
  const selectedLibraries = ref<Record<string, string[]>>(
    readStored<Record<string, string[]>>(
      LIBRARIES_KEY,
      {},
      (value): value is Record<string, string[]> =>
        typeof value === "object" &&
        value !== null &&
        Object.values(value).every(
          (entry) => Array.isArray(entry) && entry.every((item) => typeof item === "string"),
        ),
    ),
  );
  const stdin = ref("");
  const status = ref<RunnerStatus>("idle");
  const output = ref("");
  const errorCode = ref<ExecutionErrorCode | "unknown" | null>(null);
  const lastResult = ref<RunResult | null>(null);

  let controller: AbortController | null = null;
  let cancelRequested = false;

  const source = computed<string>({
    get: () => sources.value[language.value.id] ?? language.value.starter,
    set: (value: string) => {
      sources.value = { ...sources.value, [language.value.id]: value };
      writeStored(SOURCES_KEY, sources.value);
    },
  });

  const isRunning = computed(() => status.value === "running");

  const availableLibraries = computed<readonly LanguageLibrary[]>(() =>
    librariesFor(language.value.id),
  );

  const activeLibraries = computed<LanguageLibrary[]>(() => {
    const selected = selectedLibraries.value[language.value.id] ?? [];

    return availableLibraries.value.filter((entry) => selected.includes(entry.id));
  });

  const manifest = computed(() => manifestFor(language.value.id, activeLibraries.value));

  const diagnostics = computed<FileDiagnostic[]>(() => {
    if (output.value.length === 0) {
      return [];
    }

    return parseOutputDiagnostics(output.value, [language.value.filename]);
  });

  function toggleLibrary(id: string): void {
    const current = selectedLibraries.value[language.value.id] ?? [];
    const next = current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id];

    selectedLibraries.value = { ...selectedLibraries.value, [language.value.id]: next };
    writeStored(LIBRARIES_KEY, selectedLibraries.value);
  }

  function insertSnippet(libraryId: string): void {
    const entry = availableLibraries.value.find((item) => item.id === libraryId);

    if (!entry || source.value.includes(entry.snippet)) {
      return;
    }

    source.value = `${entry.snippet}\n${source.value}`;
  }

  function selectLanguage(id: string): void {
    language.value = findLanguage(id);
    writeStored(LANGUAGE_KEY, language.value.id);
    status.value = "idle";
    output.value = "";
    errorCode.value = null;
    lastResult.value = null;
  }

  function reset(): void {
    source.value = language.value.starter;
    stdin.value = "";
    status.value = "idle";
    output.value = "";
    errorCode.value = null;
    lastResult.value = null;
  }

  function cancel(): void {
    if (status.value === "running") {
      cancelRequested = true;
      status.value = "cancelled";
    }

    controller?.abort();
    controller = null;
  }

  async function run(): Promise<void> {
    cancel();
    cancelRequested = false;
    controller = new AbortController();
    status.value = "running";
    output.value = "";
    errorCode.value = null;

    try {
      const extra = manifest.value
        ? [{ name: manifest.value.path, content: manifest.value.content }]
        : [];
      const result = await runCode({
        language: language.value,
        source: source.value,
        stdin: stdin.value,
        extraFiles: extra,
        signal: controller.signal,
      });

      lastResult.value = result;
      output.value = result.output;
      status.value = result.failed ? "failed" : "succeeded";
    } catch (caught) {
      if (cancelRequested) {
        return;
      }

      errorCode.value = caught instanceof ExecutionError ? caught.code : "unknown";
      status.value = "error";
      lastResult.value = null;
    } finally {
      controller = null;
    }
  }

  return {
    language,
    source,
    stdin,
    selectedLibraries,
    availableLibraries,
    activeLibraries,
    manifest,
    diagnostics,
    toggleLibrary,
    insertSnippet,
    status,
    output,
    errorCode,
    lastResult,
    isRunning,
    selectLanguage,
    reset,
    run,
    cancel,
  };
});

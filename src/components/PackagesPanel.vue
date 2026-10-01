<script setup lang="ts">
import { computed, ref, useId } from "vue";

import BaseButton from "@/components/BaseButton.vue";
import {
  fetchLatestVersion,
  searchPackages,
  type PackageSummary,
} from "@/features/web-playground/dependencies";
import { useI18n } from "@/i18n";
import { useWebPlaygroundStore } from "@/stores/web-playground";

const store = useWebPlaygroundStore();
const { t } = useI18n();

const nameId = useId();
const versionId = useId();
const searchId = useId();
const statusId = useId();

const name = ref("");
const version = ref("latest");
const query = ref("");
const results = ref<PackageSummary[]>([]);
const searching = ref(false);
const status = ref("");

const dependencies = computed(() =>
  Object.entries(store.workspace.dependencies)
    .map(([key, value]) => ({ name: key, version: value }))
    .sort((a, b) => a.name.localeCompare(b.name, "en")),
);

async function addPackage(packageName = name.value, packageVersion = version.value): Promise<void> {
  const trimmed = packageName.trim();

  if (trimmed.length === 0) {
    return;
  }

  store.addDependency(trimmed, packageVersion.trim() || "latest");
  name.value = "";
  version.value = "latest";
  status.value = `${trimmed}@${packageVersion}`;
}

async function runSearch(): Promise<void> {
  if (query.value.trim().length === 0) {
    results.value = [];
    return;
  }

  searching.value = true;
  status.value = t("packages.searching");

  try {
    results.value = await searchPackages(query.value);
    status.value = results.value.length === 0 ? t("packages.noResults") : "";
  } catch {
    results.value = [];
    status.value = t("packages.failed");
  } finally {
    searching.value = false;
  }
}

async function addMissing(): Promise<void> {
  for (const missing of store.unresolvedDependencies) {
    try {
      store.addDependency(missing, await fetchLatestVersion(missing));
    } catch {
      store.addDependency(missing, "latest");
    }
  }
}
</script>

<template>
  <section class="panel" :aria-label="t('packages.title')">
    <header class="panel-header">
      <h3 class="panel-title">{{ t("packages.title") }}</h3>
    </header>

    <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3">
      <p class="text-xs text-content-muted">{{ t("packages.hint") }}</p>

      <form class="flex flex-wrap items-end gap-2" @submit.prevent="addPackage()">
        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <label :for="nameId" class="text-xs font-medium text-content-muted">
            {{ t("packages.name") }}
          </label>
          <input
            :id="nameId"
            v-model="name"
            type="text"
            autocomplete="off"
            class="min-h-11 rounded-lg border border-control bg-surface-raised px-3 text-sm"
          />
        </div>
        <div class="flex w-28 flex-col gap-1">
          <label :for="versionId" class="text-xs font-medium text-content-muted">
            {{ t("packages.version") }}
          </label>
          <input
            :id="versionId"
            v-model="version"
            type="text"
            autocomplete="off"
            class="min-h-11 rounded-lg border border-control bg-surface-raised px-3 text-sm"
          />
        </div>
        <BaseButton type="submit" variant="primary" size="sm">{{ t("packages.add") }}</BaseButton>
      </form>

      <form class="flex flex-wrap items-end gap-2" @submit.prevent="runSearch">
        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <label :for="searchId" class="text-xs font-medium text-content-muted">
            {{ t("packages.search") }}
          </label>
          <input
            :id="searchId"
            v-model="query"
            type="search"
            autocomplete="off"
            :aria-describedby="statusId"
            class="min-h-11 rounded-lg border border-control bg-surface-raised px-3 text-sm"
          />
        </div>
        <BaseButton type="submit" size="sm" :busy="searching">{{
          t("packages.search")
        }}</BaseButton>
      </form>

      <p :id="statusId" aria-live="polite" class="text-xs text-content-muted">{{ status }}</p>

      <ul v-if="results.length > 0" class="flex flex-col gap-1">
        <li
          v-for="result in results"
          :key="result.name"
          class="flex items-center gap-2 rounded-lg border px-2 py-1.5"
        >
          <span class="min-w-0 flex-1">
            <span class="block truncate font-mono text-xs"
              >{{ result.name }}@{{ result.version }}</span
            >
            <span class="block truncate text-xs text-content-muted">{{ result.description }}</span>
          </span>
          <BaseButton size="sm" @click="addPackage(result.name, result.version)">
            {{ t("packages.add") }}
          </BaseButton>
        </li>
      </ul>

      <div
        v-if="store.unresolvedDependencies.length > 0"
        class="rounded-lg border border-warning p-2"
      >
        <p class="text-xs text-content">
          {{ t("packages.missing", { names: store.unresolvedDependencies.join(", ") }) }}
        </p>
        <BaseButton class="mt-2" size="sm" @click="addMissing">
          {{ t("packages.addMissing") }}
        </BaseButton>
      </div>

      <ul v-if="dependencies.length > 0" class="flex flex-col gap-1">
        <li
          v-for="dependency in dependencies"
          :key="dependency.name"
          class="flex items-center gap-2 rounded-lg bg-surface-sunken px-2 py-1.5"
        >
          <span class="min-w-0 flex-1 truncate font-mono text-xs">
            {{ dependency.name }}@{{ dependency.version }}
          </span>
          <BaseButton
            size="sm"
            variant="ghost"
            :aria-label="`${t('packages.remove')}: ${dependency.name}`"
            @click="store.dropDependency(dependency.name)"
          >
            ✕
          </BaseButton>
        </li>
      </ul>
      <p v-else class="text-xs text-content-muted">{{ t("packages.empty") }}</p>
    </div>
  </section>
</template>

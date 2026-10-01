<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

import BaseButton from "@/components/BaseButton.vue";
import BaseSelect from "@/components/BaseSelect.vue";
import { isPreviewMessage } from "@/features/web-playground/preview-message";
import { useI18n } from "@/i18n";
import { DEVICE_PRESETS, DEVICE_SIZES, useWebPlaygroundStore } from "@/stores/web-playground";
import type { DevicePreset } from "@/stores/web-playground";

const store = useWebPlaygroundStore();
const { t } = useI18n();

const landscape = ref(false);

const presetOptions = computed(() =>
  DEVICE_PRESETS.map((preset) => ({ value: preset, label: t(`device.${preset}`) })),
);

const presetModel = computed<DevicePreset>({
  get: () => store.devicePreset,
  set: (value) => store.setDevicePreset(value),
});

const frameStyle = computed(() => {
  const size = DEVICE_SIZES[store.devicePreset];

  if (!size) {
    return { width: "100%", height: "100%" };
  }

  const width = landscape.value ? size.height : size.width;
  const height = landscape.value ? size.width : size.height;

  return { width: `${width}px`, height: `${height}px`, maxWidth: "100%", maxHeight: "100%" };
});

const buildStatus = computed(() => {
  if (store.building) {
    return t("web.building");
  }

  if (store.errorCount > 0) {
    return t("problems.errors", { count: store.errorCount });
  }

  return t("web.builtIn", { duration: store.buildDurationMs });
});

function onMessage(event: MessageEvent): void {
  if (isPreviewMessage(event.data)) {
    store.pushConsoleEntry(event.data.level, event.data.message, event.data.time);
  }
}

onMounted(() => {
  globalThis.addEventListener?.("message", onMessage);
});

onUnmounted(() => {
  globalThis.removeEventListener?.("message", onMessage);
});
</script>

<template>
  <section class="panel min-h-72" :aria-label="t('web.preview')">
    <header class="panel-header flex-wrap gap-2">
      <h2 class="panel-title">{{ t("web.preview") }}</h2>
      <div class="flex flex-wrap items-end gap-2">
        <BaseSelect
          v-model="presetModel"
          :label="t('device.label')"
          :options="presetOptions"
          compact
        />
        <BaseButton
          size="sm"
          variant="ghost"
          :pressed="landscape"
          :disabled="store.devicePreset === 'responsive'"
          @click="landscape = !landscape"
        >
          {{ t("device.rotate") }}
        </BaseButton>
      </div>
    </header>

    <p
      class="border-b px-3 py-1 text-xs"
      :class="store.errorCount > 0 ? 'text-danger' : 'text-content-muted'"
      aria-live="polite"
    >
      {{ buildStatus }}
      <span class="sr-only">
        {{
          t("device.orientation", {
            value: landscape ? t("device.landscape") : t("device.portrait"),
          })
        }}
      </span>
    </p>

    <div class="grid min-h-0 flex-1 place-items-center overflow-auto bg-surface-sunken p-2">
      <iframe
        :key="store.lastBuiltAt"
        :title="t('web.previewFrame')"
        :srcdoc="store.document"
        :style="frameStyle"
        sandbox="allow-scripts allow-modals allow-forms allow-popups"
        referrerpolicy="no-referrer"
        class="border-0 bg-white shadow-sm"
      />
    </div>
  </section>
</template>

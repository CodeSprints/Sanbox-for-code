<script setup lang="ts">
import { computed } from "vue";

import { useOnlineStatus } from "@/composables/useOnlineStatus";
import { useI18n } from "@/i18n";
import { detectPlatform, detectRuntimeTarget } from "@/platform/runtime";

const { t } = useI18n();
const { isOnline } = useOnlineStatus();

const platform = computed(() => detectPlatform());
const target = computed(() => detectRuntimeTarget());
const targetLabel = computed(() => t(`status.${target.value}`));
</script>

<template>
  <footer
    class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 text-xs text-content-muted"
  >
    <p>
      <span class="font-medium">{{ t("status.target") }}:</span> {{ targetLabel }}
    </p>
    <p>
      <span class="font-medium">{{ t("status.platform") }}:</span> {{ platform }}
    </p>
    <p class="flex items-center gap-1.5">
      <span
        aria-hidden="true"
        class="size-2 rounded-full"
        :class="isOnline ? 'bg-success' : 'bg-danger'"
      />
      <span>{{ isOnline ? t("status.online") : t("status.offline") }}</span>
    </p>
    <p v-if="!isOnline" class="text-danger">{{ t("status.offlineHint") }}</p>
  </footer>
</template>

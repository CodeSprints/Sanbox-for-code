import { onMounted, onUnmounted, ref } from "vue";

export function useOnlineStatus() {
  const isOnline = ref(globalThis.navigator?.onLine ?? true);

  function update(): void {
    isOnline.value = globalThis.navigator?.onLine ?? true;
  }

  onMounted(() => {
    globalThis.addEventListener?.("online", update);
    globalThis.addEventListener?.("offline", update);
  });

  onUnmounted(() => {
    globalThis.removeEventListener?.("online", update);
    globalThis.removeEventListener?.("offline", update);
  });

  return { isOnline };
}

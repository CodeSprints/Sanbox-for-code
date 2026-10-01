import { onMounted, onUnmounted } from "vue";

export function useRunShortcut(handler: () => void) {
  function onKeydown(event: KeyboardEvent): void {
    const isRunCombo = (event.ctrlKey || event.metaKey) && event.key === "Enter";
    const isSaveCombo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";

    if (!isRunCombo && !isSaveCombo) {
      return;
    }

    event.preventDefault();
    handler();
  }

  onMounted(() => {
    globalThis.addEventListener?.("keydown", onKeydown);
  });

  onUnmounted(() => {
    globalThis.removeEventListener?.("keydown", onKeydown);
  });
}

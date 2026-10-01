import { onUnmounted, ref } from "vue";

export function useMediaQuery(query: string) {
  const matches = ref(false);

  if (typeof globalThis.matchMedia !== "function") {
    return { matches };
  }

  const mediaQuery = globalThis.matchMedia(query);
  matches.value = mediaQuery.matches;

  const listener = (event: MediaQueryListEvent): void => {
    matches.value = event.matches;
  };

  mediaQuery.addEventListener("change", listener);

  onUnmounted(() => {
    mediaQuery.removeEventListener("change", listener);
  });

  return { matches };
}

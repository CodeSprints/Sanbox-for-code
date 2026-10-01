import type { UiLibrary } from "./workspace";

export interface UiLibraryEntry {
  value: UiLibrary;
  label: string;
}

export const UI_LIBRARY_CATALOG: readonly UiLibraryEntry[] = [
  { value: "none", label: "—" },
  { value: "tailwind", label: "Tailwind CSS 4" },
  { value: "bootstrap", label: "Bootstrap 5" },
  { value: "bulma", label: "Bulma" },
  { value: "pico", label: "Pico.css" },
  { value: "water", label: "Water.css" },
  { value: "fontawesome", label: "Font Awesome" },
  { value: "animate", label: "Animate.css" },
];

export const UI_LIBRARY_TAGS: Record<UiLibrary, string> = {
  none: "",
  tailwind: '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>',
  bootstrap: [
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">',
    '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>',
  ].join("\n"),
  bulma:
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css">',
  pico: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">',
  water: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">',
  fontawesome:
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css">',
  animate:
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css">',
};

# 06 — Accessibility

The project targets WCAG 2.2 level AA.

## Page structure

- A single `h1` with the application name. Panels use `h2` and `h3`.
- Landmarks: `header`, `nav`, `main` and `footer`.
- The first element in tab order is the **Skip to main content** link. It stays hidden until it receives focus.
- The document `lang` attribute changes together with the interface language.

## Keyboard operation

| Keys                        | Action                                         |
| --------------------------- | ---------------------------------------------- |
| Tab, Shift + Tab            | move between elements                          |
| arrow keys inside a tablist | change the working mode or panel               |
| Home, End                   | first and last tab                             |
| Tab inside an editor        | insert two spaces                              |
| Escape, then Tab            | leave the editor                               |
| Ctrl + Enter, Cmd + Enter   | refresh the preview or run the program         |
| Ctrl + S, Cmd + S           | same as above, without the browser save dialog |

There is no keyboard trap, because Escape releases the Tab handling inside the editor.

## Roles and names

- The mode switch uses the `tablist`, `tab` and `tabpanel` pattern. The active tab carries `aria-selected="true"` and `tabindex="0"`, the others `tabindex="-1"`.
- The auto refresh control has the `switch` role and an `aria-checked` attribute.
- Every form field has a label connected through the `for` attribute.
- Hints and counters are linked to their field with `aria-describedby`.
- The preview frame has a `title` attribute describing its content.

## Dynamic messages

| Event                   | Announcement                            |
| ----------------------- | --------------------------------------- |
| preview refreshed       | an `aria-live="polite"` region          |
| copied to the clipboard | an `aria-live="polite"` region          |
| program result          | the console with the `log` role         |
| execution in progress   | the `aria-busy` attribute on the button |

## Contrast and legibility

- Theme colours are written in the `oklch` space. Text and background pairs meet 4.5:1 for normal text and 3:1 for large text.
- Light and dark themes have separate token values.
- The interface never conveys information with colour alone. Error states also carry text.

## Focus and motion

- Every interactive element has a visible 3 pixel focus outline with a 2 pixel offset.
- Touch targets are at least 44 pixels tall, in line with success criterion 2.5.8.
- The `prefers-reduced-motion` rule disables animations and transitions.
- The `color-scheme` preference tells the system which theme is active.

## Verification

`tests/components/App.spec.ts` runs `axe-core` against the whole application tree with the `wcag2a`, `wcag2aa`, `wcag21a` and `wcag21aa` rule sets. The test fails if a single violation appears.

ESLint uses `eslint-plugin-vuejs-accessibility`, which catches common mistakes while the code is being written.

Automated tests do not replace manual checks. Before a release, walk through the application with the keyboard only and verify it with a screen reader.

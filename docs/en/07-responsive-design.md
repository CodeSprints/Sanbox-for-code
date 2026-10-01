# 07 — Responsive design

## Principles

- The design starts from the small screen layout. Rules for larger screens are added with the `lg` variant.
- There is no lower width limit. The layout works from 320 pixels.
- Instead of `100vh` the layout uses `100dvh`, so the mobile browser address bar does not cut the interface.
- The `viewport` tag includes `viewport-fit=cover`, which accounts for display cutouts.

## Breakpoints

| Width             | Layout                                                       |
| ----------------- | ------------------------------------------------------------ |
| below 1024 px     | one column; a tab switch selects editors or output           |
| 1024 px and above | two columns; editors and output are visible at the same time |

The breakpoint is read by the `useMediaQuery` function with the `(min-width: 1024px)` query. Components use the same value as the Tailwind classes, so layout and logic stay consistent.

## Element behaviour

| Element             | Small screen                 | Large screen             |
| ------------------- | ---------------------------- | ------------------------ |
| Header              | column, items wrap           | single row               |
| Mode tabs           | full width under the title   | right side of the header |
| Editors             | stacked, selected with a tab | left column              |
| Preview and console | selected with a tab          | right column             |
| Status bar          | wraps to several rows        | single row               |

## Touch

- Buttons and fields are at least 44 pixels tall.
- Spacing between elements is at least 8 pixels.
- The page does not block zooming. Users can magnify the view to 200 percent without losing content.
- `overscroll-behavior-y: none` prevents an accidental pull-to-refresh gesture.

## How to check

1. Run `npm run dev`.
2. Open developer tools and enable device mode.
3. Check widths of 320, 375, 768, 1024 and 1440 pixels.
4. Repeat the test in landscape orientation.
5. Set browser zoom to 200 percent and confirm that no horizontal scrolling appears.

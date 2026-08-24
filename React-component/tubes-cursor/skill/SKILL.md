---
name: tubes-cursor
description: Portable React WebGL tubes-cursor landing scene with logo DNA intro, dark/light theme, and click-to-randomize colors. Use when adding tubes cursor, threejs tube trails, or this coming-soon background.
---

# Tubes Cursor

Canonical source: this folder's `SKILL.md` plus `../manual.md`.

## Copy into a host app

1. Copy the **entire** `tubes-cursor/` folder (not individual files).
2. `npm install threejs-components@0.0.19`
3. Import `tubes-cursor.css` once in the root layout.
4. Load Montserrat 500/700.
5. Ensure the host layout has a defined height (`html, body, #root { height: 100%; }`).
6. Render `<TubesCursor />` from a client component.
7. Optional: copy `skill/` to `your-project/.cursor/skills/tubes-cursor/`.

## Public API

```ts
import { TubesCursor } from "./tubes-cursor";
import type { TubesCursorProps, Theme } from "./tubes-cursor";
```

Props (defaults in `../manual.md`): `title`, `subtitle`, `linkHref`, `linkLabel`, `logoDarkSrc`, `logoLightSrc`, `theme`, `defaultTheme`, `onThemeChange`, `storageKey`, `randomizeOnClick`, `showThemeToggle`, `className`.

Sample palettes: `TUBE_THEMES`, `tubeThemeFor`, `randomColors`.

## File map

| Path | Why it exists |
|------|----------------|
| `TubesCursor.tsx` | Markup + theme state |
| `useTubesScene.ts` | WebGL tubes + dispose |
| `useDnaSign.ts` | Canvas logo particles |
| `tubes-cursor.css` | `.tc-*` namespace |
| `data.ts` | Palettes and hex helpers |
| `assets/` | Default logos |

## Architecture rules (do not break)

- Theme is **`data-theme` on `.tc-root`**, never on `document.documentElement`. Host pages keep their own theme.
- Canvas / sign / theme button are **`position: absolute` inside `.tc-root`**, not `fixed` to the viewport, so the bundle can sit in a page section.
- CSS classes stay prefixed `tc-`. Do not restyle via unprefixed `h1`/`body`.
- Hero copy uses `pointer-events: none` so the tubes tracker receives pointer; links and `.tc-theme` re-enable hits.
- `.tc-theme` clicks must `stopPropagation` so they do not randomize colors.
- Init tubes inside `useEffect` and call `app.dispose()` on unmount (React Strict Mode remounts).
- Reduced motion: skip DNA, lock the logo visible.
- Do not import host Tailwind for layout; the CSS file is the source of layout.

## Common tasks

- Swap logos → `logoDarkSrc` / `logoLightSrc` (public URLs in Next.js).
- Disable click shuffle → `randomizeOnClick={false}`.
- Controlled theme → `theme` + `onThemeChange`.
- Hide credit link → `linkHref=""`.

## Verify

```bash
cd React-component
npm run build
```

Human setup: [manual.md](../manual.md)

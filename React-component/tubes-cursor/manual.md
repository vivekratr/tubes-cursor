# Tubes Cursor — setup

Copy this **entire folder** into a React/Next.js app. Do not pick files out of it.

```text
your-app/components/tubes-cursor/   ← this folder
```

## Folder contents

| File | Role |
|------|------|
| `TubesCursor.tsx` | Scene: WebGL tubes, logo DNA intro, hero copy, theme toggle |
| `tubes-cursor.css` | Scoped styles (`.tc-*`). No Tailwind required |
| `index.ts` | Public exports |
| `types.ts` / `data.ts` | Props, theme palettes, helpers |
| `useTubesScene.ts` | `threejs-components` tubes cursor |
| `useDnaSign.ts` | Logo particle intro + hover unzip |
| `assets/` | Default light/dark logos |
| `skill/SKILL.md` | Agent integration notes |

## Requirements

- React 18+ (client component)
- `threejs-components@0.0.19`
- Montserrat 500/700 (or override `font-family` on `.tc-root`)
- A host layout that gives the component a real height (the root uses `height: 100%` and `min-height: 100svh`)

## Install

```bash
npm install threejs-components@0.0.19
```

Copy:

```text
tubes-cursor/skill/  →  your-project/.cursor/skills/tubes-cursor/
```

## CSS

Import **once** in the app root (layout or `main.tsx`):

```ts
import "./tubes-cursor/tubes-cursor.css";
```

Add the font in `index.html` or the Next.js root layout:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap"
  rel="stylesheet"
/>
```

## Render

```tsx
import { TubesCursor } from "./tubes-cursor";

export default function Page() {
  return <TubesCursor />;
}
```

Next.js: render from a `"use client"` page/component. Dynamic-import the scene if you need to skip SSR of WebGL.

Give `html`, `body`, and the page wrapper `height: 100%` (see the demo `src/index.css`).

## Props

| Prop | Default | Notes |
|------|---------|--------|
| `title` | `"The solution"` | Hero h1 |
| `subtitle` | `"to all your worries"` | Hero h2 |
| `linkHref` / `linkLabel` | Framer credit | Set `linkHref` to `""` to hide |
| `logoDarkSrc` / `logoLightSrc` | bundled SVGs | Strings (public URLs) for Next.js |
| `theme` | uncontrolled | `"dark"` \| `"light"` |
| `defaultTheme` | `"dark"` | Uncontrolled initial theme |
| `onThemeChange` | — | Fires on toggle |
| `storageKey` | `"coming-soon-theme"` | `null` disables localStorage |
| `randomizeOnClick` | `true` | Click (except theme button) randomizes tube colors |
| `showThemeToggle` | `true` | |
| `className` | — | Extra class on `.tc-root` |

## Customize

- **Copy**: pass `title` / `subtitle` / link props.
- **Logos**: put files in `/public` and pass `logoDarkSrc="/logo-white.svg"`.
- **Tube palettes**: edit `TUBE_THEMES` in `data.ts` or call `randomColors` yourself.
- **Theme tokens**: CSS variables on `.tc-root[data-theme="dark"|"light"]`.

The tubes engine is CC BY-NC-SA 4.0 (Kevin Levron / `threejs-components`). Credit in the UI is the default `linkLabel`.

## Troubleshooting

- **Blank WebGL**: `threejs-components` not installed, or the component rendered on the server. Use a client component.
- **No height**: parent is `height: auto` with no `min-height`. Set `html, body, #root { height: 100%; }` or override `.tc-root { min-height: … }`.
- **CSS missing**: forgot the CSS import; classes are `tc-*` and will look unstyled.
- **Logo DNA missing**: `prefers-reduced-motion: reduce` skips particles and shows the logo immediately.
- **Theme fights the host page**: theme lives on `.tc-root`, not `<html>`.

## Demo in this repo

```bash
cd React-component
npm install
npm run dev
npm run build
```

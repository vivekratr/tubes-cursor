import type { Theme, TubeTheme } from "./types";

export const TUBE_THEMES: Record<Theme, TubeTheme> = {
  dark: {
    colors: ["#f967fb", "#53bc28", "#6958d5"],
    lights: {
      intensity: 200,
      colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"],
    },
  },
  light: {
    colors: ["#d400e8", "#168a2e", "#3b2fc9"],
    lights: {
      intensity: 340,
      colors: ["#00a152", "#e65100", "#c400d4", "#0d47a1"],
    },
  },
};

export const DEFAULT_COPY = {
  title: "The solution",
  subtitle: "to all your worries",
  linkHref: "https://www.framer.com/@kevin-levron/",
  linkLabel: "Framer Component",
} as const;

export const DEFAULT_STORAGE_KEY = "coming-soon-theme";

export function tubeThemeFor(theme: Theme): TubeTheme {
  switch (theme) {
    case "dark":
      return TUBE_THEMES.dark;
    case "light":
      return TUBE_THEMES.light;
    default: {
      const _exhaustive: never = theme;
      throw new Error(`Unknown theme: ${_exhaustive}`);
    }
  }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.trim().replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function randomColors(count: number): string[] {
  return Array.from({ length: count }, () =>
    `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`,
  );
}

export function themeFromEl(el: HTMLElement): Theme {
  return el.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function logoSrcFor(
  theme: Theme,
  logoDarkSrc: string,
  logoLightSrc: string,
): string {
  switch (theme) {
    case "light":
      return logoLightSrc;
    case "dark":
      return logoDarkSrc;
    default: {
      const _exhaustive: never = theme;
      throw new Error(`Unknown theme: ${_exhaustive}`);
    }
  }
}

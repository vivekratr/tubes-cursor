export type Theme = "dark" | "light";

export type TubeLights = {
  intensity: number;
  colors: readonly string[];
};

export type TubeTheme = {
  colors: readonly string[];
  lights: TubeLights;
};

export type TubesCursorProps = {
  title?: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
  logoDarkSrc?: string;
  logoLightSrc?: string;
  /** Controlled theme. Omit to manage theme inside the component. */
  theme?: Theme;
  defaultTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  /** localStorage key. Pass `null` to disable persistence. */
  storageKey?: string | null;
  randomizeOnClick?: boolean;
  showThemeToggle?: boolean;
  className?: string;
};

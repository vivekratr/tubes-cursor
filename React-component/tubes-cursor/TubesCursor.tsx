"use client";

import { useEffect, useRef, useState } from "react";
import logoLight from "./assets/logo.svg";
import logoDark from "./assets/logo-white.svg";
import { DEFAULT_COPY, DEFAULT_STORAGE_KEY, logoSrcFor } from "./data";
import type { Theme, TubesCursorProps } from "./types";
import { useDnaSign } from "./useDnaSign";
import { useTubesScene } from "./useTubesScene";

function readStoredTheme(key: string | null | undefined): Theme | null {
  if (key === null || typeof localStorage === "undefined") return null;
  const saved = localStorage.getItem(key ?? DEFAULT_STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return null;
}

export function TubesCursor({
  title = DEFAULT_COPY.title,
  subtitle = DEFAULT_COPY.subtitle,
  linkHref = DEFAULT_COPY.linkHref,
  linkLabel = DEFAULT_COPY.linkLabel,
  logoDarkSrc = logoDark,
  logoLightSrc = logoLight,
  theme: themeProp,
  defaultTheme = "dark",
  onThemeChange,
  storageKey = DEFAULT_STORAGE_KEY,
  randomizeOnClick = true,
  showThemeToggle = true,
  className,
}: TubesCursorProps) {
  const controlled = themeProp !== undefined;
  const [internal, setInternal] = useState<Theme>(defaultTheme);
  const theme = controlled ? themeProp : internal;

  useEffect(() => {
    if (controlled) return;
    const stored = readStoredTheme(storageKey);
    if (stored) setInternal(stored);
  }, [controlled, storageKey]);

  function setTheme(next: Theme) {
    if (!controlled) setInternal(next);
    if (storageKey !== null) localStorage.setItem(storageKey, next);
    onThemeChange?.(next);
  }

  const logoSrc = logoSrcFor(theme, logoDarkSrc, logoLightSrc);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLImageElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  useTubesScene(canvasRef, rootRef, randomizeOnClick);
  useDnaSign(rootRef, signRef, markRef, fieldRef, pulseRef, logoSrc);

  const rootClass = className ? `tc-root ${className}` : "tc-root";

  return (
    <div
      ref={rootRef}
      className={rootClass}
      data-theme={theme}
      style={{ ["--tc-logo-mask" as string]: `url("${logoSrc}")` }}
    >
      <canvas ref={canvasRef} className="tc-canvas" />

      <div ref={signRef} className="tc-sign">
        <img
          ref={markRef}
          className="tc-sign__mark"
          src={logoSrc}
          alt="Logo"
          width={762}
          height={256}
        />
        <canvas
          ref={fieldRef}
          className="tc-sign__field"
          aria-hidden="true"
        />
        <div ref={pulseRef} className="tc-sign__pulse" aria-hidden="true" />
      </div>

      <div className="tc-hero">
        <h1 className="tc-title">{title}</h1>
        <h2 className="tc-subtitle">{subtitle}</h2>
        {linkHref ? (
          <a href={linkHref} target="_blank" rel="noreferrer">
            {linkLabel}
          </a>
        ) : null}
      </div>

      {showThemeToggle ? (
        <button
          type="button"
          className="tc-theme"
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          onClick={(e) => {
            e.stopPropagation();
            setTheme(theme === "dark" ? "light" : "dark");
          }}
        >
          <svg
            className="tc-theme__icon tc-theme__icon--sun"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06" />
          </svg>
          <svg
            className="tc-theme__icon tc-theme__icon--moon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 14.3A8.5 8.5 0 1 1 9.7 3 7 7 0 0 0 21 14.3z" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export type { TubesCursorProps } from "./types";

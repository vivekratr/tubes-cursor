import { useEffect, type RefObject } from "react";
import { hexToRgb, randomColors, themeFromEl, tubeThemeFor } from "./data";
import type { TubesApp } from "threejs-components/build/cursors/tubes1.min.js";

function syncRendererBg(app: TubesApp, root: HTMLElement) {
  const { r, g, b } = hexToRgb(
    getComputedStyle(root).getPropertyValue("--tc-bg"),
  );
  app.three.renderer.setClearColor((r << 16) | (g << 8) | b, 1);
}

function syncTubesTheme(app: TubesApp, root: HTMLElement) {
  const cfg = tubeThemeFor(themeFromEl(root));
  app.tubes.setColors(cfg.colors);
  app.tubes.setLightsColors(cfg.lights.colors);
  app.tubes.setLightsIntensity(cfg.lights.intensity);
}

export function useTubesScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  rootRef: RefObject<HTMLElement | null>,
  randomizeOnClick: boolean,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    let disposed = false;
    let app: TubesApp | null = null;
    let observer: MutationObserver | null = null;

    const onClick = (e: MouseEvent) => {
      if (!randomizeOnClick || !app) return;
      if ((e.target as HTMLElement | null)?.closest(".tc-theme")) return;
      app.tubes.setColors(randomColors(3));
      app.tubes.setLightsColors(randomColors(4));
    };

    void import("threejs-components/build/cursors/tubes1.min.js").then(
      (mod) => {
        if (disposed || !canvas.isConnected) return;
        const create = mod.default;
        const cfg = tubeThemeFor(themeFromEl(root));
        app = create(canvas, {
          tubes: {
            colors: [...cfg.colors],
            lights: {
              intensity: cfg.lights.intensity,
              colors: [...cfg.lights.colors],
            },
          },
          bloom: { threshold: 0, strength: 1.5, radius: 0.5 },
        });
        syncRendererBg(app, root);
        observer = new MutationObserver(() => {
          if (!app) return;
          syncRendererBg(app, root);
          syncTubesTheme(app, root);
        });
        observer.observe(root, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
        root.addEventListener("click", onClick);
      },
    );

    return () => {
      disposed = true;
      observer?.disconnect();
      root.removeEventListener("click", onClick);
      app?.dispose();
    };
  }, [canvasRef, rootRef, randomizeOnClick]);
}

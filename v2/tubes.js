// Licence CC BY-NC-SA 4.0
// Attribution — You must give appropriate credit.
// Non Commercial — You may not use the material for commercial purposes.

import TubesCursor from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"

const TUBE_THEMES = {
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

function hexToRgb(hex) {
  const h = hex.trim().replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function syncRendererBg(app) {
  const renderer = app?.three?.renderer;
  if (!renderer) return;
  const { r, g, b } = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue("--bg"));
  renderer.setClearColor((r << 16) | (g << 8) | b, 1);
}

function syncTubesTheme(app) {
  const cfg = TUBE_THEMES[currentTheme()];
  app.tubes.setColors(cfg.colors);
  app.tubes.setLightsColors(cfg.lights.colors);
  app.tubes.setLightsIntensity(cfg.lights.intensity);
}

const app = TubesCursor(document.getElementById("canvas"), {
  tubes: TUBE_THEMES.dark,
  bloom: { threshold: 0, strength: 1.5, radius: 0.5 },
});

function syncTheme(app) {
  syncRendererBg(app);
  syncTubesTheme(app);
}

syncTheme(app);
new MutationObserver(() => syncTheme(app)).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});

document.body.addEventListener("click", (e) => {
  if (e.target.closest(".theme-toggle")) return;
  const colors = randomColors(3);
  const lightsColors = randomColors(4);
  console.log(colors, lightsColors);
  app.tubes.setColors(colors);
  app.tubes.setLightsColors(lightsColors);
});

function randomColors(count) {
  return new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));
}

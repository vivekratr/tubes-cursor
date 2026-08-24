const THEME_KEY = "coming-soon-theme";
const LOGO = {
  dark: "../public/logo-white.svg",
  light: "../public/logo.svg",
};

function logoSrcForTheme(theme) {
  return theme === "light" ? LOGO.light : LOGO.dark;
}

function resolveSrc(src) {
  return new URL(src, location.href).href;
}

function hexToRgb(hex) {
  const h = hex.trim().replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

let accents = {
  blue: hexToRgb("#2e7de0"),
  green: hexToRgb("#3ecf5f"),
  cyan: hexToRgb("#4fd1c5"),
};

function cacheAccents() {
  const cs = getComputedStyle(document.documentElement);
  accents = {
    blue: hexToRgb(cs.getPropertyValue("--accent-blue")),
    green: hexToRgb(cs.getPropertyValue("--accent-green")),
    cyan: hexToRgb(cs.getPropertyValue("--accent-cyan")),
  };
}

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function syncLogo(theme) {
  const mark = document.getElementById("logo");
  if (!mark) return;
  const src = logoSrcForTheme(theme);
  if (mark.src !== resolveSrc(src)) mark.src = src;
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  cacheAccents();
  syncToggle(theme);
  syncLogo(theme);
  if (dnaResample) dnaResample(logoSrcForTheme(theme));
}

function syncToggle(theme) {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  setTheme(saved === "light" ? "light" : "dark");
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  });
}

let dnaResample = null;

initTheme();

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mark = document.getElementById("logo");
if (!mark) {
  // ponytail: no logo node — skip DNA boot
} else if (reduce) {
  mark.classList.add("is-locked");
} else {
  boot();
}

function boot() {
  const field = document.getElementById("dna");
  const pulse = document.getElementById("pulse");
  if (!field || !pulse || !mark) return;
  const sign = field.parentElement;
  const ctx = field.getContext("2d", { alpha: true });
  const img = new Image();
  img.decoding = "async";

  function loadLogo(src) {
    return new Promise((resolve, reject) => {
      const resolved = resolveSrc(src);
      const finish = () => resolve(img);
      img.onload = finish;
      img.onerror = () => reject(new Error(`Failed to load ${src}`));
      if (img.src === resolved && img.complete && img.naturalWidth > 0) {
        finish();
        return;
      }
      img.src = src;
      if (img.complete && img.naturalWidth > 0) finish();
    });
  }

  loadLogo(logoSrcForTheme(currentTheme()))
    .then((loadedImg) => start(loadedImg, field, ctx, sign, mark, pulse, loadLogo))
    .catch(() => mark.classList.add("is-locked"));
}

function start(img, field, ctx, sign, mark, pulse, loadLogo) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const RADIUS = 168;
  const INTRO_END = 4.2;
  let particles = [];
  let bonds = [];
  let rays = [];
  let t0 = 0;
  let locked = false;
  let pulsed = false;
  let layout = null;
  let hover = null;
  let hole = 0;
  let looping = false;
  let lastTs = 0;

  function measure() {
    const rect = sign.getBoundingClientRect();
    const markRect = mark.getBoundingClientRect();
    field.width = Math.max(1, Math.round(rect.width * dpr));
    field.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout = {
      w: rect.width,
      h: rect.height,
      mx: markRect.left - rect.left,
      my: markRect.top - rect.top,
      mw: markRect.width,
      mh: markRect.height,
    };
  }

  function sample() {
    const { mw, mh, mx, my } = layout;
    const sw = Math.round(mw);
    const sh = Math.round(mh);
    const off = document.createElement("canvas");
    off.width = sw;
    off.height = sh;
    const octx = off.getContext("2d", { willReadFrequently: true });
    octx.drawImage(img, 0, 0, sw, sh);
    const { data } = octx.getImageData(0, 0, sw, sh);

    const step = Math.max(3, Math.round(Math.min(sw, sh) / 42));
    const pts = [];
    for (let y = 0; y < sh; y += step) {
      for (let x = 0; x < sw; x += step) {
        const i = (y * sw + x) * 4;
        if (data[i + 3] < 48) continue;
        pts.push({
          tx: mx + x,
          ty: my + y,
          r: data[i],
          g: data[i + 1],
          b: data[i + 2],
        });
      }
    }

    const cap = 240;
    if (pts.length > cap) {
      const keep = [];
      const stride = pts.length / cap;
      for (let i = 0; i < cap; i++) keep.push(pts[Math.floor(i * stride)]);
      pts.length = 0;
      pts.push(...keep);
    }

    const cx = mx + mw / 2;
    const cy = my + mh / 2;
    particles = pts.map((p) => {
      const greenBias = p.g > p.b;
      return {
        ...p,
        theta0: Math.atan2(p.ty - cy, p.tx - cx) + (Math.random() - 0.5) * 0.7,
        orbitR: Math.hypot(layout.w, layout.h) * (0.28 + Math.random() * 0.34),
        spin: (greenBias ? 1 : -1) * (Math.PI * (1.15 + Math.random() * 0.85)),
        delay: (p.tx - mx) / mw * 0.95 + Math.random() * 0.07,
        dur: 1.35 + Math.random() * 0.35,
        size: 0.7 + Math.random() * 0.85,
        unzip: 0,
        greenBias,
      };
    });

    bonds = [];
    for (let i = 0; i < particles.length; i++) {
      let best = -1;
      let bestD = 22;
      for (let j = i + 1; j < particles.length; j++) {
        const d = Math.hypot(particles[i].tx - particles[j].tx, particles[i].ty - particles[j].ty);
        if (d < bestD && d > 4) {
          bestD = d;
          best = j;
        }
      }
      if (best !== -1 && Math.random() < 0.62) bonds.push([i, best]);
    }

    rays = Array.from({ length: 10 }, (_, i) => {
      const p = particles[(i * 23) % particles.length];
      const ang = (i / 10) * Math.PI * 2 + 0.31;
      return {
        tx: p.tx,
        ty: p.ty,
        ox: cx + Math.cos(ang) * layout.w * 0.62,
        oy: cy + Math.sin(ang) * layout.h * 0.72,
        delay: 0.04 * i,
        green: i % 2 === 0,
      };
    });
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
  }

  function want(p) {
    if (!hover || !locked) return 0;
    const d = Math.hypot(p.tx - hover.x, p.ty - hover.y);
    const t = 1 - d / RADIUS;
    return t <= 0 ? 0 : t;
  }

  function posAt(p, elapsed) {
    const u = easeOut((elapsed - p.delay) / p.dur);
    const rem = Math.max(0, 1 - u);
    const z = p.unzip;
    const helix = p.theta0 + p.spin * (rem + z * 0.55);
    const rx = p.orbitR * rem + (70 + p.size * 22) * z;
    let x = p.tx + Math.cos(helix) * rx;
    let y = p.ty + Math.sin(helix) * rx * 0.52;
    if (z > 0 && hover) {
      const dx = p.tx - hover.x;
      const dy = p.ty - hover.y;
      const len = Math.hypot(dx, dy) || 1;
      x += (dx / len) * 96 * z;
      y += (dy / len) * 72 * z;
    }
    return { x, y, u, z };
  }

  function kick() {
    if (looping) return;
    looping = true;
    requestAnimationFrame(draw);
  }

  function pointerToSign(e) {
    const r = sign.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onMove(e) {
    if (!locked) return;
    hover = pointerToSign(e);
    const mr = mark.getBoundingClientRect();
    mark.style.setProperty("--hx", `${((e.clientX - mr.left) / mr.width) * 100}%`);
    mark.style.setProperty("--hy", `${((e.clientY - mr.top) / mr.height) * 100}%`);
    kick();
  }

  mark.addEventListener("pointermove", onMove);
  mark.addEventListener("pointerleave", () => {
    hover = null;
    kick();
  });

  function draw(now) {
    if (!t0) t0 = now;
    const dt = Math.min(0.032, (now - (lastTs || now)) / 1000);
    lastTs = now;
    const elapsed = (now - t0) / 1000;
    const { w, h } = layout;
    ctx.clearRect(0, 0, w, h);

    const follow = Math.min(1, dt * (hover ? 6 : 9));
    let unzipMax = 0;
    for (const p of particles) {
      p.unzip += (want(p) - p.unzip) * follow;
      if (p.unzip < 0.003) p.unzip = 0;
      if (p.unzip > unzipMax) unzipMax = p.unzip;
    }

    hole += ((hover && unzipMax > 0.04 ? RADIUS * 0.88 : 0) - hole) * follow;
    if (hole < 0.5) hole = 0;
    mark.style.setProperty("--hr", `${hole}px`);
    mark.classList.toggle("is-unzipping", hole > 2);

    const settled = particles.reduce((n, p) => n + (elapsed - p.delay > p.dur ? 1 : 0), 0);
    const ratio = particles.length ? settled / particles.length : 1;
    const intro = elapsed < INTRO_END;
    const alphaScale = currentTheme() === "light" ? 1.4 : 1;

    ctx.lineCap = "round";
    if (intro) {
      for (const ray of rays) {
        const u = easeOut((elapsed - ray.delay) / 1.2);
        if (u <= 0 || u >= 1) continue;
        ctx.beginPath();
        ctx.moveTo(ray.ox, ray.oy);
        ctx.lineTo(ray.ox + (ray.tx - ray.ox) * u, ray.oy + (ray.ty - ray.oy) * u);
        const c = ray.green ? accents.green : accents.blue;
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${(ray.green ? 0.18 : 0.2) * (1 - u) * alphaScale})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }

    ctx.lineWidth = 0.6;
    for (const [ia, ib] of bonds) {
      const a = posAt(particles[ia], elapsed);
      const b = posAt(particles[ib], elapsed);
      const z = Math.max(a.z, b.z);
      let alpha = 0;
      if (intro) {
        const vis = Math.min(a.u, b.u);
        if (vis > 0.08) {
          const fade = vis < 0.92 ? vis : Math.max(0, 1 - (elapsed - 2.35) * 1.4);
          alpha = Math.min(0.28, fade * 0.28);
        }
      }
      if (z > 0.05) alpha = Math.max(alpha, Math.min(0.42, z * 0.5));
      if (alpha <= 0.01) continue;
      const green = particles[ia].greenBias || particles[ib].greenBias;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      const c = green ? accents.green : accents.blue;
      ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha * alphaScale})`;
      ctx.stroke();
    }

    for (const p of particles) {
      const { x, y, u, z } = posAt(p, elapsed);
      let life = z;
      if (intro) {
        if (u <= 0) continue;
        const fade = u < 0.94 ? 1 : Math.max(0, 1 - (elapsed - 2.4) * 1.6);
        life = Math.max(life, fade);
      }
      if (life <= 0.02) continue;
      const a = (0.35 + 0.55 * Math.max(u, z)) * Math.min(1, life);
      ctx.beginPath();
      ctx.arc(x, y, p.size * (0.55 + 0.45 * z + 0.45 * (intro ? 1 - u * 0.4 : 0)), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${a})`;
      ctx.fill();
    }

    if (!locked && ratio > 0.72) {
      locked = true;
      mark.classList.add("is-locked");
    }
    if (!pulsed && ratio > 0.92 && elapsed > 2.15) {
      pulsed = true;
      pulse.classList.add("is-fire");
    }

    const busy = intro || hover || unzipMax > 0.01 || hole > 0.5;
    if (busy) requestAnimationFrame(draw);
    else looping = false;
  }

  measure();
  sample();
  kick();

  dnaResample = (src) => {
    const wasLocked = locked;
    loadLogo(src)
      .then(() => {
        measure();
        sample();
        if (!wasLocked) {
          t0 = 0;
          locked = false;
          pulsed = false;
          mark.classList.remove("is-locked");
          pulse.classList.remove("is-fire");
          hover = null;
          hole = 0;
        }
        kick();
      })
      .catch(() => mark.classList.add("is-locked"));
  };

  addEventListener("resize", () => {
    const wasLocked = locked;
    measure();
    sample();
    if (wasLocked) {
      locked = true;
      pulsed = true;
      mark.classList.add("is-locked");
    }
    hover = null;
    hole = 0;
    kick();
  });
}

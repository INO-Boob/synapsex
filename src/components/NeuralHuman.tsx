import { useEffect, useRef } from 'react';

// Человек, собранный из точек: поверхность тела, мозг и нервные пути.
// Горизонтальное движение мыши вращает фигуру и «прогоняет» сигналы
// по нервам — так же, как раньше мышь перематывала видео.

type Vec3 = [number, number, number];

interface Geometry {
  // x, y, z, nx, ny, nz для каждой точки поверхности
  surface: Float32Array;
  surfaceCount: number;
  brain: Float32Array;
  brainCount: number;
  nerves: { points: Vec3[]; lengths: number[]; total: number; speed: number; offset: number }[];
}

const SENSITIVITY = 0.8;
const FIGURE_HEIGHT = 8; // условные единицы: от стоп до макушки
const CAMERA = 16;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const mirror = (p: Vec3): Vec3 => [-p[0], p[1], p[2]];

function buildGeometry(): Geometry {
  const rand = mulberry32(7);
  const surface: number[] = [];
  const brain: number[] = [];

  const push = (p: Vec3, n: Vec3) => surface.push(p[0], p[1], p[2], n[0], n[1], n[2]);

  const capsule = (a: Vec3, b: Vec3, ra: number, rb: number, count: number) => {
    const axis = norm(sub(b, a));
    const helper: Vec3 = Math.abs(axis[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = norm(cross(axis, helper));
    const v = cross(axis, u);
    for (let i = 0; i < count; i++) {
      const t = rand();
      const r = ra + (rb - ra) * t;
      const ang = rand() * Math.PI * 2;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const n: Vec3 = [c * u[0] + s * v[0], c * u[1] + s * v[1], c * u[2] + s * v[2]];
      push(
        [a[0] + (b[0] - a[0]) * t + n[0] * r, a[1] + (b[1] - a[1]) * t + n[1] * r, a[2] + (b[2] - a[2]) * t + n[2] * r],
        n,
      );
    }
  };

  const ellipsoid = (c: Vec3, r: Vec3, count: number, keep?: (d: Vec3) => boolean) => {
    for (let i = 0; i < count; i++) {
      const d = norm([rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1]);
      if (keep && !keep(d)) continue;
      push(
        [c[0] + d[0] * r[0], c[1] + d[1] * r[1], c[2] + d[2] * r[2]],
        norm([d[0] / r[0], d[1] / r[1], d[2] / r[2]]),
      );
    }
  };

  // Торс: эллиптические срезы от таза до плеч
  const slices: [number, number, number][] = [
    [4.0, 0.7, 0.4],
    [4.4, 0.72, 0.4],
    [5.0, 0.58, 0.34],
    [5.6, 0.7, 0.42],
    [6.1, 0.8, 0.44],
    [6.5, 0.9, 0.36],
    [6.72, 0.42, 0.24],
  ];
  for (let i = 0; i < 2600; i++) {
    const y = slices[0][0] + rand() * (slices[slices.length - 1][0] - slices[0][0]);
    let k = 0;
    while (slices[k + 1][0] < y) k++;
    const [y0, w0, d0] = slices[k];
    const [y1, w1, d1] = slices[k + 1];
    const t = (y - y0) / (y1 - y0);
    const e = t * t * (3 - 2 * t);
    const w = w0 + (w1 - w0) * e;
    const d = d0 + (d1 - d0) * e;
    const ang = rand() * Math.PI * 2;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    push([c * w, y, s * d], norm([c / w, 0, s / d]));
  }
  ellipsoid([0, 4.02, 0], [0.7, 0.28, 0.4], 380, (d) => d[1] < 0.2);

  // Голова, шея, нос
  ellipsoid([0, 7.42, 0], [0.36, 0.5, 0.42], 1100);
  capsule([0, 6.68, -0.02], [0, 7.05, 0], 0.17, 0.16, 160);
  capsule([0, 7.48, 0.38], [0, 7.34, 0.49], 0.04, 0.07, 70);
  ellipsoid([0, 7.06, 0.24], [0.16, 0.1, 0.12], 70);

  // Руки и ноги — по правой стороне, левая зеркально
  const limbs = (side: 1 | -1) => {
    const m = (p: Vec3): Vec3 => (side === 1 ? p : mirror(p));
    capsule(m([0.84, 6.5, 0]), m([1.12, 5.22, -0.02]), 0.19, 0.14, 560);
    capsule(m([1.12, 5.22, -0.02]), m([1.27, 4.12, 0.06]), 0.14, 0.09, 440);
    ellipsoid(m([1.31, 3.82, 0.08]), [0.08, 0.27, 0.12], 160);
    ellipsoid(m([0.86, 6.5, 0]), [0.24, 0.2, 0.24], 180);
    capsule(m([0.37, 4.05, 0]), m([0.42, 2.18, 0.02]), 0.31, 0.17, 900);
    capsule(m([0.42, 2.18, 0.02]), m([0.4, 0.32, -0.04]), 0.17, 0.1, 640);
    capsule(m([0.4, 0.14, -0.06]), m([0.46, 0.08, 0.42]), 0.1, 0.08, 170);
  };
  limbs(1);
  limbs(-1);

  // Мозг — объём точек внутри черепа
  for (let i = 0; i < 900; i++) {
    const d: Vec3 = [rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1];
    if (d[0] * d[0] + d[1] * d[1] + d[2] * d[2] > 1) {
      i--;
      continue;
    }
    // складка между полушариями
    if (Math.abs(d[0]) < 0.06) continue;
    brain.push(d[0] * 0.3, 7.6 + d[1] * 0.26, -0.02 + d[2] * 0.34);
  }

  // Нервная система
  const raw: Vec3[][] = [];
  raw.push([[0, 7.35, -0.05], [0, 6.9, -0.12], [0, 6.0, -0.24], [0, 5.0, -0.18], [0, 4.15, -0.2]]);
  const sided = (path: Vec3[]) => {
    raw.push(path);
    raw.push(path.map(mirror));
  };
  sided([[0, 6.62, -0.14], [0.5, 6.56, -0.06], [0.86, 6.44, 0], [1.12, 5.22, 0], [1.27, 4.12, 0.06], [1.32, 3.64, 0.08]]);
  sided([[0, 4.2, -0.2], [0.34, 3.95, -0.05], [0.42, 2.18, 0.02], [0.4, 0.34, -0.02], [0.46, 0.1, 0.36]]);
  for (const y of [6.15, 5.8, 5.45, 5.1]) sided([[0, y, -0.22], [0.48, y - 0.06, -0.12], [0.62, y - 0.18, 0.22]]);
  sided([[0, 7.58, 0], [0.13, 7.5, 0.3], [0.16, 7.48, 0.38]]);
  sided([[0.86, 6.44, 0], [0.62, 6.1, 0.3], [0.3, 5.9, 0.42]]);

  const nerves = raw.map((path) => {
    const points: Vec3[] = [path[0]];
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      const steps = 6;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const j = s === steps ? 0 : 0.035;
        points.push([
          a[0] + (b[0] - a[0]) * t + (rand() - 0.5) * j,
          a[1] + (b[1] - a[1]) * t + (rand() - 0.5) * j,
          a[2] + (b[2] - a[2]) * t + (rand() - 0.5) * j,
        ]);
      }
    }
    const lengths = [0];
    for (let i = 1; i < points.length; i++) {
      const d = sub(points[i], points[i - 1]);
      lengths.push(lengths[i - 1] + Math.hypot(d[0], d[1], d[2]));
    }
    return { points, lengths, total: lengths[lengths.length - 1], speed: 0.55 + rand() * 0.5, offset: rand() };
  });

  return {
    surface: new Float32Array(surface),
    surfaceCount: surface.length / 6,
    brain: new Float32Array(brain),
    brainCount: brain.length / 3,
    nerves,
  };
}

function makeGlow(dpr: number) {
  const size = Math.round(28 * dpr);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(229,214,240,0.85)');
  grad.addColorStop(0.5, 'rgba(142,127,148,0.25)');
  grad.addColorStop(1, 'rgba(142,127,148,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

const ALPHA_LEVELS = 8;

interface NeuralHumanProps {
  revealed: boolean;
  className?: string;
}

export function NeuralHuman({ revealed, className }: NeuralHumanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealedRef = useRef(revealed);
  revealedRef.current = revealed;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const geo = buildGeometry();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let glow = makeGlow(1);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      glow = makeGlow(dpr);
      if (reduced) draw(performance.now());
    };

    let angle = 0.35;
    let target = 0.35;
    let phase = 0;
    let lastX: number | null = null;
    let lastMove = -Infinity;
    let revealStart: number | null = null;
    let prev = performance.now();

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (lastX !== null) {
        const dx = e.clientX - lastX;
        target += (dx / window.innerWidth) * SENSITIVITY * Math.PI;
      }
      lastX = e.clientX;
      lastMove = performance.now();
    };
    const onLeave = () => {
      lastX = null;
    };

    const buckets: number[][] = Array.from({ length: ALPHA_LEVELS }, () => []);

    function draw(now: number) {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      if (!reduced) {
        const idle = !finePointer || now - lastMove > 2500;
        if (idle) target += dt * 0.12;
        const step = (target - angle) * Math.min(1, dt * 6);
        angle += step;
        phase += dt * 0.16 + Math.abs(step) * 0.5;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Масштаб: фигура занимает ~88% высоты экрана, по центру
      const figurePx = Math.min(height * 0.88, width * 1.9) * dpr;
      const unit = figurePx / FIGURE_HEIGHT;
      const cx = (width / 2) * dpr;
      const baseY = (height * 0.08) * dpr + figurePx; // уровень стоп
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Сканирующее появление сверху вниз
      let revealY = -1;
      if (revealedRef.current) {
        if (revealStart === null) revealStart = now;
        const t = reduced ? 1 : Math.min(1, (now - revealStart) / 1800);
        const e = 1 - Math.pow(1 - t, 3);
        revealY = FIGURE_HEIGHT + 0.2 - e * (FIGURE_HEIGHT + 0.6);
      } else {
        revealY = FIGURE_HEIGHT + 1;
      }

      const project = (x: number, y: number, z: number) => {
        const rx = x * cos + z * sin;
        const rz = -x * sin + z * cos;
        const s = CAMERA / (CAMERA - rz);
        return [cx + rx * s * unit, baseY - y * s * unit, rz] as const;
      };

      // Поверхность тела: яркость по контуру (силуэт) и по глубине
      for (const b of buckets) b.length = 0;
      const S = geo.surface;
      for (let i = 0; i < geo.surfaceCount; i++) {
        const o = i * 6;
        const y = S[o + 1];
        if (y < revealY) continue;
        const nz = -S[o + 3] * sin + S[o + 5] * cos;
        const rim = 1 - Math.abs(nz);
        let a = 0.07 + 0.75 * rim * rim * rim + (nz > 0 ? 0.08 : 0);
        if (nz < 0) a *= 0.45;
        const [px, py] = project(S[o], y, S[o + 2]);
        const level = Math.min(ALPHA_LEVELS - 1, Math.floor(a * ALPHA_LEVELS));
        buckets[level].push(px, py);
      }
      const size = 1.15 * dpr;
      for (let l = 0; l < ALPHA_LEVELS; l++) {
        const pts = buckets[l];
        if (!pts.length) continue;
        ctx.fillStyle = `rgba(255,255,255,${((l + 0.6) / ALPHA_LEVELS).toFixed(3)})`;
        ctx.beginPath();
        for (let k = 0; k < pts.length; k += 2) ctx.rect(pts[k], pts[k + 1], size, size);
        ctx.fill();
      }

      // Нервы
      ctx.lineWidth = 0.9 * dpr;
      ctx.strokeStyle = 'rgba(142,127,148,0.55)';
      const projected = geo.nerves.map((n) => n.points.map((p) => project(p[0], p[1], p[2])));
      ctx.beginPath();
      geo.nerves.forEach((n, ni) => {
        const pp = projected[ni];
        let started = false;
        for (let k = 0; k < pp.length; k++) {
          if (n.points[k][1] < revealY) {
            started = false;
            continue;
          }
          if (!started) ctx.moveTo(pp[k][0], pp[k][1]);
          else ctx.lineTo(pp[k][0], pp[k][1]);
          started = true;
        }
      });
      ctx.stroke();

      ctx.globalCompositeOperation = 'lighter';

      // Мозг мерцает
      const B = geo.brain;
      ctx.fillStyle = 'rgb(217,204,227)';
      for (let i = 0; i < geo.brainCount; i++) {
        const y = B[i * 3 + 1];
        if (y < revealY) continue;
        const flicker = reduced ? 0.55 : 0.35 + 0.35 * Math.sin(now * 0.004 + i * 1.7) ** 2;
        const [px, py] = project(B[i * 3], y, B[i * 3 + 2]);
        ctx.globalAlpha = flicker;
        ctx.fillRect(px, py, size, size);
      }
      ctx.globalAlpha = 1;

      // Импульсы бегут от центра к периферии
      const g = glow.width;
      geo.nerves.forEach((n, ni) => {
        const head = ((phase * n.speed + n.offset) % 1) * n.total;
        for (let trail = 0; trail < 4; trail++) {
          const d = head - trail * 0.09;
          if (d < 0) break;
          let k = 1;
          while (k < n.lengths.length - 1 && n.lengths[k] < d) k++;
          const t = (d - n.lengths[k - 1]) / (n.lengths[k] - n.lengths[k - 1] || 1);
          const a = projected[ni][k - 1];
          const b = projected[ni][k];
          const y = n.points[k][1];
          if (y < revealY) break;
          const x = a[0] + (b[0] - a[0]) * t;
          const yy = a[1] + (b[1] - a[1]) * t;
          const depth = (a[2] + 1.2) / 2.4;
          ctx.globalAlpha = (1 - trail / 4) * (0.45 + 0.55 * Math.max(0, Math.min(1, depth)));
          const sz = g * (trail === 0 ? 1 : 0.6);
          ctx.drawImage(glow, x - sz / 2, yy - sz / 2, sz, sz);
        }
      });
      ctx.globalAlpha = 1;

      // Линия сканирования во время появления
      if (revealY > -0.3 && revealY < FIGURE_HEIGHT) {
        const sy = baseY - revealY * unit;
        const grad = ctx.createLinearGradient(cx - 2.2 * unit, 0, cx + 2.2 * unit, 0);
        grad.addColorStop(0, 'rgba(142,127,148,0)');
        grad.addColorStop(0.5, 'rgba(217,204,227,0.7)');
        grad.addColorStop(1, 'rgba(142,127,148,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 2.2 * unit, sy, 4.4 * unit, dpr);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    let visible = true;
    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) {
        prev = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);

    // При reduced-motion рисуем один статичный кадр, когда фигура «появилась»
    let staticTimer = 0;
    if (reduced) {
      staticTimer = window.setInterval(() => {
        draw(performance.now());
        if (revealedRef.current) window.clearInterval(staticTimer);
      }, 300);
    }

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(staticTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Человеческая фигура из светящихся точек: видны мозг и нервные пути, по которым бегут сигналы"
    />
  );
}

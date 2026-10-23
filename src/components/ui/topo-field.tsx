import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/**
 * Extracted from MengTo/threeui (MIT) — src/shaders/neuform-isolated/NeuformBatchEffects.tsx,
 * export `TopoField`. Only the machinery TopoField itself needs — its HTML/WebGL document plus
 * the isolate/patch/control pipeline that turns the raw page into a focused full-bleed
 * background — is kept here.
 *
 * Адаптация для SynapseX: из встроенного документа убраны демо-разметка NexusNode и внешние
 * скрипты (Tailwind CDN, Iconify, GSAP). Изоляция всё равно скрывала всё, кроме canvas, так что
 * картинка та же, но iframe больше не тянет ~400 КБ чужих библиотек. Шейдер не изменён.
 * Внутренние обратные кавычки шейдеров экранированы, чтобы документ вложился в template literal.
 */
const topoFieldSource = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Topo Field</title>
</head>
<body style="background-color: #000; margin: 0;">

    <!-- WebGL Background Container -->
    <div>
        <canvas id="topo-canvas"></canvas>
    </div>

    <script>
        // WebGL Topography
        const canvas = document.getElementById('topo-canvas');
        const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });

        if (gl) {
            const vsSource = \`
                attribute vec2 a_position;
                void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
            \`;

            const fsSource = \`
                precision highp float;
                uniform vec2 u_resolution;
                uniform float u_time;
                uniform float u_dpr;

                vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                float snoise(vec2 v){
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                    vec2 i  = floor(v + dot(v, C.yy) );
                    vec2 x0 = v -   i + dot(i, C.xx);
                    vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
                    i = mod(i, 289.0);
                    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                    m = m*m; m = m*m;
                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                    vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }

                void main() {
                    vec2 st = gl_FragCoord.xy / u_resolution.xy;
                    st.x *= u_resolution.x / u_resolution.y;

                    // 1px physical grid rendering
                    float gridSize = 48.0 * u_dpr;
                    vec2 gridSt = gl_FragCoord.xy / gridSize;
                    vec2 gridFract = fract(gridSt);
                    float lineThickness = 1.0 / gridSize;
                    float gridLines = step(1.0 - lineThickness, gridFract.x) + step(1.0 - lineThickness, gridFract.y);
                    gridLines = clamp(gridLines, 0.0, 1.0) * 0.12;

                    // Ultra-thin Topographic Lines
                    float noiseScale = 1.4;
                    vec2 noisePos = st * noiseScale + vec2(u_time * 0.015, u_time * 0.025);
                    float n = snoise(noisePos) * 0.5 + 0.5;
                    float numBands = 10.0;
                    float bandVal = n * numBands;
                    float triangleWave = abs(fract(bandVal) - 0.5) * 2.0;

                    // Thinner smoothstep constraint for fine industrial aesthetic
                    float topoLines = smoothstep(0.02, 0.00, triangleWave) * 0.45;

                    vec3 color = vec3(0.0);
                    color += vec3(1.0) * gridLines;
                    color += vec3(1.0) * topoLines;

                    gl_FragColor = vec4(color, 1.0);
                }
            \`;

            function createShader(gl, type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                return shader;
            }

            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

            const positionLocation = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
            const timeLocation = gl.getUniformLocation(program, "u_time");
            const dprLocation = gl.getUniformLocation(program, "u_dpr");

            function resizeCanvas() {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
                gl.uniform1f(dprLocation, dpr);
            }

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            let startTime = performance.now();
            function render(time) {
                gl.uniform1f(timeLocation, (time - startTime) * 0.001);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                requestAnimationFrame(render);
            }
            requestAnimationFrame(render);
        }
    </script>
</body>
</html>`;

type TopoFieldMode = "dark" | "light";

export type TopoFieldProps = {
  /** "auto" follows the page's light/dark scheme via prefers-color-scheme. */
  mode?: TopoFieldMode | "auto";
  /** Animation speed multiplier. */
  speed?: number;
  /** Stretches/compresses the noise field driving the contour bands. */
  length?: number;
  /** Multiplies the number of contour bands (visual density of lines). */
  density?: number;
  opacity?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
  /** Цвет топографических линий (hex) в тёмном режиме. По умолчанию белый. */
  lineColor?: string;
  /** Цвет сетки (hex) в тёмном режиме. По умолчанию белый. */
  gridColor?: string;
  className?: string;
  style?: CSSProperties;
};

const LIGHT_PAPER = "#eef1f6";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

/** "#a78bfa" → "vec3(0.655, 0.545, 0.980)" */
function glslColor(hex: string) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.replace(/./g, "$&$&") : value;
  const channels = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  return `vec3(${channels.map((c) => glslFloat(c)).join(", ")})`;
}

/** WebGL1 GLSL ES requires float literals (10.0), not ints (10). */
function glslFloat(value: number, digits = 3) {
  const fixed = Number(value).toFixed(digits);
  return fixed.includes(".") ? fixed : `${fixed}.0`;
}

function readAutomaticMode(): TopoFieldMode {
  if (typeof document === "undefined" || typeof window === "undefined")
    return "dark";
  const root = document.documentElement;
  const declared = root.dataset.scheme ?? root.dataset.theme;
  if (declared === "light" || declared === "dark") return declared;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function useAutomaticMode(enabled: boolean) {
  const [autoMode, setAutoMode] = useState<TopoFieldMode>(readAutomaticMode);

  useEffect(() => {
    if (
      !enabled ||
      typeof document === "undefined" ||
      typeof window === "undefined"
    )
      return undefined;
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setAutoMode(readAutomaticMode());
    const observer = new MutationObserver(update);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-scheme", "data-theme"],
    });
    media.addEventListener("change", update);
    update();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, [enabled]);

  return autoMode;
}

function patchTopoField(
  source: string,
  {
    length,
    density,
    mode,
    lineColor,
    gridColor,
  }: {
    length: number;
    density: number;
    mode: TopoFieldMode;
    lineColor?: string;
    gridColor?: string;
  },
) {
  let next = source
    .replace(
      "float noiseScale = 1.4;",
      `float noiseScale = ${glslFloat(1.4 * length, 3)};`,
    )
    .replace(
      "float numBands = 10.0;",
      `float numBands = ${glslFloat(10 * density, 2)};`,
    );
  if (mode === "dark" && gridColor) {
    next = next.replace(
      "color += vec3(1.0) * gridLines;",
      `color += ${glslColor(gridColor)} * gridLines;`,
    );
  }
  if (mode === "dark" && lineColor) {
    next = next.replace(
      "color += vec3(1.0) * topoLines;",
      `color += ${glslColor(lineColor)} * topoLines;`,
    );
  }
  if (mode === "light") {
    // Additive white-on-black does not invert cleanly — mix paper toward ink by line strength.
    next = next
      .replace(
        "gridLines = clamp(gridLines, 0.0, 1.0) * 0.12;",
        "gridLines = clamp(gridLines, 0.0, 1.0) * 0.55;",
      )
      .replace(
        "float topoLines = smoothstep(0.02, 0.00, triangleWave) * 0.45;",
        "float topoLines = smoothstep(0.03, 0.00, triangleWave) * 0.95;",
      )
      .replace(
        `vec3 color = vec3(0.0);
                    color += vec3(1.0) * gridLines;
                    color += vec3(1.0) * topoLines;`,
        `vec3 paper = vec3(0.933, 0.945, 0.965);
                    vec3 ink = vec3(0.12, 0.14, 0.18);
                    float lines = clamp(gridLines + topoLines, 0.0, 1.0);
                    vec3 color = mix(paper, ink, lines);`,
      );
  }
  return next;
}

function buildFocusedDocument(knobs: {
  mode: TopoFieldMode;
  length: number;
  density: number;
  lineColor?: string;
  gridColor?: string;
}) {
  const background = knobs.mode === "light" ? LIGHT_PAPER : "#000000";
  const patched = patchTopoField(topoFieldSource, knobs);
  const targetJson = JSON.stringify([
    { selector: "#topo-canvas", role: "background" },
  ]).replace(/</g, "\\u003c");

  const focusStyle = `<style data-threeui-focus>
html, body { width: 100% !important; height: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: ${background} !important; }
body { position: relative !important; }
body > * { visibility: hidden !important; }
body[data-threeui-ready] > [data-threeui-role] { visibility: visible !important; }
[data-threeui-residual] { display: none !important; }
[data-threeui-role="background"] { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; z-index: 0 !important; opacity: 1 !important; pointer-events: none !important; }
</style>`;

  const controlScript = `<script data-threeui-controls>
(function () {
  var controls = { speed: 1, opacity: 1 };
  window.__SF_CONTROLS = controls;
  var origin = performance.now();
  var virtual = 0;
  var last = origin;
  var performanceNow = performance.now.bind(performance);
  performance.now = function () {
    var real = performanceNow();
    virtual += (real - last) * (controls.speed || 1);
    last = real;
    return origin + virtual;
  };
  function applyVisual() {
    var opacity = controls.opacity == null ? 1 : controls.opacity;
    Array.prototype.forEach.call(document.querySelectorAll('[data-threeui-role]'), function (element) {
      element.style.opacity = String(opacity);
    });
  }
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'threeui-controls') return;
    var next = event.data.controls || {};
    Object.keys(next).forEach(function (key) { controls[key] = next[key]; });
    applyVisual();
  });
  window.__SF_APPLY_CONTROLS = applyVisual;
})();
</script>`;

  const focusScript = `<script data-threeui-focus>
(function () {
  var isolated = false;
  function isolate() {
    if (isolated) return;
    var specs = ${targetJson};
    var roots = [];
    specs.forEach(function (spec) {
      var element = document.querySelector(spec.selector);
      if (!element) return;
      element.setAttribute('data-threeui-role', spec.role);
      if (!roots.some(function (root) { return root.contains(element); })) roots.push(element);
    });
    if (!roots.length) return;
    isolated = true;
    roots.forEach(function (root) { document.body.appendChild(root); });
    Array.from(document.body.children).forEach(function (element) {
      if (roots.indexOf(element) !== -1) return;
      element.setAttribute('data-threeui-residual', '');
      element.setAttribute('aria-hidden', 'true');
      if ('inert' in element) element.inert = true;
    });
    document.body.setAttribute('data-threeui-ready', '');
    if (window.__SF_APPLY_CONTROLS) window.__SF_APPLY_CONTROLS();
    requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });
  }
  function scheduleIsolation() { setTimeout(isolate, 100); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleIsolation, { once: true });
  else scheduleIsolation();
  window.addEventListener('load', isolate, { once: true });
})();
</script>`;

  return patched
    .replace(/<head([^>]*)>/i, `<head$1>${controlScript}${focusStyle}`)
    .replace(/<\/body>/i, `${focusScript}</body>`);
}

/**
 * TopoField — an isolated, full-bleed animated WebGL background: a faint 48px grid plus
 * ultra-thin contour ("topographic") lines drawn from 2D simplex noise, drifting slowly over
 * time. Ships as a sandboxed iframe (matching the source's isolation technique) so the shader's
 * own script/canvas loop stays completely self-contained.
 */
export default function TopoField({
  mode = "dark",
  speed = 1,
  length = 1,
  density = 1,
  opacity = 1,
  hue = 0,
  saturation = 1,
  brightness = 1,
  lineColor,
  gridColor,
  className,
  style,
}: TopoFieldProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const automaticMode = useAutomaticMode(mode === "auto");
  const resolvedMode: TopoFieldMode =
    mode === "auto" ? automaticMode : mode === "light" ? "light" : "dark";
  const background = resolvedMode === "light" ? LIGHT_PAPER : "#000000";

  const safeSpeed = clamp(speed, 0, 3);
  const safeLength = clamp(length, 0.35, 2.5);
  const safeDensity = clamp(density, 0.25, 2.5);
  const safeOpacity = clamp(opacity, 0.05, 1);
  const safeHue = clamp(hue, -180, 180);
  const safeSaturation = clamp(saturation, 0, 2);
  const safeBrightness = clamp(brightness, 0.35, 1.65);

  // Rebuild when baked geometry/mode knobs change. Speed/opacity stay live via postMessage + time wrap.
  const source = useMemo(
    () =>
      buildFocusedDocument({
        mode: resolvedMode,
        length: safeLength,
        density: safeDensity,
        lineColor,
        gridColor,
      }),
    [resolvedMode, safeLength, safeDensity, lineColor, gridColor],
  );

  const postControls = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "threeui-controls",
        controls: { speed: safeSpeed, opacity: safeOpacity },
      },
      "*",
    );
  };

  useEffect(postControls, [safeSpeed, safeOpacity, source]);

  const filter =
    safeHue === 0 && safeSaturation === 1 && safeBrightness === 1
      ? undefined
      : `hue-rotate(${safeHue}deg) saturate(${safeSaturation}) brightness(${safeBrightness})`;

  return (
    <iframe
      ref={iframeRef}
      className={className}
      title="Topo Field"
      srcDoc={source}
      sandbox="allow-scripts"
      loading="eager"
      // Фон декоративный: не ловит мышь, фокус и не читается скринридером
      aria-hidden
      tabIndex={-1}
      // Скрипт внутри ещё не готов при первом postMessage — повторяем после загрузки
      onLoad={postControls}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background,
        filter,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

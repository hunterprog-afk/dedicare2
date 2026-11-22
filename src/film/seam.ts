// Cucitura attraverso la luce, in WebGL: una dissolvenza guidata dallo scroll fra due scene, con il picco di luce sulla cucitura.
// Gli shader sono di gl-transitions (MIT, licenza in ./glsl/LICENSE-gl-transitions.txt): BloomDissolve come principale
// (i chiari della scena che esce esplodono in un alone, sotto subentra quella che entra), Overexposure come ripiego sui telefoni lenti.
// Un filo di dispersione cromatica solo attorno al picco. Se WebGL manca o si perde il contesto, il motore resta sul velo CSS.
import bloomGlsl from "./glsl/BloomDissolve.glsl?raw"
import overGlsl from "./glsl/Overexposure.glsl?raw"

export type Source = HTMLVideoElement | HTMLImageElement

const VERT = `
attribute vec2 pos;
varying vec2 vUv;
void main() {
  vUv = vec2(pos.x * 0.5 + 0.5, 0.5 - pos.y * 0.5);
  gl_Position = vec4(pos, 0.0, 1.0);
}`

function fragment(transition: string, lite: boolean) {
  // gl-transitions chiede getFromColor/getToColor, progress e ratio; qui getFromColor applica anche l'inquadratura «cover»
  // (come object-fit: cover) e la dispersione cromatica.
  return `
precision highp float;
varying vec2 vUv;
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform float ratio;
uniform vec4 mapA;
uniform vec4 mapB;
uniform float ca;
${lite ? "" : `
vec4 fetchCA(sampler2D t, vec4 m, vec2 uv) {
  vec2 p = uv * m.xy + m.zw;
  if (ca < 0.0005) return texture2D(t, p);
  vec2 d = (uv - 0.5) * ca;
  return vec4(texture2D(t, p + d).r, texture2D(t, p).g, texture2D(t, p - d).b, 1.0);
}`}
vec4 getFromColor(vec2 uv) { return ${lite ? "texture2D(from, uv * mapA.xy + mapA.zw)" : "fetchCA(from, mapA, uv)"}; }
vec4 getToColor(vec2 uv) { return ${lite ? "texture2D(to, uv * mapB.xy + mapB.zw)" : "fetchCA(to, mapB, uv)"}; }
${transition}
void main() { gl_FragColor = transition(vUv); }`
}

interface Program {
  prog: WebGLProgram
  loc: Record<string, WebGLUniformLocation | null>
}

export interface Seam {
  /** Dimensiona la tela (pixel dello schermo × scala). */
  resize(cssW: number, cssH: number): void
  /** Carica un fotogramma nella texture `unit` (0 = esce, 1 = entra). */
  upload(unit: 0 | 1, src: Source): void
  /** Disegna con progresso 0..1 (0,5 = cucitura). */
  draw(progress: number): void
  setLite(lite: boolean): void
  /** Compila e prova entrambi gli shader a pagina ferma, così la prima cucitura non fa scattare nulla. */
  warm(): void
  readonly lite: boolean
  readonly canvas: HTMLCanvasElement
  onLost: (() => void) | null
  destroy(): void
}

export function createSeam(host: HTMLElement, opts: { mobile: boolean; lite: boolean }): Seam | null {
  const canvas = document.createElement("canvas")
  canvas.className = "film-gl"
  canvas.setAttribute("aria-hidden", "true")
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: false })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader")
    return s
  }
  const build = (transition: string, lite: boolean): Program => {
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragment(transition, lite)))
    gl.bindAttribLocation(prog, 0, "pos")
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link")
    const loc: Record<string, WebGLUniformLocation | null> = {}
    for (const n of ["from", "to", "progress", "ratio", "mapA", "mapB", "ca"]) loc[n] = gl.getUniformLocation(prog, n)
    return { prog, loc }
  }

  let bloom: Program, over: Program
  try {
    // BloomDissolve ha i parametri come `uniform ... // = valore`: qui diventano costanti con gli stessi valori.
    const bloomSrc = bloomGlsl
      .replace(/uniform float spread;.*/, "const float spread = 0.3;")
      .replace(/uniform float threshold;.*/, "const float threshold = 0.55;")
      .replace(/uniform float intensity;.*/, "const float intensity = 1.6;")
      .replace(/uniform vec3 tint;.*/, "const vec3 tint = vec3(1.0, 0.85, 0.6);")
    const overSrc = overGlsl.replace(/uniform float strength;.*/, "const float strength = 0.7;")
    bloom = build(bloomSrc, false)
    over = build(overSrc, true)
  } catch {
    return null
  }

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const tex: WebGLTexture[] = []
  const dims: [number, number][] = [
    [1, 1],
    [1, 1],
  ]
  for (let i = 0; i < 2; i++) {
    const t = gl.createTexture()!
    gl.activeTexture(gl.TEXTURE0 + i)
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
    tex.push(t)
  }

  let w = 1
  let h = 1
  let lite = opts.lite
  const api: Seam = {
    canvas,
    onLost: null,
    get lite() {
      return lite
    },
    setLite(v) {
      lite = v
    },
    resize(cssW, cssH) {
      // Telefono: 0,75 della scala dello schermo; computer: al massimo 1,5.
      const scale = opts.mobile ? Math.min(devicePixelRatio, 1) * 0.75 : Math.min(devicePixelRatio, 1.5)
      w = Math.max(2, Math.round(cssW * scale))
      h = Math.max(2, Math.round(cssH * scale))
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    },
    upload(unit, src) {
      const sw = src instanceof HTMLVideoElement ? src.videoWidth : src.naturalWidth
      const sh = src instanceof HTMLVideoElement ? src.videoHeight : src.naturalHeight
      if (!sw || !sh) return
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, tex[unit])
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
        dims[unit] = [sw, sh]
      } catch {
        /* fotogramma non ancora disponibile: resta il precedente */
      }
    },
    warm() {
      gl.viewport(0, 0, 16, 16)
      const keep = lite
      for (const l of [false, true]) {
        lite = l
        api.draw(0.5)
      }
      lite = keep
      gl.viewport(0, 0, w, h)
      gl.finish()
    },
    draw(progress) {
      const p = lite ? over : bloom
      gl.useProgram(p.prog)
      gl.uniform1i(p.loc.from, 0)
      gl.uniform1i(p.loc.to, 1)
      gl.uniform1f(p.loc.progress, progress)
      gl.uniform1f(p.loc.ratio, w / h)
      // Inquadratura «cover», centro in orizzontale e al 42% in verticale: la stessa di .scene-poster.
      const map = (d: [number, number]) => {
        const s = Math.max(w / d[0], h / d[1])
        const iw = d[0] * s
        const ih = d[1] * s
        const ox = (w - iw) * 0.5
        const oy = (h - ih) * 0.42
        return [w / iw, h / ih, -ox / iw, -oy / ih] as const
      }
      const a = map(dims[0])
      const b = map(dims[1])
      gl.uniform4f(p.loc.mapA, a[0], a[1], a[2], a[3])
      gl.uniform4f(p.loc.mapB, b[0], b[1], b[2], b[3])
      // Dispersione cromatica: solo attorno al picco (progress 0,5), mai sul telefono lento.
      const peak = Math.sin(Math.PI * progress)
      gl.uniform1f(p.loc.ca, lite ? 0 : 0.011 * Math.pow(peak, 4))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    destroy() {
      canvas.removeEventListener("webglcontextlost", lost)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
      canvas.remove()
    },
  }
  const lost = (e: Event) => {
    e.preventDefault()
    api.onLost?.()
  }
  canvas.addEventListener("webglcontextlost", lost)
  host.appendChild(canvas)
  return api
}

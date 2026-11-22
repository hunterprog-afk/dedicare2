// Motore del film: lo scroll guida il tempo dei video, la camera va sempre in avanti attraverso 7 scene.
// Adattato da scroll-world (scrub-engine.js): clip caricati come Blob (sempre cercabili), seek coalescenti, priming iOS,
// varianti per il telefono. Le cuciture passano attraverso la luce: una transizione WebGL (seam.ts) guidata dallo scroll,
// con il picco esattamente sulla cucitura e larga circa 0,25 altezze di schermo; senza WebGL, dissolvenza e velo di luce in CSS.
// Il motore NON crea testi: anima i nodi che l'HTML pre-renderizzato ha già.
import { gsap } from "gsap"
import { SplitText } from "gsap/SplitText"
import { setHour } from "./hourRoll"
import { getLenis } from "./ambient"
import { createSeam, type Seam, type Source } from "./seam"

gsap.registerPlugin(SplitText)

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const smooth = (x: number) => {
  x = clamp(x)
  return x * x * (3 - 2 * x)
}
/** Rimappa lo scroll sul tempo del clip: la camera rallenta a metà scena, dove il testo è al massimo. 0 = lineare. */
const lingerEase = (x: number, L: number) => {
  const l = clamp(L)
  const c = x - 0.5
  return (1 - l) * x + l * (4 * c * c * c + 0.5)
}

interface Scene {
  el: HTMLElement
  poster: HTMLImageElement
  copy: HTMLElement
  title: HTMLElement | null
  lines: Element[]
  clip: string
  clipM: string
  weight: number
  linger: number
  hour: string
  /** Ora continua (22, 26, 30...): la lancetta va sempre in avanti. */
  hc: number
  mood: string
  start: number
  end: number
  video: HTMLVideoElement | null
  loading: boolean
  ready: boolean
  cur: number
  target: number
  visible: boolean
  on: boolean
  posterLoaded: boolean
  warm: boolean
}

export function mountFilm(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>(".film-track")
  const stage = root.querySelector<HTMLElement>(".film-stage")
  const veil = root.querySelector<HTMLElement>(".film-veil")
  const clock = root.querySelector<HTMLElement>(".film-clock")
  const chapters = root.querySelector<HTMLElement>(".chapters")
  const hourEl = document.querySelector<HTMLElement>("[data-film-hour]")
  const nodes = [...root.querySelectorAll<HTMLElement>(".film-scene")]
  if (!track || !stage || !veil || !nodes.length) return () => {}

  const stg: HTMLElement = stage
  const html = document.documentElement
  const coarse = matchMedia("(hover: none) and (pointer: coarse)").matches
  const smallMQ = matchMedia("(max-width: 859px)")
  const isMobile = () => coarse || smallMQ.matches

  let prev = -1
  const scenes: Scene[] = nodes.map((el) => {
    const hour = el.dataset.hour ?? "00:00"
    let hc = Number(hour.slice(0, 2)) + Number(hour.slice(3, 5)) / 60
    while (hc < prev) hc += 24
    prev = hc
    return {
      el,
      poster: el.querySelector<HTMLImageElement>(".scene-poster")!,
      copy: el.querySelector<HTMLElement>(".scene-copy")!,
      title: el.querySelector<HTMLElement>(".scene-title"),
      lines: [],
      clip: el.dataset.clip ?? "",
      clipM: el.dataset.clipM ?? "",
      weight: Number(el.dataset.weight) || 1.4,
      linger: Number(el.dataset.linger) || 0,
      hour,
      hc,
      mood: el.dataset.mood ?? "night",
      start: 0,
      end: 0,
      video: null,
      loading: false,
      ready: false,
      cur: 0,
      target: 0,
      visible: false,
      on: false,
      posterLoaded: !el.querySelector(".scene-poster[data-src]"),
      warm: false,
    }
  })
  const N = scenes.length
  root.classList.add("film-live")

  // ---- titoli: righe che salgono da una maschera (GSAP SplitText), 700 ms e 90 ms fra una riga e l'altra ----
  const splits: SplitText[] = []
  const playTitle = (s: Scene, on: boolean) => {
    if (!s.lines.length) return
    gsap.killTweensOf(s.lines)
    gsap.to(s.lines, on ? { yPercent: 0, duration: 0.7, stagger: 0.09, ease: "power3.out", delay: s.hour === "22:00" ? 0.1 : 0 } : { yPercent: 115, duration: 0.3, ease: "power2.in" })
  }
  for (const s of scenes) {
    const title = s.title
    if (!title) continue
    splits.push(
      SplitText.create(title, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        aria: "auto",
        onSplit(self) {
          s.lines = self.lines
          gsap.set(s.lines, { yPercent: s.on ? 0 : 115 })
          title.classList.add("is-split")
          if (s.on) playTitle(s, true)
        },
      }),
    )
  }

  // ---- cucitura in WebGL ----
  const lowEnd = isMobile() && (navigator.hardwareConcurrency || 8) <= 4
  let seam: Seam | null = null
  try {
    seam = createSeam(stg, { mobile: isMobile(), lite: lowEnd })
  } catch {
    seam = null
  }
  if (seam) {
    seam.onLost = () => {
      seam?.destroy()
      seam = null
      html.classList.remove("has-gl")
    }
    html.classList.add("has-gl")
  }
  let seamShown = false
  let lastDraw = 0
  const drawGaps: number[] = []

  let vh = stg.clientHeight || innerHeight
  let H = 0.125 * vh
  let trackTop = 0
  let totalEnd = 0
  let laidOutW = innerWidth
  let active = -1
  let past = false
  let raf = 0
  let running = true
  let userReady = false
  const urls: string[] = []

  function layout() {
    vh = stg.clientHeight || innerHeight
    H = 0.125 * vh
    laidOutW = innerWidth
    trackTop = track!.getBoundingClientRect().top + scrollY
    let off = 0
    for (const s of scenes) {
      s.start = trackTop + off * vh
      off += s.weight
      s.end = trackTop + off * vh
    }
    totalEnd = trackTop + off * vh
    seam?.resize(stg.clientWidth, stg.clientHeight)
    read()
  }

  function setPoster(s: Scene) {
    if (s.posterLoaded) return
    s.posterLoaded = true
    const src = isMobile() ? s.poster.dataset.srcM : s.poster.dataset.src
    if (src) s.poster.src = src
  }

  function loadClip(s: Scene) {
    if (s.loading) return
    const url = isMobile() && s.clipM ? s.clipM : s.clip
    if (!url) return
    s.loading = true
    fetch(url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("clip"))))
      .then((blob) => {
        const v = document.createElement("video")
        v.className = "scene-video"
        v.muted = true
        v.playsInline = true
        v.preload = "auto"
        v.setAttribute("muted", "")
        v.setAttribute("playsinline", "")
        v.setAttribute("aria-hidden", "true")
        const u = URL.createObjectURL(blob)
        urls.push(u)
        v.src = u
        v.addEventListener("loadedmetadata", () => {
          s.ready = true
          kick()
        })
        // Il poster resta finché il clip non ha dipinto un fotogramma: su iOS un video mai riprodotto resta vuoto.
        v.addEventListener("seeked", () => s.el.classList.add("has-clip"), { once: true })
        v.addEventListener("loadeddata", () => {
          try {
            v.pause()
          } catch {
            /* niente */
          }
          if (userReady) prime(v)
        })
        s.el.querySelector(".scene-media")!.appendChild(v)
        s.video = v
      })
      .catch(() => {
        s.loading = false
      })
  }

  function prime(v: HTMLVideoElement | null) {
    if (!isMobile() || !v) return
    try {
      const p = v.play()
      if (p && p.then) p.then(() => v.pause()).catch(() => {})
    } catch {
      /* niente */
    }
  }
  function onFirstGesture() {
    if (userReady) return
    userReady = true
    scenes.forEach((s) => prime(s.video))
  }

  /** Il fotogramma di una scena: il video se ha già un fotogramma, altrimenti il poster (che è il suo primo fotogramma). */
  function source(s: Scene): Source | null {
    if (s.video && s.ready && s.video.readyState >= 2) return s.video
    return s.poster.complete && s.poster.naturalWidth ? s.poster : null
  }

  /** Indice della scena che entra se siamo dentro la fascia della luce (± H attorno alla cucitura), altrimenti -1. */
  function seamAt(y: number) {
    for (let i = 1; i < N; i++) if (Math.abs(y - scenes[i].start) < H) return i
    return -1
  }

  function drawSeam(y: number, k: number) {
    if (!seam) return
    const a = source(scenes[k - 1])
    const b = source(scenes[k])
    if (!a || !b) return
    seam.upload(0, a)
    seam.upload(1, b)
    seam.draw(clamp((y - (scenes[k].start - H)) / (2 * H)))
    if (!seamShown) {
      seamShown = true
      seam.canvas.classList.add("on")
    }
    // Se la dissolvenza in WebGL non regge (fotogrammi lenti), passa all'esposizione semplice.
    const now = performance.now()
    if (lastDraw && now - lastDraw < 200) {
      drawGaps.push(now - lastDraw)
      if (drawGaps.length === 12 && !seam.lite) {
        const med = [...drawGaps].sort((x, z) => x - z)[6]
        if (med > 36) seam.setLite(true)
      }
    }
    lastDraw = now
  }

  function read() {
    const y = scrollY
    let ai = 0
    for (let i = 0; i < N; i++) if (y >= scenes[i].start - 1) ai = i

    const k = seamAt(y)
    if (seam) {
      if (k >= 0) drawSeam(y, k)
      else if (seamShown) {
        seamShown = false
        seam.canvas.classList.remove("on")
        lastDraw = 0
      }
      veil!.style.opacity = "0"
    } else {
      // Ripiego: velo di luce radiale in CSS, picco 1 sulla cucitura, 0 a H da ogni lato.
      let v = 0
      for (let i = 1; i < N; i++) v = Math.max(v, smooth(1 - Math.abs(y - scenes[i].start) / H))
      veil!.style.opacity = v.toFixed(3)
      veil!.style.transform = `translate3d(0,0,0) scale(${(0.35 + 1.65 * v).toFixed(3)})`
    }

    for (let i = 0; i < N; i++) {
      const s = scenes[i]
      if (y > s.start - 2.2 * vh && y < s.end + 1.8 * vh) {
        setPoster(s)
        loadClip(s)
      }
      // Il clip successivo prepara il primo fotogramma poco prima della luce, così alla cucitura non c'è attesa.
      if (i > 0 && !s.warm && s.video && s.ready && y > s.start - 0.9 * vh && y < s.start - H) {
        s.warm = true
        try {
          s.video.currentTime = 0
        } catch {
          /* niente */
        }
        const src = source(s)
        if (seam && src) seam.upload(1, src)
      }
      const local = clamp((y - s.start) / (s.end - s.start))
      s.target = s.linger ? lingerEase(local, s.linger) : local

      // Dissolvenza sotto la luce: la scena che arriva sale da 0 a 1 attorno alla cucitura, sopra la precedente.
      const op = i === 0 ? 1 : smooth((y - (s.start - H / 2)) / H)
      const vis = y >= s.start - H - 1 && (i === N - 1 || y <= s.end + H + 1)
      s.visible = vis
      s.el.style.visibility = vis ? "visible" : "hidden"
      s.el.style.opacity = vis ? String(op) : "0"
      s.el.style.zIndex = String(i + 1)

      // Testo: arriva dopo la luce, resta, se ne va prima della cucitura successiva (dentro la luce il testo non si vede).
      const cin = i === 0 ? 1 : smooth((y - (s.start + 1.0 * H)) / (0.8 * H))
      const cout = i === N - 1 ? 1 : smooth((s.end - 1.05 * H - y) / (0.8 * H))
      const cop = Math.min(cin, cout)
      s.copy.style.opacity = cop.toFixed(3)
      s.copy.style.transform = `translate3d(0,${((1 - cin) * 18).toFixed(1)}px,0)`
      s.copy.style.pointerEvents = cop > 0.5 ? "auto" : "none"
      const on = vis && cop > 0.02
      if (on !== s.on) {
        s.on = on
        s.el.classList.toggle("is-on", on)
        playTitle(s, on)
      }
    }

    if (ai !== active) {
      active = ai
      if (hourEl) setHour(hourEl, scenes[ai].hour)
      if (clock) clock.dataset.mood = scenes[ai].mood
      chapters?.querySelectorAll<HTMLElement>("[data-go]").forEach((b, n) => b.classList.toggle("is-active", n === ai))
    }
    if (clock) {
      // La lancetta scorre fra le ore delle scene attraverso la luce (15 gradi per ora, in avanti).
      let hc = scenes[ai].hc
      if (k > 0) hc = scenes[k - 1].hc + (scenes[k].hc - scenes[k - 1].hc) * smooth((y - (scenes[k].start - H)) / (2 * H))
      clock.style.setProperty("--hand", `${(hc * 15).toFixed(1)}deg`)
    }
    const nowPast = y > totalEnd + 0.15 * vh
    if (nowPast !== past) {
      past = nowPast
      html.classList.toggle("film-past", past)
    }
    kick()
  }

  /** Un solo ciclo di rAF che cerca nei video e ridisegna la luce; si ferma quando tutto è arrivato dove deve. */
  function kick() {
    if (!raf) raf = requestAnimationFrame(tick)
  }
  function tick() {
    raf = 0
    if (!running) return
    const eps = isMobile() ? 0.02 : 0.008
    let again = false
    for (const s of scenes) {
      const v = s.video
      if (!v || !s.ready) continue
      if (!s.visible && Math.abs(s.cur - s.target) < 0.002) continue
      // Mai un nuovo seek mentre il decoder è ancora sul precedente: su un telefono una scorsa veloce bloccherebbe il clip.
      if (v.seeking) {
        again = true
        continue
      }
      s.cur += (s.target - s.cur) * 0.2
      if (Math.abs(s.target - s.cur) < 0.0006) s.cur = s.target
      else again = true
      const t = clamp(s.cur, 0, 0.999) * (v.duration || 1)
      if (Math.abs(v.currentTime - t) > eps) {
        try {
          v.currentTime = t
        } catch {
          /* niente */
        }
      }
    }
    // Dentro la luce si ridisegna a ogni fotogramma: i video arrivano dopo lo scroll, non insieme.
    if (seam) {
      const k = seamAt(scrollY)
      if (k >= 0) {
        drawSeam(scrollY, k)
        again = true
      }
    }
    if (again) raf = requestAnimationFrame(tick)
  }

  function jumpTo(i: number) {
    const s = scenes[i]
    const top = i === 0 ? 0 : s.start + (s.end - s.start) * (i === N - 1 ? 0.55 : 0.5)
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(top, { duration: 1.6 })
    else scrollTo({ top, behavior: "smooth" })
  }
  const onChapter = (e: Event) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-go]")
    if (!b) return
    chapters?.hidePopover?.()
    jumpTo(Number(b.dataset.go))
  }

  const onScroll = () => read()
  const onResize = () => {
    // Sul telefono la barra dell'indirizzo cambia solo l'altezza: si ricalcola solo se cambia la larghezza.
    if (coarse && innerWidth === laidOutW) return
    layout()
  }
  addEventListener("scroll", onScroll, { passive: true })
  addEventListener("resize", onResize)
  addEventListener("orientationchange", layout)
  addEventListener("load", layout)
  addEventListener("pointerdown", onFirstGesture, { once: true, passive: true })
  addEventListener("touchstart", onFirstGesture, { once: true, passive: true })
  chapters?.addEventListener("click", onChapter)
  void document.fonts?.ready.then(() => layout())
  layout()
  // A pagina ferma: prepara gli shader e le prime due immagini, così la prima luce non trova nulla da compilare.
  const warmTimer = window.setTimeout(() => {
    const a = source(scenes[0])
    const b = source(scenes[1])
    if (seam && a && b) {
      seam.upload(0, a)
      seam.upload(1, b)
      seam.warm()
    }
  }, 1200)

  return () => {
    running = false
    clearTimeout(warmTimer)
    cancelAnimationFrame(raf)
    removeEventListener("scroll", onScroll)
    removeEventListener("resize", onResize)
    removeEventListener("orientationchange", layout)
    removeEventListener("load", layout)
    chapters?.removeEventListener("click", onChapter)
    splits.forEach((s) => s.revert())
    for (const s of scenes) {
      gsap.killTweensOf(s.lines)
      s.video?.remove()
      s.el.classList.remove("is-on", "has-clip")
      s.title?.classList.remove("is-split")
      s.el.removeAttribute("style")
      s.copy.removeAttribute("style")
    }
    seam?.destroy()
    urls.forEach((u) => URL.revokeObjectURL(u))
    veil.removeAttribute("style")
    root.classList.remove("film-live")
    html.classList.remove("film-past", "has-gl")
  }
}

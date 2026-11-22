// Motore del film: lo scroll guida il tempo dei video, la camera va sempre in avanti attraverso 7 scene.
// Adattato da scroll-world (scrub-engine.js): clip caricati come Blob (sempre cercabili), seek coalescenti, priming iOS,
// varianti per il telefono. Qui le cuciture non sono clip di raccordo: passano attraverso la luce, con una
// dissolvenza incrociata e un velo di luce radiale che ha il picco esattamente sulla cucitura.
// Il motore NON crea testi: anima i nodi che l'HTML pre-renderizzato ha già.
import { setHour } from "./hourRoll"
import { getLenis } from "./ambient"

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
  words: HTMLElement[]
  clip: string
  clipM: string
  weight: number
  linger: number
  hour: string
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
}

export function mountFilm(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>(".film-track")
  const stage = root.querySelector<HTMLElement>(".film-stage")
  const veil = root.querySelector<HTMLElement>(".film-veil")
  const rail = root.querySelector<HTMLElement>(".film-rail")
  const hourEl = document.querySelector<HTMLElement>("[data-film-hour]")
  const nodes = [...root.querySelectorAll<HTMLElement>(".film-scene")]
  if (!track || !stage || !veil || !nodes.length) return () => {}

  const stg: HTMLElement = stage
  const html = document.documentElement
  const coarse = matchMedia("(hover: none) and (pointer: coarse)").matches
  const smallMQ = matchMedia("(max-width: 859px)")
  const isMobile = () => coarse || smallMQ.matches

  const scenes: Scene[] = nodes.map((el) => ({
    el,
    poster: el.querySelector<HTMLImageElement>(".scene-poster")!,
    copy: el.querySelector<HTMLElement>(".scene-copy")!,
    words: [...el.querySelectorAll<HTMLElement>(".w")],
    clip: el.dataset.clip ?? "",
    clipM: el.dataset.clipM ?? "",
    weight: Number(el.dataset.weight) || 1.4,
    linger: Number(el.dataset.linger) || 0,
    hour: el.dataset.hour ?? "",
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
  }))
  const N = scenes.length
  root.classList.add("film-live")

  let vh = stage.clientHeight || innerHeight
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

  /** Divide il titolo in righe: ogni riga entra 90 ms dopo la precedente. */
  function lineDelays() {
    for (const s of scenes) {
      let line = -1
      let lastTop = -1e9
      for (const w of s.words) {
        const top = w.offsetTop
        if (Math.abs(top - lastTop) > 4) {
          line++
          lastTop = top
        }
        w.style.setProperty("--d", `${line * 90}ms`)
      }
    }
  }

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
    lineDelays()
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

  function read() {
    const y = scrollY
    let ai = 0
    for (let i = 0; i < N; i++) if (y >= scenes[i].start - 1) ai = i

    // Velo di luce: picco 1 sulla cucitura, 0 a metà larghezza (H) da ogni lato, cioè circa 0,25 altezze in tutto.
    let v = 0
    for (let i = 1; i < N; i++) v = Math.max(v, smooth(1 - Math.abs(y - scenes[i].start) / H))
    veil!.style.opacity = v.toFixed(3)
    veil!.style.transform = `translate3d(0,0,0) scale(${(0.35 + 1.65 * v).toFixed(3)})`

    for (let i = 0; i < N; i++) {
      const s = scenes[i]
      if (y > s.start - 2.2 * vh && y < s.end + 1.8 * vh) {
        setPoster(s)
        loadClip(s)
      }
      const local = clamp((y - s.start) / (s.end - s.start))
      s.target = s.linger ? lingerEase(local, s.linger) : local

      // Dissolvenza: la scena che arriva sale da 0 a 1 attorno alla cucitura, sopra la precedente.
      const op = i === 0 ? 1 : smooth((y - (s.start - H / 2)) / H)
      const vis = y >= s.start - H / 2 - 1 && (i === N - 1 || y <= s.end + H / 2 + 1)
      s.visible = vis
      s.el.style.visibility = vis ? "visible" : "hidden"
      s.el.style.opacity = vis ? String(op) : "0"
      s.el.style.zIndex = String(i + 1)

      // Testo: arriva appena la luce cala, resta, se ne va prima della cucitura successiva.
      const cin = i === 0 ? 1 : smooth((y - (s.start + 0.3 * H)) / H)
      const cout = i === N - 1 ? 1 : smooth((s.end - 0.1 * H - y) / (0.9 * H))
      const cop = Math.min(cin, cout)
      s.copy.style.opacity = cop.toFixed(3)
      s.copy.style.transform = `translate3d(0,${((1 - cin) * 18).toFixed(1)}px,0)`
      s.copy.style.pointerEvents = cop > 0.5 ? "auto" : "none"
      const on = vis && cop > 0.02
      if (on !== s.on) {
        s.on = on
        s.el.classList.toggle("is-on", on)
      }
    }

    if (ai !== active) {
      active = ai
      if (hourEl) setHour(hourEl, scenes[ai].hour)
      rail?.querySelectorAll<HTMLElement>(".rail-item").forEach((b, k) => b.classList.toggle("is-active", k === ai))
    }
    const nowPast = y > totalEnd + 0.15 * vh
    if (nowPast !== past) {
      past = nowPast
      html.classList.toggle("film-past", past)
    }
    kick()
  }

  /** Un solo ciclo di rAF che cerca nei video; si ferma quando tutto è arrivato dove deve. */
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
    if (again) raf = requestAnimationFrame(tick)
  }

  function jumpTo(i: number) {
    const s = scenes[i]
    const top = i === 0 ? 0 : s.start + 0.5 * (s.end - s.start) * (i === N - 1 ? 0.9 : 0.6)
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(top, { duration: 1.6 })
    else scrollTo({ top, behavior: "smooth" })
  }
  const onRail = (e: Event) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-go]")
    if (b) jumpTo(Number(b.dataset.go))
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
  rail?.addEventListener("click", onRail)
  void document.fonts?.ready.then(() => layout())
  layout()

  return () => {
    running = false
    cancelAnimationFrame(raf)
    removeEventListener("scroll", onScroll)
    removeEventListener("resize", onResize)
    removeEventListener("orientationchange", layout)
    removeEventListener("load", layout)
    rail?.removeEventListener("click", onRail)
    for (const s of scenes) {
      s.video?.remove()
      s.el.classList.remove("is-on", "has-clip")
      s.el.removeAttribute("style")
      s.copy.removeAttribute("style")
    }
    urls.forEach((u) => URL.revokeObjectURL(u))
    veil.removeAttribute("style")
    root.classList.remove("film-live")
    html.classList.remove("film-past")
  }
}

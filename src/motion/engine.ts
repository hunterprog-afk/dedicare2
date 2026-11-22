// Motore di movimento della home (chunk differito, solo senza prefers-reduced-motion).
// Ora in funzione dello scroll -> cielo, disco, orologio, fasi, D, palchi, foto, ingressi.
// Letture del DOM solo in measure() e all'inizio del fotogramma; le scritture dopo, solo transform e opacity.
import { createClock } from "./clock"
import type { Smooth } from "./smooth"
import {
  buildKeys,
  clamp,
  crossesChapter,
  cubicBezier,
  dPhase,
  discState,
  fmt,
  layerValues,
  quantize,
  timeAt,
  uiPhase,
  type Anchor,
  type Key,
} from "./hourMap"

type Setter = (v: number) => void

interface Photo {
  pic: HTMLElement
  v0: number
  setVeil: Setter
  setScale: Setter
  last: number
}

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)]

const root = document.documentElement
const mqDesk = matchMedia("(min-width: 1024px)")
const mqPin = matchMedia("(min-width: 1024px) and (min-height: 700px)")
const mqSmooth = matchMedia("(min-width: 1024px) and (pointer: fine)")
const REVEAL = "[data-reveal], [data-word]"

async function start() {
  const main = $("main")
  if (!main || !$(".clock-rail")) return
  const { gsap } = await import("gsap")
  const setter = (el: Element, prop: string, unit?: string) => gsap.quickSetter(el, prop, unit) as Setter

  // ---- Elementi. ----
  const layers = $$("#sky .sky-layer")
  const layerO = layers.map((el) => setter(el, "opacity"))
  const lastO = layers.map(() => -1)
  const lastZ = layers.map(() => -1)
  const moon = $(".disc-moon")
  const sun = $(".disc-sun")
  const indicator = $(".clock-indicator")
  const now = $(".clock-now")
  const pill = $(".clock-pill")
  const pillAria = pill?.getAttribute("aria-label") ?? ""
  const logoInner = $(".site-header .logo[data-phase='live'] .logo-inner")
  const sections = $$("[data-hour-at]", main)
  const chapterEls = $$("[data-chapter]")
  const chapterIds = new Set(chapterEls.map((el) => el.dataset.chapter))
  const photoB = $("#assistenza-24-7 .photo-b")
  const cambio = $(".cambio-photo")
  const sera = $(".sera-photo")

  const setMoonY = moon && setter(moon, "y", "px")
  const setMoonO = moon && setter(moon, "opacity")
  const setSunY = sun && setter(sun, "y", "px")
  const setSunO = sun && setter(sun, "opacity")
  const setIndY = indicator && setter(indicator, "y", "px")
  const setNowY = now && setter(now, "y", "px")
  const setBO = photoB && setter(photoB, "opacity")
  const setCambio = cambio && setter(cambio, "scale")
  const setSera = sera && setter(sera, "scale")

  const photos: Photo[] = $$("[data-light]")
    .filter((pic) => !pic.closest("#inizio, .cambio-photo, .sera-photo, .d-window"))
    .flatMap((pic) => {
      const veil = $(".veil", pic)
      const img = $("img, .pic-skeleton", pic)
      if (!veil || !img) return []
      veil.style.willChange = "opacity"
      img.style.willChange = "transform"
      return [{ pic, v0: pic.dataset.light === "day" ? 0.55 : 0.3, setVeil: setter(veil, "opacity"), setScale: setter(img, "scale"), last: -1 }]
    })
  for (const el of [cambio, sera, moon, sun, indicator, now]) if (el) el.style.willChange = "transform"

  // ---- Misure (mai durante lo scroll). ----
  let keys: Key[] = [{ y: 0, t: 0 }]
  let vh = innerHeight
  let H = 72
  let pinOn = false
  let pin = { s: 0, e: 1 }
  let cambioM = { top: 0, h: 1 }
  let seraM = { top: 0, h: 1 }
  let chapterAt: { id: string; y: number }[] = []
  let dirty = true

  function measure() {
    vh = innerHeight
    H = mqDesk.matches ? 72 : 60
    pinOn = mqPin.matches
    const y0 = scrollY
    const maxScroll = root.scrollHeight - vh
    const anchors: Anchor[] = []
    chapterAt = []
    for (const el of sections) {
      // Per difetto: lo scroll alle ancore arrotonda al pixel e non deve restare sotto la chiave.
      const top = Math.floor(el.getBoundingClientRect().top + y0)
      const height = el.offsetHeight
      anchors.push({
        at: el.dataset.hourAt as Anchor["at"],
        top,
        height,
        hours: (el.dataset.hour ?? "0").split(",").map(Number),
      })
      if (el.dataset.hourAt === "pin") {
        pin = { s: top, e: Math.max(top + 1, top + height - vh) }
      }
      if (el === cambio?.closest("section")) cambioM = { top, h: height }
      if (el === sera?.closest("section")) seraM = { top, h: height }
      if (chapterIds.has(el.id)) chapterAt.push({ id: el.id, y: top - H - 2 })
    }
    keys = buildKeys(anchors, { H, vh, maxScroll })
    if (moon && sun) gsap.set([moon, sun], { x: innerWidth * 0.89 - 56 })
    if (!pinOn && photoB) gsap.set(photoB, { clearProps: "opacity" })
    dirty = true
  }

  // ---- Stato mostrato. ----
  let lastY = -1
  let q = Number.NaN
  let phase = ""
  let dphase = ""
  let chapter = ""
  let lastBreath = -Infinity
  let intro: { t: number } | null = null
  let introTween: ReturnType<typeof gsap.to> | null = null
  let booted = false
  const clock = createClock($$(".clock-time"), fmt(scrollY === 0 ? -10 : 0))
  let shownQ = scrollY === 0 ? -10 : 0

  function showClock(next: number, animate: boolean) {
    if (next === shownQ) return
    const text = fmt(next)
    clock.set(text, animate)
    pill?.setAttribute("aria-label", pillAria.replace(/\d\d:\d\d/, text))
    shownQ = next
  }

  // Foto «si accende la luce»: solo quelle vicine allo schermo; all'uscita si scrive lo stato finale.
  const active = new Set<Photo>()
  const leaving = new Set<Photo>()
  function lightPhotos(list: Iterable<Photo>) {
    const tops: [Photo, number][] = []
    for (const ph of list) tops.push([ph, ph.pic.getBoundingClientRect().top])
    for (const [ph, top] of tops) {
      const s = clamp(((vh - top) / vh - 0.1) / 0.4)
      if (s === ph.last) continue
      ph.last = s
      ph.setVeil(ph.v0 * (1 - s))
      ph.setScale(1.06 - 0.06 * s)
    }
  }

  function apply(y: number) {
    const t = timeAt(keys, y)

    // Cielo.
    const { o, z } = layerValues(t)
    for (let i = 0; i < layers.length; i++) {
      if (o[i] !== lastO[i]) layerO[i]((lastO[i] = o[i]))
      if (z[i] !== lastZ[i]) layers[i].style.zIndex = String((lastZ[i] = z[i]))
    }

    // Disco (solo desktop: sotto 1024 è nascosto).
    if (mqDesk.matches && setMoonY && setMoonO && setSunY && setSunO) {
      const [my, mo, sy, so] = discState(t)
      setMoonY(my * vh - 56)
      setMoonO(mo)
      setSunY(sy * vh - 56)
      setSunO(so)
    }

    // Indicatore sul binario (durante l'intro segue la sua interpolazione).
    const ti = intro ? intro.t : t
    const iy = 0.2 * vh + (0.6 * vh * ti) / 1440 - 7
    setIndY?.(iy)
    setNowY?.(iy - 4)

    // Fasi: dark/light nei due soli punti, D a quattro fasi.
    const ph = uiPhase(t)
    if (ph !== phase) root.dataset.phase = phase = ph
    const dp = dPhase(t)
    if (dp !== dphase) root.dataset.dphase = dphase = dp

    // Orologio a passi di 10 minuti; la D respira a ogni ora-capitolo attraversata.
    const nq = quantize(t)
    if (nq !== q) {
      const prev = q
      q = nq
      if (!intro) {
        const before = shownQ
        showClock(nq, booted)
        if (booted && !Number.isNaN(prev) && crossesChapter(before, nq)) breathe()
      }
    }

    // Palchi.
    if (pinOn && setBO) setBO(clamp((clamp((y - pin.s) / (pin.e - pin.s)) - 0.4) / 0.2))
    if (setCambio) {
      const p = pinOn ? (y - cambioM.top) / (cambioM.h - vh || 1) : (y - cambioM.top + vh) / (cambioM.h + vh)
      setCambio(1.08 - 0.08 * clamp(p))
    }
    if (setSera) setSera(1.06 - 0.06 * clamp((y - seraM.top + vh) / (seraM.h + vh)))

    // Foto.
    if (active.size || leaving.size) {
      lightPhotos([...active, ...leaving])
      leaving.clear()
    }

    // Voce corrente dell'indice.
    let cur = chapterAt[0]?.id ?? ""
    for (const c of chapterAt) if (c.y <= y) cur = c.id
    if (cur !== chapter) {
      chapter = cur
      for (const el of chapterEls) {
        if (el.dataset.chapter === cur) el.setAttribute("aria-current", "location")
        else el.removeAttribute("aria-current")
      }
    }
  }

  function breathe() {
    const n = performance.now()
    if (!logoInner || n - lastBreath < 1200) return
    lastBreath = n
    logoInner.classList.add("is-breathing")
  }
  logoInner?.addEventListener("animationend", () => logoInner.classList.remove("is-breathing"))

  // ---- Avvio, tutto nello stesso task: nessun fotogramma con il cielo sbagliato o con contenuti che spariscono. ----
  // Con sky-on i tre palchi si allungano: si tiene ferma la prima sezione che comincia nello schermo
  // (o, se nessuna comincia lì, quella in cui ci si trova), come farebbe lo scroll anchoring.
  const tops = sections.map((el) => el.getBoundingClientRect().top)
  const first = tops.findIndex((t) => t >= -1)
  const pivot = first >= 0 && tops[first] < innerHeight ? sections[first] : sections[(first < 0 ? sections.length : first) - 1]
  const before = pivot?.getBoundingClientRect().top ?? 0
  root.classList.add("sky-on")
  const after = pivot?.getBoundingClientRect().top ?? 0
  if (pivot && scrollY > 0 && Math.abs(after - before) > 1) scrollTo(0, scrollY + after - before)
  measure()
  lastY = scrollY
  apply(lastY)
  booted = true
  lightPhotos(photos)
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const ph = photos.find((p) => p.pic === e.target)
        if (!ph) continue
        if (e.isIntersecting) active.add(ph)
        else {
          active.delete(ph)
          leaving.add(ph)
        }
      }
      dirty = true
    },
    { rootMargin: "25% 0px 25% 0px" },
  )
  for (const ph of photos) io.observe(ph.pic)

  // Ingressi: chi è già sopra il 75% dello schermo è subito «dentro».
  const reveal = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add("is-in")
        reveal.unobserve(e.target)
      }
    },
    { rootMargin: "0px 0px -25% 0px", threshold: 0 },
  )
  const pending = $$(REVEAL).map((el) => [el, el.getBoundingClientRect().top] as const)
  for (const [el, top] of pending) {
    if (top < vh * 0.75) el.classList.add("is-in")
    else reveal.observe(el)
  }
  root.classList.add("motion")

  // ---- Fotogramma. ----
  gsap.ticker.add(() => {
    const y = scrollY
    if (y === lastY && !dirty) return
    if (intro && y !== 0) endIntro(false)
    lastY = y
    dirty = false
    apply(y)
  })

  // Intro dell'orologio: indicatore da 21:50 a 22:00, poi un rotolamento.
  function endIntro(roll: boolean) {
    introTween?.kill()
    introTween = null
    intro = null
    showClock(Number.isNaN(q) ? 0 : q, roll)
    dirty = true
  }
  if (scrollY === 0) {
    intro = { t: -10 }
    introTween = gsap.to(intro, {
      t: 0,
      duration: 0.9,
      ease: cubicBezier(0.22, 1, 0.36, 1),
      onUpdate: () => void (dirty = true),
      onComplete: () => endIntro(true),
    })
  }

  // ---- Scorrimento morbido e ancore (solo desktop con puntatore fine). ----
  let smooth: Smooth | null = null
  let loading = false
  async function syncSmooth() {
    if (mqSmooth.matches && !smooth && !loading) {
      loading = true
      const { createSmooth } = await import("./smooth")
      loading = false
      if (mqSmooth.matches && !smooth) smooth = createSmooth(gsap)
    } else if (!mqSmooth.matches && smooth) {
      smooth.destroy()
      smooth = null
    }
  }
  void syncSmooth()
  document.addEventListener("click", (e) => {
    if (!smooth || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href^='#']")
    const id = a ? decodeURIComponent(a.hash.slice(1)) : ""
    const target = id ? document.getElementById(id) : null
    if (!target) return
    e.preventDefault()
    history.pushState(null, "", `#${id}`)
    smooth.scrollTo(target, () => {
      // Come la navigazione nativa: il prossimo Tab parte dalla sezione raggiunta.
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1")
        target.style.outline = "none"
      }
      target.focus({ preventScroll: true })
    })
  })

  // ---- Quando rimisurare. ----
  let resizeTimer = 0
  addEventListener("resize", () => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(measure, 150)
  })
  addEventListener("orientationchange", measure)
  addEventListener("pageshow", (e) => {
    if (e.persisted) measure()
  })
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) dirty = true
  })
  void document.fonts?.ready.then(measure)
  let roFrame = 0
  new ResizeObserver(() => {
    cancelAnimationFrame(roFrame)
    roFrame = requestAnimationFrame(measure)
  }).observe(main)
  mqDesk.addEventListener("change", measure)
  mqSmooth.addEventListener("change", () => void syncSmooth())
}

void start()

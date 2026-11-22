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
  discCenter,
  discState,
  fmt,
  layerValues,
  NEAR,
  quantize,
  safeDecode,
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
  const disc = $("#disc")
  const moon = $(".disc-moon")
  const sun = $(".disc-sun")
  const indicator = $(".clock-indicator")
  const now = $(".clock-now")
  const railLine = $(".clock-line")
  const pill = $(".clock-pill")
  const pillAria = pill?.getAttribute("aria-label") ?? ""
  const logoInner = $(".site-header .logo[data-phase='live'] .logo-inner")
  const sections = $$("[data-hour-at]", main)
  const chapterEls = $$("[data-chapter]")
  const chapterIds = new Set(chapterEls.map((el) => el.dataset.chapter))
  const railEl = $(".clock-rail")!
  // Capitoli del binario: ora (minuti) e stato «spento» perché sotto l'indicatore.
  const marks = $$(".clock-chapter[data-t]", railEl).map((el) => ({ el, t: Number(el.dataset.t), near: false }))
  const sceneEls = $$("[data-phase-switch]", main)
  const photoB = $("#assistenza-24-7 .photo-b")
  const tagA = $("#assistenza-24-7 .photo-a .a247-tag")
  // Numerale grande del palco 24/7: passa dalle 02:00 alle 04:00 con la stessa dissolvenza della foto.
  const a247Hour = $("#assistenza-24-7 .a247-hour")
  const a247Time = a247Hour && $("time", a247Hour)
  const hourA = a247Time?.textContent ?? ""
  const hourB = $("#assistenza-24-7 .photo-b .a247-tag")?.textContent?.trim() ?? hourA
  const cambio = $(".cambio-photo")
  const sera = $(".sera-photo")

  const setMoonY = moon && setter(moon, "y", "px")
  const setMoonO = moon && setter(moon, "opacity")
  const setSunY = sun && setter(sun, "y", "px")
  const setSunO = sun && setter(sun, "opacity")
  const setIndY = indicator && setter(indicator, "y", "px")
  const setNowY = now && setter(now, "y", "px")
  const setBO = photoB && setter(photoB, "opacity")
  const setTagA = tagA && setter(tagA, "opacity")
  const setHourO = a247Hour && setter(a247Hour, "opacity")
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
  for (const el of [moon, sun, indicator, now]) if (el) el.style.willChange = "transform"
  const sky = $("#sky")

  let a247Shown = hourA
  function showA247Hour(text: string) {
    if (!a247Time || text === a247Shown) return
    a247Time.textContent = text
    a247Time.setAttribute("datetime", text)
    a247Shown = text
  }

  // ---- Misure (mai durante lo scroll). ----
  let keys: Key[] = [{ y: 0, t: 0 }]
  let vh = innerHeight
  let H = 72
  let rail = { top: 0, h: 1 }
  let pinOn = false
  let pin = { s: 0, e: 1 }
  let cambioM = { top: 0, h: 1 }
  let seraM = { top: 0, h: 1 }
  let chapterAt: { id: string; y: number }[] = []
  let nowH = 17
  let scenes: { top: number; h: number }[] = []
  let inScene = false
  let discHidden = false
  let skyHidden = false
  /** y di arrivo per le sezioni con l'ora al centro (cambio turno, sera): lì l'orologio segna l'ora scritta. */
  const centerAt = new Map<string, number>()
  let dirty = true

  function measure() {
    vh = innerHeight
    H = mqDesk.matches ? 72 : 60
    const rl = railLine?.getBoundingClientRect()
    if (rl) rail = { top: rl.top, h: rl.height }
    pinOn = mqPin.matches
    if (now) nowH = now.offsetHeight || nowH
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
      if (el.dataset.hourAt === "center") centerAt.set(el.id, Math.ceil(top + height / 2 - vh / 2))
    }
    scenes = sceneEls.map((el) => ({ top: Math.floor(el.getBoundingClientRect().top + y0), h: el.offsetHeight }))
    keys = buildKeys(anchors, { H, vh, maxScroll })
    if (moon && sun) gsap.set([moon, sun], { x: innerWidth * 0.89 - 56 })
    if (!pinOn && photoB) gsap.set([photoB, tagA ?? [], a247Hour ?? []], { clearProps: "opacity" })
    if (!pinOn) showA247Hour(hourA)
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
  const clock = createClock($$(".clock-time"), fmt(scrollY === 0 ? -10 : 0), (el) => mqDesk.matches === !!el.closest(".clock-rail"))
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
  // Letture e scritture separate: nel fotogramma le posizioni si leggono prima di qualsiasi scrittura,
  // così il calcolo degli stili non viene forzato una seconda volta a metà del lavoro.
  const readTops = (list: Iterable<Photo>) => [...list].map((ph) => [ph, ph.pic.getBoundingClientRect().top] as const)
  function lightPhotos(list: Iterable<Photo>) {
    writePhotos(readTops(list))
  }
  function writePhotos(tops: readonly (readonly [Photo, number])[]) {
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
    const photoTops = active.size || leaving.size ? readTops([...active, ...leaving]) : null

    // Cielo.
    const { o, z } = layerValues(t)
    for (let i = 0; i < layers.length; i++) {
      if (o[i] !== lastO[i]) layerO[i]((lastO[i] = o[i]))
      if (z[i] !== lastZ[i]) layers[i].style.zIndex = String((lastZ[i] = z[i]))
    }

    // Disco (solo desktop: sotto 1024 è nascosto).
    if (mqDesk.matches && setMoonY && setMoonO && setSunY && setSunO) {
      const [my, mo, sy, so] = discState(t)
      const mc = discCenter(my, vh)
      const suc = discCenter(sy, vh)
      setMoonY(mc - 56)
      setMoonO(mo)
      setSunY(suc - 56)
      setSunO(so)
      // Una scena a tutto schermo che arriva a meno di 12vh dal disco visibile lo spegne (200 ms, in CSS).
      const m = 56 + 0.12 * vh
      let hide = false
      for (const s of scenes) {
        const a = s.top - y
        const b = a + s.h
        if ((mo > 0 && a < mc + m && b > mc - m) || (so > 0 && a < suc + m && b > suc - m)) hide = true
      }
      if (hide !== discHidden) disc?.classList.toggle("is-hidden", (discHidden = hide))
    }

    // Indicatore sul binario (durante l'intro segue la sua interpolazione).
    const ti = intro ? intro.t : t
    const iy = rail.top + (rail.h * ti) / 1440 - 7
    setIndY?.(iy)
    const ic = iy + 7
    setNowY?.(ic - nowH / 2)
    // Capitoli: spento quello che l'ora sta coprendo; tutti spenti sopra le scene a tutto schermo.
    for (const m of marks) {
      const near = Math.abs(rail.top + (rail.h * m.t) / 1440 - ic) < NEAR
      if (near !== m.near) m.el.classList.toggle("is-near", (m.near = near))
    }
    let sc = false
    let covered = false
    for (const s of scenes) {
      if (s.top - y < rail.top + rail.h && s.top + s.h - y > rail.top) sc = true
      // Il palco (fermo o no) copre tutto lo schermo: il cielo dietro non si vede e non va composto.
      if (s.top - y <= 0 && s.top + s.h - y >= vh) covered = true
    }
    if (covered !== skyHidden) sky?.classList.toggle("is-covered", (skyHidden = covered))
    if (sc !== inScene) {
      inScene = sc
      railEl.toggleAttribute("data-scene", sc)
    }

    // Fasi: dark/light nei due soli punti, D a quattro fasi. Senza palco fermo (telefono, schermi bassi) una scena
    // a tutto schermo sotto l'header tiene l'interfaccia scura finché il suo fondo non è passato sotto l'header.
    let ph: string = uiPhase(t)
    let dp: string = dPhase(t)
    if (!pinOn) for (const s of scenes) if (s.top - y < H && s.top + s.h - y > H) [ph, dp] = ["dark", "notte"]
    if (ph !== phase) root.dataset.phase = phase = ph
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
    if (pinOn && setBO) {
      const b = clamp((clamp((y - pin.s) / (pin.e - pin.s)) - 0.4) / 0.2)
      setBO(b)
      setTagA?.(1 - b)
      // Il numerale si spegne nella prima metà della dissolvenza e si riaccende con l'ora della seconda foto.
      setHourO?.(b < 0.5 ? 1 - 2 * b : 2 * b - 1)
      showA247Hour(b < 0.5 ? hourA : hourB)
    }
    if (setCambio) {
      const p = pinOn ? (y - cambioM.top) / (cambioM.h - vh || 1) : (y - cambioM.top + vh) / (cambioM.h + vh)
      setCambio(1.08 - 0.08 * clamp(p))
    }
    if (setSera) setSera(1.06 - 0.06 * clamp((y - seraM.top + vh) / (seraM.h + vh)))

    // Foto.
    if (photoTops) {
      writePhotos(photoTops)
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
  // Arrivo con #cambio-turno o #sera: il salto nativo porta la cima sotto l'header, ma lì l'ora è al centro.
  const hashId = safeDecode(location.hash.slice(1))
  const hashEl = hashId && centerAt.has(hashId) ? document.getElementById(hashId) : null
  if (hashEl && Math.abs(hashEl.getBoundingClientRect().top - H) < 4) scrollTo(0, centerAt.get(hashId)!)
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

  // Scene a tutto schermo: a uno schermo di distanza la foto si decodifica (una volta) e riceve il suo strato;
  // all'uscita lo strato si toglie, così fuori campo non resta una superficie da 1440 × 900 in memoria.
  const stagePhotos = new Map<Element, HTMLElement>()
  for (const ph of [cambio, sera]) {
    const sec = ph?.closest("section")
    if (ph && sec) stagePhotos.set(sec, ph)
  }
  const decoded = new WeakSet<HTMLImageElement>()
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const ph = stagePhotos.get(e.target)
        if (!ph) continue
        ph.style.willChange = e.isIntersecting ? "transform" : ""
        const img = $<HTMLImageElement>("img", ph)
        if (e.isIntersecting && img && !decoded.has(img)) {
          decoded.add(img)
          img.loading = "eager"
          void img.decode?.().catch(() => {})
        }
      }
    },
    { rootMargin: "100% 0px 100% 0px" },
  )
  for (const sec of stagePhotos.keys()) near.observe(sec)

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
  // I passi di «come funziona» entrano prima, al 92% dello schermo: altrimenti l'ultimo quinto resta vuoto.
  const revealLate = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add("is-in")
        revealLate.unobserve(e.target)
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0 },
  )
  const early = new Set($$("#come-funziona [data-reveal]", main))
  const pending = $$(REVEAL).map((el) => [el, el.getBoundingClientRect().top] as const)
  for (const [el, top] of pending) {
    const e = early.has(el)
    if (top < vh * (e ? 0.92 : 0.75)) el.classList.add("is-in")
    else (e ? revealLate : reveal).observe(el)
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
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href^='#']")
    const id = a ? safeDecode(a.hash.slice(1)) : ""
    const target = id ? document.getElementById(id) : null
    if (!target) return
    const at = centerAt.get(id)
    // Senza scorrimento morbido il salto resta nativo, salvo le sezioni con l'ora al centro.
    if (!smooth && at === undefined) return
    e.preventDefault()
    history.pushState(null, "", `#${id}`)
    if (!smooth) {
      scrollTo(0, at!)
      return
    }
    smooth.scrollTo(at ?? target, () => {
      // Come la navigazione nativa: il prossimo Tab parte dalla sezione raggiunta.
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1")
        target.style.outline = "none"
      }
      // Se il fuoco è già dentro la sezione (per esempio sul campo Nome dopo «Richiedi un preventivo») non si sposta.
      if (!target.contains(document.activeElement) || document.activeElement === document.body) target.focus({ preventScroll: true })
    })
  })

  // Navigazione nello stesso documento verso #cambio-turno o #sera (hash scritto a mano, location.hash): il salto nativo
  // porta la cima sotto l'header, ma lì l'ora è al centro della sezione.
  addEventListener("hashchange", () => {
    const id = safeDecode(location.hash.slice(1))
    const at = centerAt.get(id)
    const el = at === undefined ? null : document.getElementById(id)
    if (el && Math.abs(el.getBoundingClientRect().top - H) < 4) scrollTo(0, at!)
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

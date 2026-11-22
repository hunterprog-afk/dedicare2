// Sempre caricato, piccolo: header pieno oltre 80 px, barra contatti del telefono dopo l'hero,
// chiusura del foglio dell'indice prima dello scroll alle ancore e, senza movimento, l'ora della sezione in vista.

import italicUrl from "@fonts/literata/files/literata-latin-opsz-italic.woff2?url"

const root = document.documentElement

// Il corsivo di Literata pesa 113 KB e serve solo a testi sotto la prima schermata: si scarica quando uno sta per entrare in vista.
const italicTargets = document.querySelectorAll(".hour-label, .passi-chiusura, .form-title, .footer-slogan")
if (italicTargets.length && "FontFace" in window) {
  const loadItalic = () => {
    const face = new FontFace("Literata", `url(${italicUrl}) format("woff2")`, {
      style: "italic",
      weight: "200 900",
      display: "swap",
      unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    })
    void face.load().then((f) => document.fonts.add(f), () => {})
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          loadItalic()
        }
      },
      { rootMargin: "100px 0px" },
    )
    italicTargets.forEach((el) => io.observe(el))
  } else {
    loadItalic()
  }
}
const header = document.querySelector<HTMLElement>(".site-header")
if (header) {
  let solid: boolean | null = null
  const update = () => {
    const next = header.classList.contains("site-header-legal") || scrollY > 80
    if (next !== solid) header.classList.toggle("is-solid", (solid = next))
  }
  update()
  addEventListener("scroll", update, { passive: true })
}

const bar = document.querySelector<HTMLElement>(".mobile-bar")
const hero = document.getElementById("inizio")
if (bar && hero && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => !e.isIntersecting)) {
      bar.classList.add("is-shown")
      io.disconnect()
    }
  })
  io.observe(hero)
} else if (bar) {
  bar.classList.add("is-shown")
}

const sheet = document.getElementById("indice-ore")
sheet?.addEventListener("click", (e) => {
  if ((e.target as Element).closest("a[href^='#']")) (sheet as HTMLElement).hidePopover?.()
})

// Senza movimento: l'ora è quella stampata sulla sezione che passa sotto l'header, l'indicatore salta.
const rail = document.querySelector(".clock-rail")
if (rail && matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  root.classList.add("rm")
  const secs = [...document.querySelectorAll<HTMLElement>("main [data-label-hour]")]
  const marks = [...document.querySelectorAll<HTMLElement>("[data-chapter]")]
  const chapters = new Set(marks.map((m) => m.dataset.chapter))
  const times = document.querySelectorAll(".clock-time")
  const moving = [...rail.querySelectorAll<HTMLElement>(".clock-indicator, .clock-now")]
  const pill = document.querySelector(".clock-pill")
  const aria = pill?.getAttribute("aria-label") ?? ""
  const seen = new Set<Element>()
  let line = 72
  const show = () => {
    // Fra le sezioni che toccano la linea, quella che comincia sopra la linea (l'ultima, se due si toccano).
    let i = -1
    secs.forEach((s, k) => seen.has(s) && s.getBoundingClientRect().top <= line + 0.5 && (i = k))
    if (i < 0) return
    const s = secs[i]
    const label = s.dataset.labelHour ?? "22:00"
    const [h, m] = label.split(":").map(Number)
    const t = s.dataset.hour === "1440" ? 1440 : (h * 60 + m + 120) % 1440
    const tone = s.dataset.tone
    root.dataset.phase = tone === "dark" ? "dark" : "light"
    root.dataset.dphase = tone === "dark" ? "notte" : tone === "light" ? "mattino" : "tramonto"
    times.forEach((el) => (el.textContent = label))
    pill?.setAttribute("aria-label", aria.replace(/\d\d:\d\d/, label))
    moving.forEach((el, k) => (el.style.transform = `translateY(calc(${20 + t / 24}vh - ${k ? 11 : 7}px))`))
    let c = i
    while (c > 0 && !chapters.has(secs[c].id)) c--
    marks.forEach((el) => (el.dataset.chapter === secs[c].id ? el.setAttribute("aria-current", "location") : el.removeAttribute("aria-current")))
  }
  // La linea è una fascia di 1 px sotto l'header; si ricrea quando cambia la finestra.
  let io: IntersectionObserver | undefined
  const watch = () => {
    io?.disconnect()
    seen.clear()
    line = innerWidth >= 1024 ? 72 : 60
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target)
          else seen.delete(e.target)
        }
        show()
      },
      { rootMargin: `-${line}px 0px -${Math.max(0, innerHeight - line - 1)}px 0px` },
    )
    secs.forEach((s) => io!.observe(s))
  }
  watch()
  let timer = 0
  addEventListener("resize", () => {
    clearTimeout(timer)
    timer = window.setTimeout(watch, 150)
  })
}

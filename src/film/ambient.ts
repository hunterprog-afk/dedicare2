// Movimento di contorno, caricato a pagina ferma: scroll morbido (Lenis, solo computer), ingressi delle sezioni dopo il film
// e attrazione magnetica dei bottoni (solo computer). Tutto spento con «riduci movimento».
import type Lenis from "lenis"

let lenis: Lenis | null = null
export const getLenis = () => lenis

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches
const fine = () => matchMedia("(hover: hover) and (pointer: fine)").matches

function reveals(): () => void {
  if (!("IntersectionObserver" in window)) return () => {}
  const items = [...document.querySelectorAll<HTMLElement>("[data-reveal]")]
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in")
          io.unobserve(e.target)
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  )
  for (const el of items) {
    // Solo ciò che sta sotto lo schermo parte nascosto: il resto resta com'è, senza lampeggi.
    if (el.getBoundingClientRect().top > innerHeight) {
      el.classList.add("rv-hide")
      io.observe(el)
    }
  }
  return () => io.disconnect()
}

function magnetic(): () => void {
  const cleanups: (() => void)[] = []
  for (const el of document.querySelectorAll<HTMLElement>(".btn")) {
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) / r.width
      const y = (e.clientY - (r.top + r.height / 2)) / r.height
      el.style.transform = `translate3d(${(x * 10).toFixed(1)}px, ${(y * 8).toFixed(1)}px, 0)`
    }
    const leave = () => {
      el.style.transform = ""
    }
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerleave", leave)
    cleanups.push(() => {
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerleave", leave)
    })
  }
  return () => cleanups.forEach((c) => c())
}

export function startAmbient(): () => void {
  if (reduce()) return () => {}
  const stops = [reveals()]
  let raf = 0
  let dead = false
  if (fine()) {
    stops.push(magnetic())
    void import("lenis").then(({ default: L }) => {
      if (dead) return
      lenis = new L({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true })
      const loop = (t: number) => {
        lenis?.raf(t)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    })
  }
  return () => {
    dead = true
    cancelAnimationFrame(raf)
    lenis?.destroy()
    lenis = null
    stops.forEach((s) => s())
  }
}

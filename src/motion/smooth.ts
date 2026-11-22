// Scorrimento morbido (solo da 1024 px in su e con puntatore fine). Scorre la finestra nativa:
// il motore continua a leggere window.scrollY.
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import type { gsap as Gsap } from "gsap"

export interface Smooth {
  scrollTo(el: HTMLElement, onDone: () => void): void
  destroy(): void
}

export function createSmooth(gsap: typeof Gsap): Smooth {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false })
  const raf = (time: number) => lenis.raf(time * 1000)
  // In testa al ticker: la posizione è aggiornata prima che il motore la legga nello stesso fotogramma.
  gsap.ticker.add(raf, false, true)
  gsap.ticker.lagSmoothing(0)
  return {
    // Lenis sottrae già lo scroll-margin-top della sezione (72 px): nessun offset in più.
    scrollTo: (el, onDone) => lenis.scrollTo(el, { duration: 1.2, onComplete: onDone }),
    destroy() {
      gsap.ticker.remove(raf)
      lenis.destroy()
    },
  }
}

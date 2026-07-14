import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeAll } from "vitest"
import i18n from "@/i18n"

// jsdom non implementa scrollIntoView / matchMedia / IntersectionObserver:
// componenti come BlurText (usa `useInView` di motion/react) o ThemeToggle
// li chiamano incondizionatamente — senza questi stub qualunque test che
// monta l'albero di Curriculum (che importa BlurText) fallisce con
// "not implemented", anche se il comportamento sotto test non li riguarda.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// Cast a `unknown` invece di implementare l'interfaccia per intero: sono
// stub minimi, non serve conformità completa (scrollMargin ecc.), e
// `typeof window.X === "undefined"` evita la narrowing di `window` a
// `never` che TS applica su `"X" in window` quando X è una proprietà
// sempre presente nei @types/DOM.
if (typeof window.IntersectionObserver === "undefined") {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
}

if (typeof window.ResizeObserver === "undefined") {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
}

// Il LanguageDetector di i18next legge navigator.language, che in jsdom
// vale "en-US" di default — senza forzare "it" i test vedrebbero le
// traduzioni inglesi invece del contenuto italiano di default del sito,
// rendendo le asserzioni sul testo fragili/non deterministiche.
beforeAll(async () => {
  await i18n.changeLanguage("it")
})

afterEach(() => {
  cleanup()
})

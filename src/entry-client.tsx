import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import "./styles/index.css"
import { App } from "./App"
import { initI18n } from "./i18n/core"
import { getRoute, isHome, routeFromPath } from "./routes"

const root = document.getElementById("root")!
const route = routeFromPath(location.pathname)
const { lang } = getRoute(route)

// Solo la lingua della pagina: l'altra non si scarica.
const resources = (await import(`./i18n/locales/${lang}.json`)).default
const i18n = initI18n(lang, { [lang]: { translation: resources } })

const app = (
  <StrictMode>
    <App route={route} i18n={i18n} />
  </StrictMode>
)

if (root.firstElementChild) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}

void import("./motion/basic")

if (isHome(route) && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const start = () => void import("./motion/engine")
  if ("requestIdleCallback" in window) {
    requestIdleCallback(start, { timeout: 1500 })
  } else {
    addEventListener("load", () => setTimeout(start, 1), { once: true })
  }
}

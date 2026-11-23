import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import "./styles/index.css"
import "./components/shell/Footer.css"
import "./components/legal/LegalPage.css"
import { App, type LegalComponent } from "./App"
import { initI18n } from "./i18n/core"
import { getRoute, isHome, routeFromPath } from "./routes"

const root = document.getElementById("root")!
const route = routeFromPath(location.pathname)
const { lang } = getRoute(route)

// Solo la lingua della pagina: l'altra non si scarica. Le pagine legali sono un chunk a parte, scaricato solo sulle loro rotte.
const [resources, Legal] = await Promise.all([
  import(`./i18n/locales/${lang}.json`).then((m) => m.default as object),
  isHome(route) ? undefined : import("./components/legal/LegalPage").then((m): LegalComponent => m.LegalPage),
])
const i18n = initI18n(lang, { [lang]: { translation: resources } })

const app = (
  <StrictMode>
    <App route={route} i18n={i18n} Legal={Legal} />
  </StrictMode>
)

if (root.firstElementChild) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}

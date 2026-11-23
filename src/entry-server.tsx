import { renderToString } from "react-dom/server"
import titleUrl from "./assets/fonts/big-shoulders-titoli.woff2?url"
import bodyUrl from "./assets/fonts/host-grotesk-testo.woff2?url"
import monoUrl from "./assets/fonts/martian-mono-ore.woff2?url"
import { App } from "./App"
import { LegalPage } from "./components/legal/LegalPage"
import { createI18n } from "./i18n"
import { buildHead } from "./lib/head"
import { getRoute, routeFromPath } from "./routes"

export function render(path: string) {
  const route = routeFromPath(path)
  const def = getRoute(route)
  const i18n = createI18n(def.lang)
  return {
    html: renderToString(<App route={route} i18n={i18n} Legal={LegalPage} />),
    head: buildHead({ route, t: i18n.t, fontUrls: [titleUrl, bodyUrl, monoUrl] }),
    lang: def.lang,
  }
}

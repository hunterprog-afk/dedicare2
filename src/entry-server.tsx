import { renderToString } from "react-dom/server"
import literataUrl from "@fonts/literata/files/literata-latin-opsz-normal.woff2?url"
import atkinsonUrl from "@fonts/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2?url"
import { App } from "./App"
import { createI18n } from "./i18n"
import { buildHead } from "./lib/head"
import { getRoute, routeFromPath } from "./routes"

export function render(path: string) {
  const route = routeFromPath(path)
  const def = getRoute(route)
  const i18n = createI18n(def.lang)
  return {
    html: renderToString(<App route={route} i18n={i18n} />),
    head: buildHead({ route, t: i18n.t, fontUrls: [literataUrl, atkinsonUrl] }),
    lang: def.lang,
    phase: def.phase,
  }
}

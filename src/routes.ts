export type RouteId = "home-it" | "home-en" | "privacy" | "cookie" | "note-legali"
export type Lang = "it" | "en"

export interface RouteDef {
  id: RouteId
  path: string
  file: string
  lang: Lang
}

export const ROUTES: readonly RouteDef[] = [
  { id: "home-it", path: "/", file: "index.html", lang: "it" },
  { id: "home-en", path: "/en/", file: "en/index.html", lang: "en" },
  { id: "privacy", path: "/privacy/", file: "privacy/index.html", lang: "it" },
  { id: "cookie", path: "/cookie/", file: "cookie/index.html", lang: "it" },
  { id: "note-legali", path: "/note-legali/", file: "note-legali/index.html", lang: "it" },
]

export function getRoute(id: RouteId): RouteDef {
  return ROUTES.find((r) => r.id === id) ?? ROUTES[0]
}

export function isHome(id: RouteId): boolean {
  return id === "home-it" || id === "home-en"
}

/** Normalizza con la barra finale; un percorso sconosciuto vale la home italiana. */
export function routeFromPath(pathname: string): RouteId {
  const p = pathname.endsWith("/") ? pathname : `${pathname}/`
  return ROUTES.find((r) => r.path === p)?.id ?? "home-it"
}

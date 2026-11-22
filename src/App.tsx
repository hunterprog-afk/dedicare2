import type { ComponentType } from "react"
import { I18nextProvider, type I18n } from "@/i18n/react"
import { isHome, type RouteId } from "@/routes"
import { Home } from "@/pages/Home"
import type { LegalKind } from "@/components/legal/LegalPage"

export type LegalComponent = ComponentType<{ kind: LegalKind }>

/**
 * L'istanza i18n arriva da fuori: il server e i test usano entrambe le lingue, il client solo la sua.
 * Le pagine legali arrivano da fuori per la stessa ragione: il client le scarica solo sulle loro rotte.
 */
export function App({ route, i18n, Legal }: { route: RouteId; i18n: I18n; Legal?: LegalComponent }) {
  return (
    <I18nextProvider i18n={i18n}>
      {isHome(route) || !Legal ? <Home /> : <Legal kind={route as LegalKind} />}
    </I18nextProvider>
  )
}

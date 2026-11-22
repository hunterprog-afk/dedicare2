import { I18nextProvider } from "react-i18next"
import type { i18n } from "i18next"
import { isHome, type RouteId } from "@/routes"
import { Home } from "@/pages/Home"
import { LegalPage } from "@/components/legal/LegalPage"

/** L'istanza i18n arriva da fuori: il server e i test usano entrambe le lingue, il client solo la sua. */
export function App({ route, i18n }: { route: RouteId; i18n: i18n }) {
  return (
    <I18nextProvider i18n={i18n}>
      {isHome(route) ? <Home /> : <LegalPage kind={route as "privacy" | "cookie" | "note-legali"} />}
    </I18nextProvider>
  )
}

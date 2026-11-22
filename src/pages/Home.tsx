import { useEffect } from "react"
import { useTranslation } from "@/i18n/react"
import { Header } from "@/components/shell/Header"
import { Footer } from "@/components/shell/Footer"
import { MobileBar } from "@/components/shell/MobileBar"
import { Film } from "@/components/film/Film"
import { ComeFunziona, Contatti, Dove, Faq, LavoraConNoi, PerChi, Tariffe } from "@/components/sections/After"

/** Pagina unica: il film (7 scene a scroll) e, dopo, le sezioni informative. Pillola in vetro in alto, barra Chiama/WhatsApp sul telefono. */
export function Home() {
  const { t } = useTranslation()
  useEffect(() => {
    let stop: (() => void) | undefined
    let dead = false
    const go = () =>
      void import("@/film/ambient").then((m) => {
        if (!dead) stop = m.startAmbient()
      })
    if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 1500 })
    else setTimeout(go, 300)
    return () => {
      dead = true
      stop?.()
    }
  }, [])
  return (
    <>
      <a className="skip" href="#contenuto">
        {t("a11y.skip")}
      </a>
      <Header />
      <main id="contenuto">
        <Film />
        <ComeFunziona />
        <PerChi />
        <Dove />
        <Tariffe />
        <Faq />
        <LavoraConNoi />
        <Contatti />
      </main>
      <Footer />
      <MobileBar />
    </>
  )
}

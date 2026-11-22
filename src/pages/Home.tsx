import { useTranslation } from "@/i18n/react"
import { Sky } from "@/components/shell/Sky"
import { Disc } from "@/components/shell/Disc"
import { Header } from "@/components/shell/Header"
import { ClockRail } from "@/components/shell/ClockRail"
import { HourIndex } from "@/components/shell/HourIndex"
import { Footer } from "@/components/shell/Footer"
import { MobileBar } from "@/components/shell/MobileBar"
import { DWindow } from "@/components/shell/DWindow"
import { Hero } from "@/components/sections/Hero"
import { AChi } from "@/components/sections/AChi"
import { ServiziOrario } from "@/components/sections/ServiziOrario"
import { Assistenza247 } from "@/components/sections/Assistenza247"
import { CambioTurno } from "@/components/sections/CambioTurno"
import { OperatoriOss } from "@/components/sections/OperatoriOss"
import { Accompagnamento } from "@/components/sections/Accompagnamento"
import { Multidisciplinare } from "@/components/sections/Multidisciplinare"
import { Perche } from "@/components/sections/Perche"
import { ComeFunziona } from "@/components/sections/ComeFunziona"
import { Aree } from "@/components/sections/Aree"
import { Tariffe } from "@/components/sections/Tariffe"
import { Sera } from "@/components/sections/Sera"
import { Faq } from "@/components/sections/Faq"
import { LavoraConNoi } from "@/components/sections/LavoraConNoi"
import { Contatti } from "@/components/sections/Contatti"

/** Pagina unica: guscio fisso (cielo, disco, header, orologio) e le 16 sezioni nell'ordine della specifica. */
export function Home() {
  const { t } = useTranslation()
  return (
    <>
      <a className="skip" href="#contenuto">
        {t("a11y.skip")}
      </a>
      <Sky />
      <Disc />
      <Header />
      <ClockRail />
      <HourIndex />
      <main id="contenuto">
        <Hero />
        <AChi />
        <ServiziOrario />
        <Assistenza247 />
        <CambioTurno />
        <OperatoriOss />
        <Accompagnamento />
        <Multidisciplinare />
        <Perche />
        <ComeFunziona />
        <Aree />
        <Tariffe />
        <Sera />
        <Faq />
        <LavoraConNoi />
        <Contatti />
      </main>
      <Footer />
      <MobileBar />
      <DWindow />
    </>
  )
}

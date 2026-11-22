import { useEffect, useRef } from "react"
import { useTranslation } from "@/i18n/react"
import { HourLabel } from "../HourLabel"
import { Picture } from "../Picture"
import { Sheet } from "../Sheet"
import { PlusIcon } from "../icons"
import { CurriculumForm } from "../forms/CurriculumForm"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import "./Common.css"
import "./Night.css"

interface Reason {
  title: string
  body: string
}

/** 21:00, lavora con noi: foto ferma a sinistra, motivi in righe e il modulo di candidatura nel foglio. */
export function LavoraConNoi() {
  const { t } = useTranslation()
  const reasons = t("curriculum.reasons", { returnObjects: true }) as Reason[]
  const detailsRef = useRef<HTMLDetailsElement>(null)

  // Sul telefono il modulo sta chiuso dietro «Candidati ora» (i quattro motivi restano in vista); da 1024 px è sempre aperto.
  // Il pre-render lo lascia chiuso, come lo vede il telefono: la lunghezza della pagina non cambia dopo il caricamento
  // e l'ancora dell'URL (#contatti) resta giusta. Da 1024 px il foglio è visibile per CSS (::details-content);
  // `open` serve solo ai browser che non lo supportano e senza JavaScript il bottone resta comunque cliccabile.
  useEffect(() => {
    const el = detailsRef.current
    if (!el || typeof window.matchMedia !== "function") return
    const mq = window.matchMedia("(min-width: 1024px)")
    if (mq.matches) el.open = true
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) el.open = true
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return (
    <section {...sectionAttrs("lavora-con-noi")} className="section">
      <div className="wrap grid12 items-start">
        <div className="lavora-photo col-span-full lg:col-[1/6] lg:row-start-1">
          <Picture name="sera-tram" sizes="(min-width:1024px) 426px, 100vw" light="night" objectPosition="75% 50%" />
        </div>
        <div className="col-span-full lg:col-[7/13] lg:row-start-1">
          <HourLabel time={SECTIONS["lavora-con-noi"].label} size="s" />
          <p className="t-eyebrow">{t("curriculum.eyebrow")}</p>
          <h2 className="t-h2">{t("curriculum.title")}</h2>
          <p className="t-lead sec-intro">{t("curriculum.intro")}</p>
          <h3 className="t-h3 sec-head-gap">{t("curriculum.reasons_title")}</h3>
          <ul className="lavora-reasons mt-6">
            {reasons.map((r) => (
              <li key={r.title}>
                <h4>{r.title}</h4>
                <p>{r.body}</p>
              </li>
            ))}
          </ul>
          <details ref={detailsRef} className="cv-details sec-head-gap">
            <summary className="btn cv-summary">
              <span>{t("curriculum.form_title")}</span>
              <PlusIcon />
            </summary>
            <Sheet>
              <CurriculumForm />
            </Sheet>
          </details>
        </div>
      </div>
    </section>
  )
}

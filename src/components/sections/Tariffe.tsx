import { useTranslation } from "@/i18n/react"
import { Button } from "../Button"
import { HourLabel } from "../HourLabel"
import { Sheet } from "../Sheet"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import "./Day.css"

interface Factor {
  title: string
  body: string
}

/** 18:00, tariffe: tutto il testo sta dentro il foglio, nessuna cifra. */
export function Tariffe() {
  const { t } = useTranslation()
  const factors = t("tariffario.factors", { returnObjects: true }) as Factor[]

  // Il modulo dei contatti ascolta `dedicare:prefill` e riempie il messaggio solo se è vuoto; poi il fuoco va sul campo Nome.
  const onCta = () => {
    window.dispatchEvent(new CustomEvent("dedicare:prefill", { detail: { message: t("tariffario.prefill") } }))
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>('#contatti input[autocomplete="name"]')?.focus({ preventScroll: true })
    }, 700)
  }

  return (
    <section {...sectionAttrs("tariffe")} className="section">
      <div className="wrap grid12">
        <Sheet className="tariffe-sheet col-span-full lg:col-[1/11]">
          <HourLabel time={SECTIONS.tariffe.label} size="s" style={{ color: "#231C4D" }} />
          <p className="t-eyebrow">{t("tariffario.eyebrow")}</p>
          <h2 className="t-h2">{t("tariffario.title")}</h2>
          <p className="t-lead sec-intro">{t("tariffario.intro")}</p>
          <div className="tariffe-factors">
            {factors.map((f) => (
              <div key={f.title}>
                <h3 className="t-h3">{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
          <div className="tariffe-cta">
            <Button href="#contatti" onClick={onCta}>
              <span className="max-sm:hidden">{t("tariffario.cta")}</span>
              <span className="sm:hidden">{t("tariffario.cta_short")}</span>
            </Button>
          </div>
        </Sheet>
      </div>
    </section>
  )
}

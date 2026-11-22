import { useEffect, useRef } from "react"
import { useTranslation } from "@/i18n/react"
import { HourLabel } from "../HourLabel"
import { Picture } from "../Picture"
import { SECTIONS, sectionAttrs } from "@/content/hours"
import { Bullets, ServiceDetails } from "./parts"
import "./Night.css"

const PHOTOS = [
  { name: "notte-lampada", time: "02:00", cls: "photo-a" },
  { name: "notte-cucina", time: "04:00", cls: "photo-b" },
] as const

/** 02:00, assistenza 24/7. Con movimento e schermo alto il palco resta fermo e la foto delle 04:00 si sovrappone a quella delle 02:00. */
export function Assistenza247() {
  const { t } = useTranslation()
  const k = "servizi.items.assistenza247"
  const stageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  // L'altezza che il testo richiede (colonna + margini del palco) va in una variabile CSS: se i dettagli aperti la portano
  // oltre lo schermo, il palco si ferma quando il suo fondo tocca il fondo dello schermo (`top` in Night.css) e nessuna riga resta tagliata.
  useEffect(() => {
    const stage = stageRef.current
    const text = textRef.current
    if (!stage || !text || typeof ResizeObserver === "undefined") return
    const sync = () => {
      const cs = getComputedStyle(stage)
      const need = text.offsetHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      stage.style.setProperty("--a247-h", `${need}px`)
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(text)
    return () => ro.disconnect()
  }, [])

  return (
    <section {...sectionAttrs("assistenza-24-7")} className="a247">
      <div ref={stageRef} className="a247-stage wrap grid12">
        <div ref={textRef} className="a247-text col-span-full lg:col-[1/6]">
          <HourLabel time={SECTIONS["assistenza-24-7"].label} size="l" className="a247-hour" />
          <h2 className="t-h2">{t(`${k}.title`)}</h2>
          <p className="sec-body">{t(`${k}.body`)}</p>
          <p className="emergency">{t(`${k}.emergenza`)}</p>
          <Bullets items={t(`${k}.bullets`, { returnObjects: true }) as string[]} />
          <ServiceDetails text={t(`${k}.longDescription`)} />
        </div>
        <div className="a247-photos col-span-full lg:col-[7/13]">
          {PHOTOS.map((p) => (
            <figure key={p.name} className={`a247-photo ${p.cls}`}>
              <span className="a247-tag photo-tag">{p.time}</span>
              <Picture name={p.name} sizes="(min-width:1024px) 840px, 100vw" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useEffect } from "react"
import { useTranslation } from "@/i18n/react"
import { Button } from "../Button"
import { WhatsAppIcon, XIcon } from "../icons"
import { PHONE_HREF, whatsappHref } from "@/content/contacts"
import { LINGER, PANELS, SCENE_SCROLL, TOTAL } from "@/film/data"
import "./Film.css"

interface SceneText {
  hour: string
  rail: string
  kicker: string
  title: string
  body: string
  tags: string[]
  alt: string
}

interface ServiceText {
  title: string
  longDescription: string
  bullets: string[]
  emergenza?: string
}

/** Titolo a parole in una maschera: ogni parola entra dal basso (il ritardo per riga lo calcola il motore). */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i, arr) => (
        <span key={i}>
          <span className="w" style={{ "--d": `${i * 45}ms` } as React.CSSProperties}>
            <span className="wi">{w}</span>
          </span>
          {i < arr.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  )
}

/** Il turno di 24 ore: sette scene a tutto schermo guidate dallo scroll. Tutto il testo sta qui, nell'HTML; il motore lo anima e basta. */
export function Film() {
  const { t } = useTranslation()
  const scenes = t("film.scenes", { returnObjects: true }) as SceneText[]
  const services = t("servizi.items", { returnObjects: true }) as Record<string, ServiceText>
  const wa = whatsappHref(t("whatsapp.prefill"))

  useEffect(() => {
    const root = document.getElementById("inizio")
    const html = document.documentElement
    if (!root || html.classList.contains("film-static")) return
    let stop: (() => void) | undefined
    let cancelled = false
    void import("@/film/engine").then((m) => {
      if (!cancelled) stop = m.mountFilm(root)
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])

  return (
    <section id="inizio" className="film" data-tone="dark" aria-label={t("film.aria")} style={{ "--film-w": TOTAL } as React.CSSProperties}>
      <div className="film-track">
        <div className="film-stage">
          {scenes.map((s, i) => {
            const n = i + 1
            const panel = PANELS[i]
            const svc = panel ? services[panel] : undefined
            const last = i === scenes.length - 1
            const Heading = i === 0 ? "h1" : "h2"
            return (
              <article
                key={n}
                id={`scena-${n}`}
                className="film-scene"
                data-i={i}
                data-hour={s.hour}
                data-weight={SCENE_SCROLL[i]}
                data-linger={LINGER[i]}
                data-clip={`/film/s${n}.mp4`}
                data-clip-m={`/film/s${n}-m.mp4`}
              >
                <div className="scene-media">
                  {i === 0 ? (
                    <picture>
                      <source media="(max-width: 859px)" srcSet="/film/s1-m.jpg" />
                      <img className="scene-poster" src="/film/s1.jpg" alt="" width={1280} height={704} fetchPriority="high" decoding="async" />
                    </picture>
                  ) : (
                    <img className="scene-poster" alt="" data-src={`/film/s${n}.jpg`} data-src-m={`/film/s${n}-m.jpg`} decoding="async" />
                  )}
                  <picture>
                    <source media="(max-width: 859px)" srcSet={`/film/s${n}-foto-m.webp`} />
                    <img className="scene-foto" src={`/film/s${n}-foto.webp`} alt={s.alt} width={1536} height={1024} loading="lazy" decoding="async" />
                  </picture>
                </div>
                <div className="scene-scrim" aria-hidden="true" />
                <div className="scene-copy">
                  <p className="scene-kicker rv">
                    <span className="scene-hour">{s.hour}</span>
                    <span className="scene-label">{s.kicker}</span>
                  </p>
                  <Heading className="scene-title">
                    <Words text={s.title} />
                  </Heading>
                  <p className="scene-body rv" style={{ "--rd": "380ms" } as React.CSSProperties}>
                    {s.body}
                  </p>
                  {s.tags.length > 0 && (
                    <ul className="scene-tags rv" style={{ "--rd": "460ms" } as React.CSSProperties}>
                      {s.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  )}
                  {(i === 0 || last) && (
                    <div className="scene-actions rv" style={{ "--rd": "540ms" } as React.CSSProperties}>
                      <Button href={PHONE_HREF}>{t("film.call")}</Button>
                      <Button variant="secondary" href={wa} target="_blank" rel="noopener noreferrer" icon={<WhatsAppIcon />}>
                        {t("film.whatsapp")}
                      </Button>
                      {last && (
                        <a className="scene-more" href="#contatti">
                          {t("film.write")}
                        </a>
                      )}
                    </div>
                  )}
                  {i === 0 && (
                    <p className="scene-hint rv" style={{ "--rd": "700ms" } as React.CSSProperties}>
                      <i aria-hidden="true" />
                      {t("film.scroll")}
                    </p>
                  )}
                  {svc && (
                    <button type="button" className="scene-more rv" style={{ "--rd": "540ms" } as React.CSSProperties} popoverTarget={`di-piu-${panel}`}>
                      {t("film.more")}
                    </button>
                  )}
                </div>
                {svc && (
                  <div id={`di-piu-${panel}`} className="panel" popover="auto" aria-labelledby={`di-piu-${panel}-t`}>
                    <button type="button" className="panel-close" popoverTarget={`di-piu-${panel}`} popoverTargetAction="hide" aria-label={t("film.close")}>
                      <XIcon />
                    </button>
                    <p className="panel-hour">{s.hour}</p>
                    <h3 id={`di-piu-${panel}-t`} className="panel-title">
                      {svc.title}
                    </h3>
                    <p className="panel-long">{svc.longDescription}</p>
                    <ul className="panel-list">
                      {svc.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    {svc.emergenza && <p className="panel-emergency">{svc.emergenza}</p>}
                  </div>
                )}
              </article>
            )
          })}
          <div className="film-veil" aria-hidden="true" />
          <div className="film-grain" aria-hidden="true" />
        </div>
      </div>
      <nav className="film-rail" aria-label={t("film.rail_aria")}>
        {scenes.map((s, i) => (
          <button key={s.hour + i} type="button" className="rail-item" data-go={i} aria-label={`${s.hour}, ${s.rail}`}>
            <span className="rail-hour" aria-hidden="true">
              {s.hour}
            </span>
            <i aria-hidden="true" />
          </button>
        ))}
      </nav>
      <p className="film-note">{t("film.note")}</p>
    </section>
  )
}

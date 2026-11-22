import type { ReactNode } from "react"
import { HourLabel } from "../HourLabel"
import { SECTIONS, sectionAttrs, type SectionId } from "@/content/hours"

interface Props {
  id: Exclude<SectionId, "inizio">
  title: ReactNode
  /** Elementi vuoti che tengono vive le vecchie ancore (`filosofia`, `processo`). */
  legacyAnchor?: string
}

/** Segnaposto di una sezione: fissa id, toni, bande e ore; chi costruisce la sezione sostituisce il file che lo usa. */
export function SectionPlaceholder({ id, title, legacyAnchor }: Props) {
  return (
    <section {...sectionAttrs(id)} data-placeholder={id} className="section">
      {legacyAnchor && <span id={legacyAnchor} aria-hidden="true" />}
      <div className="wrap">
        <HourLabel time={SECTIONS[id].label} size="s" />
        <h2 className="t-h2">{title}</h2>
      </div>
    </section>
  )
}

import { useState, useId } from "react"

type Partner = {
  name: string
  abbr: string
  full: string
  color: string
  icon: "shield" | "cross" | "building" | "people" | "hands" | "heart"
}

export const PARTNERS_DATA: Partner[] = [
  {
    name: "INPS",
    abbr: "INPS",
    full: "Istituto Nazionale Previdenza Sociale",
    color: "#0066B3",
    icon: "building",
  },
  {
    name: "ASL Milano",
    abbr: "ASL",
    full: "Azienda Socio-Sanitaria Locale Milano",
    color: "#15A89A",
    icon: "shield",
  },
  {
    name: "Croce Rossa",
    abbr: "CRI",
    full: "Croce Rossa Italiana",
    color: "#E30613",
    icon: "cross",
  },
  {
    name: "ANOSS",
    abbr: "ANOSS",
    full: "Associazione Naz. Operatori Socio-Sanitari",
    color: "#5B5BD6",
    icon: "people",
  },
  {
    name: "Sacra Famiglia",
    abbr: "FSF",
    full: "Fondazione Sacra Famiglia",
    color: "#C97D10",
    icon: "hands",
  },
  {
    name: "AIAS",
    abbr: "AIAS",
    full: "Associazione Italiana Assistenza Spastici",
    color: "#0B5FA5",
    icon: "heart",
  },
]

const ICONS: Record<Partner["icon"], React.ReactElement> = {
  shield: (
    <path d="M12 2L3 6v6c0 5 3.5 9.5 9 11 5.5-1.5 9-6 9-11V6l-9-4z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.6" />
  ),
  cross: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12" />
      <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="1" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10h2M14 10h2M8 14h2M14 14h2M11 17h2v3h-2z" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="9" r="2.5" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 20c0-2.5 2-4.5 4.5-4.5S23 17.5 23 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </>
  ),
  hands: (
    <>
      <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 11c0 5.5-7 10-7 10z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  heart: (
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.6" />
  ),
}

type Props = { partner: Partner; variant?: "dark" | "light" }

export function PartnerBadge({ partner, variant = "dark" }: Props) {
  const isLight = variant === "light"
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  const handleClick = () => setOpen((o) => !o)

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--secondary))] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isLight
          ? "bg-white border border-[hsl(220,12%,88%)] hover:border-[hsl(220,12%,72%)] hover:shadow-md"
          : "bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-white/18"
      }`}
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={handleClick}
      aria-describedby={tooltipId}
    >
      {/* Tooltip */}
      <div
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 bottom-[calc(100%+10px)] -translate-x-1/2 z-30 w-[min(280px,calc(100vw-32px))] max-w-[280px] px-3 py-3 rounded-xl bg-[#161D2E]/95 backdrop-blur border border-[hsl(var(--secondary))]/30 shadow-[0_8px_24px_rgba(0,0,0,0.35)] text-white/80 text-sm leading-snug font-body transition-all duration-200 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
        aria-hidden={!open}
      >
        {partner.full}
        {/* Arrow */}
        <span
          className="absolute left-1/2 top-full -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-[#161D2E]/95 border-r border-b border-[hsl(var(--secondary))]/30 -mt-[5px]"
          aria-hidden="true"
        />
      </div>

      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
        style={{
          background: isLight
            ? `${partner.color}15`
            : `${partner.color}22`,
          color: partner.color,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
          {ICONS[partner.icon]}
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={`font-display text-sm tracking-wide ${
            isLight ? "text-[hsl(220,30%,14%)]" : "text-white/95"
          }`}
        >
          {partner.abbr}
        </span>
        <span
          className={`font-body text-[10px] uppercase tracking-wider ${
            isLight ? "text-[hsl(220,12%,42%)]" : "text-white/50"
          }`}
        >
          {partner.name}
        </span>
      </div>
    </div>
  )
}

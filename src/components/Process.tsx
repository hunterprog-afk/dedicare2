import { m } from "motion/react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"
import { PROCESS_STEPS } from "@/lib/constants"

type TranslatedStep = { title: string; body: string }

const TEAL = "#3FB9A1"

const svgProps = {
  width: 80,
  height: 80,
  viewBox: "0 0 80 80",
  fill: "none",
  stroke: TEAL,
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function PhoneWaves() {
  return (
    <svg {...svgProps} aria-hidden="true">
      {/* Phone */}
      <rect x="20" y="22" width="22" height="36" rx="4" />
      <line x1="26" y1="28" x2="36" y2="28" />
      <circle cx="31" cy="52" r="1.5" fill={TEAL} stroke="none" />
      {/* Sound waves */}
      <path d="M50 32 Q56 40 50 48" opacity="0.85" />
      <path d="M56 28 Q66 40 56 52" opacity="0.6" />
      <path d="M62 24 Q76 40 62 56" opacity="0.35" />
    </svg>
  )
}

function ClipboardCheck() {
  return (
    <svg {...svgProps} aria-hidden="true">
      {/* Clipboard */}
      <rect x="22" y="20" width="36" height="42" rx="3" />
      <rect x="32" y="16" width="16" height="8" rx="2" />
      {/* Checklist */}
      <path d="M28 34 l3 3 l5 -6" />
      <line x1="40" y1="36" x2="52" y2="36" />
      <path d="M28 46 l3 3 l5 -6" />
      <line x1="40" y1="48" x2="52" y2="48" />
      <line x1="28" y1="58" x2="36" y2="58" opacity="0.5" />
    </svg>
  )
}

function DocumentPerson() {
  return (
    <svg {...svgProps} aria-hidden="true">
      {/* Document */}
      <path d="M22 18 H46 L54 26 V62 H22 Z" />
      <path d="M46 18 V26 H54" />
      <line x1="28" y1="34" x2="48" y2="34" opacity="0.6" />
      <line x1="28" y1="40" x2="44" y2="40" opacity="0.5" />
      {/* Person */}
      <circle cx="56" cy="46" r="5" />
      <path d="M48 62 Q48 54 56 54 Q64 54 64 62" />
    </svg>
  )
}

function HeartHome() {
  return (
    <svg {...svgProps} aria-hidden="true">
      {/* Home */}
      <path d="M16 40 L40 22 L64 40" />
      <path d="M22 38 V62 H58 V38" />
      <line x1="36" y1="62" x2="36" y2="52" />
      <line x1="44" y1="62" x2="44" y2="52" />
      {/* Heart inside */}
      <path
        d="M40 50 c -3 -3 -7 -1 -7 2 c 0 3 4 5 7 8 c 3 -3 7 -5 7 -8 c 0 -3 -4 -5 -7 -2 z"
        fill={TEAL}
        fillOpacity="0.15"
      />
    </svg>
  )
}

const ILLUSTRATIONS = [PhoneWaves, ClipboardCheck, DocumentPerson, HeartHome]

export function Process() {
  const { t, i18n } = useTranslation()
  const items = t("process.items", { returnObjects: true }) as TranslatedStep[]
  return (
    <section id="processo" data-section="light" className="relative py-16 md:py-40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            {t("process.eyebrow")}
          </span>
          <BlurText
            key={i18n.language + "-process-title"}
            text={t("process.title")}
            as="h2"
            className="mt-4 font-display uppercase text-[clamp(32px,8vw,60px)] md:text-6xl leading-[0.95] md:leading-[0.9] tracking-tight max-w-[20ch] break-words"
            delay={0.07}
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">
          {PROCESS_STEPS.map((step, i) => {
            const Illustration = ILLUSTRATIONS[i] ?? PhoneWaves
            const item = items[i] ?? { title: step.title, body: step.body }
            return (
              <m.div
                key={step.n}
                className="relative px-0 md:px-8 py-8 md:py-14 flex flex-col gap-3 md:gap-4 items-start border-b md:border-b-0 border-border/30 last:border-b-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
              >
                {/* Connector line (desktop only, not on last item) */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="absolute top-20 right-0 translate-x-1/2 h-px w-full bg-gradient-to-r from-border/60 via-border/30 to-transparent hidden md:block pointer-events-none" />
                )}

                {/* Custom SVG illustration */}
                <m.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 + 0.15 }}
                  className="mb-2"
                >
                  <Illustration />
                </m.div>

                <span className="font-display text-[64px] md:text-[110px] leading-none text-primary/20 -mb-4 select-none">
                  {step.n.padStart(2, "0")}
                </span>
                <h3 className="font-display uppercase text-2xl md:text-3xl tracking-tight">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-foreground/65 leading-relaxed max-w-[30ch]">
                  {item.body}
                </p>
              </m.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

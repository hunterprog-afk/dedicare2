import { motion } from "motion/react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"

// Punti relativi sulla mappa stilizzata (viewBox 400x300)
const PINS: { x: number; y: number; label: string }[] = [
  { x: 200, y: 150, label: "Milano" },
  { x: 250, y: 155, label: "Segrate" },
  { x: 235, y: 105, label: "Sesto S.G." },
  { x: 215, y: 90, label: "Cinisello B." },
  { x: 250, y: 110, label: "Cologno M." },
  { x: 280, y: 145, label: "Pioltello" },
  { x: 255, y: 130, label: "Vimodrone" },
  { x: 235, y: 195, label: "San Donato" },
  { x: 270, y: 190, label: "Peschiera B." },
  { x: 175, y: 205, label: "Rozzano" },
  { x: 150, y: 175, label: "Corsico" },
]

export function AreeServite() {
  const { t, i18n } = useTranslation()
  const comuni = t("aree.comuni", { returnObjects: true }) as string[]
  return (
    <section id="aree" data-section="light" className="relative py-28 md:py-40 border-t border-border/40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="mb-16">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            {t("aree.eyebrow")}
          </span>
          <BlurText
            key={i18n.language + "-aree-title"}
            text={t("aree.title")}
            as="h2"
            className="mt-4 font-display uppercase text-4xl md:text-6xl leading-[0.9] tracking-tight"
            delay={0.07}
          />
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mt-4 font-body text-foreground/60 text-base max-w-[52ch] leading-relaxed"
          >
            {t("aree.intro")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mappa stilizzata */}
          <motion.div
            className="liquid-glass rounded-2xl p-6 lg:col-span-3 overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg
              viewBox="0 0 400 300"
              className="w-full h-auto"
              role="img"
              aria-label={t("aree.map_alt")}
            >
              <defs>
                <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#0B5FA5" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#161D2E" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0B5FA5" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#15A89A" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Sfondo */}
              <rect x="0" y="0" width="400" height="300" fill="url(#bgGrad)" />

              {/* Griglia stradale stilizzata */}
              <g stroke="currentColor" strokeOpacity="0.08" strokeWidth="1">
                <line x1="0" y1="75" x2="400" y2="75" />
                <line x1="0" y1="150" x2="400" y2="150" />
                <line x1="0" y1="225" x2="400" y2="225" />
                <line x1="100" y1="0" x2="100" y2="300" />
                <line x1="200" y1="0" x2="200" y2="300" />
                <line x1="300" y1="0" x2="300" y2="300" />
              </g>

              {/* Tangenziale circolare */}
              <circle
                cx="200"
                cy="150"
                r="105"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.15"
                strokeWidth="1.2"
                strokeDasharray="3 4"
              />
              <circle
                cx="200"
                cy="150"
                r="60"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeWidth="1"
              />

              {/* Naviglio / fiume */}
              <path
                d="M 50 220 Q 130 200 200 215 T 360 235"
                fill="none"
                stroke="url(#riverGrad)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Pin */}
              {PINS.map((p, i) => (
                <g key={p.label}>
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r="14"
                    fill="#15A89A"
                    fillOpacity="0.18"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#15A89A"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {i === 0 && (
                    <text
                      x={p.x + 12}
                      y={p.y + 4}
                      className="font-display"
                      fontSize="11"
                      fill="currentColor"
                      fillOpacity="0.85"
                      style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                    >
                      {t("hero.tag_city")}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </motion.div>

          {/* Lista comuni */}
          <motion.div
            className="liquid-glass rounded-2xl p-7 lg:col-span-2"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <h3 className="font-display uppercase text-xl tracking-tight mb-5">
              {t("aree.comuni_title")}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {comuni.map((c) => (
                <li key={c} className="flex items-center gap-2 font-body text-sm text-foreground/80">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ background: "#15A89A" }}
                  />
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-6 h-px w-10 bg-gradient-to-r from-primary to-transparent" />
            <p className="mt-4 font-body text-xs text-foreground/55 leading-relaxed">
              {t("aree.comuni_note")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

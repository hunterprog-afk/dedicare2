import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import { Award, Users, BadgeCheck, Clock } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"
import { STATS } from "@/lib/constants"

type TranslatedStat = { value: string; label: string }

const STAT_ICONS = [Clock, BadgeCheck, Award, Users] as const

const HOVER_ANIM: Record<string, { rotate?: number; scale?: number }> = {
  rotate: { rotate: 12 },
  scale: { scale: 1.15 },
  pulse: { scale: 1.1 },
  spin: { rotate: 360 },
}

const ICON_BEHAVIOR = ["spin", "scale", "rotate", "pulse"] as const

function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, { once: true, amount: 0.15, margin: "0px 0px -10% 0px" })
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (!inView) return
    // Anima solo se il valore è del tipo: [prefix?][digits][suffix?]
    // Esempi animabili: "100%", "3+", "15"
    // NON animabili (mostrati così come sono): "24/7", "MI", "h24"
    const match = value.match(/^([^\d]*)(\d+)([^\d]*)$/)
    if (!match) { setDisplay(value); return }
    const [, prefix, digits, suffix] = match
    const numeric = parseInt(digits, 10)
    let start: number | null = null
    const duration = 1200
    const step = (ts: number) => {
      if (!start) start = ts
      const prog = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - prog, 3)
      setDisplay(`${prefix}${Math.floor(eased * numeric)}${suffix}`)
      if (prog < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, value])

  return <span ref={ref}>{display}</span>
}

export function Stats() {
  const { t, i18n } = useTranslation()
  const items = t("stats.items", { returnObjects: true }) as TranslatedStat[]
  return (
    <section className="relative py-32 md:py-44 overflow-hidden">
      {/* Cinematic bg — gradient fallback (no external video dependency) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(200,35%,5%)] via-[hsl(175,30%,7%)] to-[hsl(220,25%,6%)]" />

      {/* Top + bottom fades */}
      <div className="absolute top-0 inset-x-0 h-[200px] z-[1] gradient-fade-t" />
      <div className="absolute bottom-0 inset-x-0 h-[200px] z-[1] gradient-fade-b" />

      {/* Noise texture */}
      <div className="absolute inset-0 noise z-[2] pointer-events-none" />

      {/* Decorative glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none z-[2]" />

      {/* Header + Card */}
      <div className="relative z-10 mx-[var(--gutter)] max-w-[var(--max)] md:mx-auto">
        {/* Section header */}
        <div className="text-center mb-14 md:mb-16">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            {t("stats.eyebrow")}
          </span>
          <BlurText
            key={i18n.language + "-stats-title"}
            text={t("stats.title")}
            as="h2"
            className="mt-4 font-display uppercase text-4xl md:text-6xl leading-[0.9] tracking-tight max-w-[20ch] mx-auto"
            delay={0.07}
          />
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mt-4 font-body text-foreground/60 text-base max-w-xl mx-auto leading-relaxed"
          >
            {t("stats.intro")}
          </motion.p>
        </div>

        <div className="liquid-glass rounded-3xl p-10 md:p-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative">
            {STATS.map((stat, i) => {
              const Icon = STAT_ICONS[i] ?? Award
              const behavior = ICON_BEHAVIOR[i] ?? "scale"
              const hover = HOVER_ANIM[behavior] ?? { scale: 1.1 }
              const tr = items[i] ?? stat
              return (
                <motion.div
                  key={stat.label}
                  className="flex flex-col items-start relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                >
                  {/* Vertical separator (desktop) */}
                  {i > 0 && (
                    <div className="hidden md:block absolute -left-6 top-1/2 -translate-y-1/2 w-px h-12 bg-border/60" />
                  )}

                  {/* Icon circle */}
                  <motion.div
                    className="mb-5 flex items-center justify-center rounded-full"
                    style={{
                      width: 56,
                      height: 56,
                      background: "hsl(174, 62%, 38%, 0.12)",
                      border: "1px solid hsl(174, 62%, 38%, 0.45)",
                    }}
                    whileHover={hover}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    animate={
                      behavior === "pulse"
                        ? { scale: [1, 1.06, 1] }
                        : undefined
                    }
                    {...(behavior === "pulse"
                      ? { transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }
                      : {})}
                  >
                    <Icon className="size-6" style={{ color: "hsl(174, 62%, 55%)" }} strokeWidth={1.75} />
                  </motion.div>

                  <span className="font-display italic text-5xl md:text-6xl lg:text-7xl leading-none text-foreground">
                    <CountUp value={tr.value} />
                  </span>
                  <span className="font-body text-xs text-foreground/55 mt-3 tracking-wide uppercase">
                    {tr.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

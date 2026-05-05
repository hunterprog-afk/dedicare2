import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import { Award, Users, BadgeCheck, Clock } from "lucide-react"
import { STATS } from "@/lib/constants"

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
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (!inView) return
    const numeric = parseInt(value.replace(/\D/g, ""), 10)
    if (isNaN(numeric)) { setDisplay(value); return }
    const suffix = value.replace(/[\d\s]/g, "")
    const prefix = value.match(/^[^\d]*/)?.[0] ?? ""
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

  return <span ref={ref}>{display || value}</span>
}

export function Stats() {
  return (
    <section className="relative py-32 md:py-44 overflow-hidden">
      {/* Cinematic bg — gradient fallback (no external video dependency) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(200,35%,5%)] via-[hsl(175,30%,7%)] to-[hsl(220,25%,6%)]" />

      {/* Top + bottom fades */}
      <div className="absolute top-0 inset-x-0 h-[200px] z-[1] gradient-fade-t" />
      <div className="absolute bottom-0 inset-x-0 h-[200px] z-[1] gradient-fade-b" />

      {/* Noise texture */}
      <div className="absolute inset-0 noise z-[2] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 mx-[var(--gutter)] max-w-[var(--max)] md:mx-auto">
        <div className="liquid-glass rounded-3xl p-10 md:p-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative">
            {STATS.map((stat, i) => {
              const Icon = STAT_ICONS[i] ?? Award
              const behavior = ICON_BEHAVIOR[i] ?? "scale"
              const hover = HOVER_ANIM[behavior] ?? { scale: 1.1 }
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
                    <CountUp value={stat.value} />
                  </span>
                  <span className="font-body text-xs text-foreground/55 mt-3 tracking-wide uppercase">
                    {stat.label}
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

import { motion } from "motion/react"
import { ArrowUpRight, Check, Stethoscope, Heart, Clock, Ambulance, Activity, Users } from "lucide-react"
import { BlurText } from "@/components/BlurText"
import { SERVICES } from "@/lib/constants"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope,
  Heart,
  Clock,
  Ambulance,
  Activity,
  Users,
}

const CARD_CLASSES = [
  "md:row-span-2 md:col-span-1 p-8 min-h-[520px]",
  "md:col-span-1 p-6 min-h-[280px]",
  "md:col-span-1 p-6 min-h-[280px]",
  "md:col-span-2 p-7 min-h-[280px]",
  "md:col-span-1 p-6 min-h-[280px]",
  "md:col-span-3 p-7 min-h-[220px]",
]

export function ServicesBento() {
  return (
    <section id="servizi" data-section="light" className="relative py-28 md:py-40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="mb-12">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            I nostri servizi
          </span>
          <BlurText
            text="Tutto ciò di cui hai bisogno, sotto un'unica cura."
            as="h2"
            className="mt-4 font-display uppercase text-4xl md:text-6xl leading-[0.9] tracking-tight max-w-[22ch]"
            delay={0.07}
          />
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mt-4 font-body text-foreground/60 text-base max-w-[52ch] leading-relaxed"
          >
            Professionisti certificati a domicilio, in ospedale e in ogni spostamento. Ogni servizio è calibrato sulla persona, non sulla diagnosi.
          </motion.p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {SERVICES.map((service, idx) => {
            const Icon = ICON_MAP[service.icon] ?? Stethoscope
            return (
              <motion.div
                key={service.title}
                tabIndex={0}
                className={`liquid-glass rounded-2xl relative overflow-hidden group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(174,62%,45%)] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${CARD_CLASSES[idx]}`}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
              >
                <div className="liquid-glass-strong rounded-full w-11 h-11 flex items-center justify-center mb-5 shrink-0 relative z-[2]">
                  <Icon className="size-5 text-foreground" />
                </div>
                <h3 className="font-display uppercase text-2xl md:text-3xl leading-[0.95] tracking-tight mb-3 max-w-[18ch] relative z-[2]">
                  {service.title}
                </h3>
                <p className="font-body text-sm text-foreground/75 max-w-[44ch] leading-relaxed mb-4 relative z-[2]">
                  {service.body}
                </p>
                {service.bullets && (
                  <ul className="font-body text-sm text-foreground/80 space-y-2 mt-auto relative z-[2]">
                    {service.bullets.slice(0, idx === 0 ? 5 : 4).map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <Check className="size-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Hover overlay — teal gradient with reveal */}
                <div
                  className="pointer-events-none absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(174, 62%, 38%, 0.18) 0%, hsl(174, 62%, 45%, 0.10) 60%, transparent 100%)",
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                  }}
                  aria-hidden="true"
                />

                {/* Reveal arrow CTA */}
                <div className="pointer-events-none absolute bottom-5 right-5 z-[3] flex items-center gap-1.5 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-all duration-400 ease-out">
                  <span
                    className="font-body text-xs uppercase tracking-wider"
                    style={{ color: "hsl(174, 62%, 38%)" }}
                  >
                    Scopri di più
                  </span>
                  <span
                    className="rounded-full w-7 h-7 flex items-center justify-center"
                    style={{
                      background: "hsl(174, 62%, 38%)",
                      color: "#fff",
                    }}
                  >
                    <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
                  </span>
                </div>

                {/* Static top-right arrow (base state) */}
                <ArrowUpRight className="absolute top-6 right-6 size-5 text-foreground/30 group-hover:opacity-0 transition-opacity z-[2]" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

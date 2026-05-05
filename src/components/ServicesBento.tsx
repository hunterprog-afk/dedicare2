import { motion } from "motion/react"
import { ArrowUpRight, Stethoscope, Heart, Clock, Ambulance, Activity, Users } from "lucide-react"
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
  "md:row-span-2 md:col-span-1 p-8 min-h-[480px]",
  "md:col-span-1 p-6 min-h-[228px]",
  "md:col-span-1 p-6 min-h-[228px]",
  "md:col-span-2 p-7 min-h-[228px]",
  "md:col-span-1 p-6 min-h-[228px]",
  "md:col-span-3 p-7 min-h-[200px]",
]

export function ServicesBento() {
  return (
    <section id="servizi" className="relative py-28 md:py-40">
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
                className={`liquid-glass rounded-2xl relative overflow-hidden group flex flex-col ${CARD_CLASSES[idx]}`}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
              >
                <div className="liquid-glass-strong rounded-full w-11 h-11 flex items-center justify-center mb-5 shrink-0">
                  <Icon className="size-5 text-foreground" />
                </div>
                <h3 className="font-display uppercase text-2xl md:text-3xl leading-[0.95] tracking-tight mb-3 max-w-[18ch]">
                  {service.title}
                </h3>
                <p className="font-body text-sm text-foreground/65 max-w-[38ch] leading-relaxed">
                  {service.body}
                </p>
                <ArrowUpRight className="absolute top-6 right-6 size-5 text-foreground/25 group-hover:text-foreground/70 transition-colors" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

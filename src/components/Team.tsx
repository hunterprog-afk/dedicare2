import { motion } from "motion/react"
import { BlurText } from "@/components/BlurText"

type Member = {
  name: string
  role: string
  bio: string
  initials: string
}

const MEMBERS: Member[] = [
  {
    name: "Lisis Zuniga",
    role: "Fondatrice & Coordinatrice clinica",
    bio: "Oltre 15 anni di esperienza in assistenza domiciliare. Guida ogni piano di cura con visione clinica e attenzione umana.",
    initials: "LZ",
  },
  {
    name: "Dr. Marco Bianchi",
    role: "Medico responsabile",
    bio: "Specialista in geriatria. Supervisiona protocolli clinici e formazione continua del team sanitario.",
    initials: "MB",
  },
  {
    name: "Sara Romano",
    role: "Coordinatrice OSS",
    bio: "10 anni di esperienza sul campo e formatrice interna. Garantisce qualità e continuità del servizio OSS.",
    initials: "SR",
  },
  {
    name: "Lucia Ferrari",
    role: "Responsabile reperibilità 24/7",
    bio: "Punto di contatto operativo per famiglie e professionisti. Coordina urgenze e turni nelle 24 ore.",
    initials: "LF",
  },
]

export function Team() {
  return (
    <section id="team" className="relative py-28 md:py-40 border-t border-border/40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            Il nostro team
          </span>
          <BlurText
            text="Le persone dietro alla cura"
            as="h2"
            className="mt-4 font-display uppercase text-4xl md:text-6xl leading-[0.9] tracking-tight max-w-[18ch] mx-auto"
            delay={0.07}
          />
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="mt-4 font-body text-foreground/60 text-base max-w-xl mx-auto leading-relaxed"
          >
            Professionisti selezionati, formati e coordinati direttamente da chi ha costruito Dedicare Solutions.
          </motion.p>
        </div>

        {/* Grid 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MEMBERS.map((m, i) => (
            <motion.div
              key={m.name}
              className="liquid-glass rounded-2xl p-7 flex flex-col sm:flex-row gap-5 items-start"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            >
              <div
                className="shrink-0 rounded-full w-20 h-20 flex items-center justify-center font-display uppercase text-2xl tracking-tight text-white"
                style={{ background: "linear-gradient(135deg, #15A89A 0%, #0B5FA5 100%)" }}
              >
                {m.initials}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-display uppercase text-xl tracking-tight">
                  {m.name}
                </h3>
                <span className="font-body text-xs text-primary tracking-wide uppercase">
                  {m.role}
                </span>
                <p className="font-body text-sm text-foreground/65 leading-relaxed mt-1">
                  {m.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

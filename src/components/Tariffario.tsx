import { motion } from "motion/react"
import { Stethoscope, CalendarClock, Activity, Sparkles, ArrowUpRight } from "lucide-react"
import { BlurText } from "@/components/BlurText"

type Factor = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
}

const FACTORS: Factor[] = [
  {
    icon: Stethoscope,
    title: "Tipologia di assistenza",
    body: "Infermieristica, OSS, supporto specialistico o multidisciplinare: ogni profilo ha tariffe e tempi diversi.",
  },
  {
    icon: CalendarClock,
    title: "Durata e frequenza",
    body: "Visita singola, turni programmati, presenza continuativa o reperibilità 24/7 incidono sul piano economico.",
  },
  {
    icon: Activity,
    title: "Complessità clinica",
    body: "Patologie, terapie attive, dispositivi medici e livelli di non autosufficienza definiscono il fabbisogno reale.",
  },
  {
    icon: Sparkles,
    title: "Servizi accessori",
    body: "Trasporto protetto, prevenzione domiciliare, coordinamento con il medico curante e accompagnamento.",
  },
]

export function Tariffario() {
  return (
    <section id="tariffario" className="relative py-28 md:py-40 border-t border-border/40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            Preventivo
          </span>
          <BlurText
            text="Trasparenza nei costi"
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
            Ogni piano è personalizzato. Non pubblichiamo listini fissi perché ogni famiglia merita una valutazione reale.
          </motion.p>
        </div>

        {/* Grid fattori */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FACTORS.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                className="liquid-glass rounded-2xl p-7 flex flex-col gap-5 min-h-[240px] relative"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              >
                <span className="absolute top-5 right-6 font-display text-sm text-primary/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="liquid-glass-strong rounded-full w-11 h-11 flex items-center justify-center">
                  <Icon className="size-5 text-foreground" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="font-display uppercase text-xl tracking-tight">
                    {f.title}
                  </h3>
                  <p className="font-body text-sm text-foreground/65 leading-relaxed">
                    {f.body}
                  </p>
                </div>
                <div className="mt-auto h-px w-10 bg-gradient-to-r from-primary to-transparent" />
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="#contatti"
            className="group inline-flex items-center gap-3 rounded-full px-7 py-4 font-body text-sm tracking-wide text-white transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #15A89A 0%, #0B5FA5 100%)" }}
          >
            Richiedi un preventivo gratuito
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

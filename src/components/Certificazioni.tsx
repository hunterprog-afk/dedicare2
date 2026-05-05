import { motion } from "motion/react"
import { ShieldCheck, BadgeCheck, Lock, FileCheck2, Handshake } from "lucide-react"
import { BlurText } from "@/components/BlurText"

type Cert = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  detail: string
}

const CERTS: Cert[] = [
  {
    icon: BadgeCheck,
    title: "Accreditamento ASL Milano",
    detail: "Operatore riconosciuto",
  },
  {
    icon: ShieldCheck,
    title: "Albo Operatori Sanitari",
    detail: "Iscrizione regolare",
  },
  {
    icon: Lock,
    title: "Conformità GDPR",
    detail: "Reg. UE 2016/679",
  },
  {
    icon: FileCheck2,
    title: "Polizza RC Professionale",
    detail: "Copertura completa",
  },
  {
    icon: Handshake,
    title: "Convenzioni INPS",
    detail: "Ente convenzionato",
  },
]

export function Certificazioni() {
  return (
    <section id="certificazioni" data-section="light" className="relative py-28 md:py-40 border-t border-border/40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            Garanzie
          </span>
          <BlurText
            text="Certificazioni & Conformità"
            as="h2"
            className="mt-4 font-display uppercase text-4xl md:text-6xl leading-[0.9] tracking-tight max-w-[20ch] mx-auto"
            delay={0.07}
          />
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="mt-4 font-body text-foreground/60 text-base max-w-xl mx-auto leading-relaxed"
          >
            Operiamo nel pieno rispetto delle normative sanitarie e di tutela del cittadino.
          </motion.p>
        </div>

        {/* Grid badges — 5 cols desktop, scroll mobile */}
        <div className="-mx-[var(--gutter)] px-[var(--gutter)] overflow-x-auto md:overflow-visible md:mx-0 md:px-0">
          <div className="flex md:grid md:grid-cols-5 gap-4 min-w-max md:min-w-0">
            {CERTS.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.div
                  key={c.title}
                  className="liquid-glass rounded-2xl p-6 flex flex-col items-center text-center gap-3 w-[220px] md:w-auto shrink-0 border border-transparent transition-colors hover:border-primary/40"
                  style={{ borderColor: "rgba(21,168,154,0.25)" }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                >
                  <div
                    className="rounded-full w-12 h-12 flex items-center justify-center"
                    style={{ background: "rgba(21,168,154,0.12)" }}
                  >
                    <Icon className="size-5 text-[#15A89A]" />
                  </div>
                  <h3 className="font-display uppercase text-sm tracking-tight leading-tight">
                    {c.title}
                  </h3>
                  <span className="font-body text-xs text-foreground/55">
                    {c.detail}
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

import { motion } from "motion/react"
import { ShieldCheck, Clock, MessageCircle, MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"
import { REASONS } from "@/lib/constants"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Clock,
  MessageCircle,
  MapPin,
}

type TranslatedReason = { title: string; body: string }

export function Pourquoi() {
  const { t, i18n } = useTranslation()
  const items = t("pourquoi.items", { returnObjects: true }) as TranslatedReason[]

  return (
    <section id="filosofia" className="relative py-28 md:py-40 border-t border-border/40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            {t("pourquoi.eyebrow")}
          </span>
          <BlurText
            key={i18n.language + "-pourquoi-title"}
            text={t("pourquoi.title")}
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
            {t("pourquoi.intro")}
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {REASONS.map((reason, i) => {
            const Icon = ICON_MAP[reason.icon] ?? ShieldCheck
            const item = items[i] ?? { title: reason.title, body: reason.body }
            return (
              <motion.div
                key={reason.icon}
                className="liquid-glass rounded-2xl p-7 flex flex-col gap-5 min-h-[260px]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              >
                <div className="liquid-glass-strong rounded-full w-11 h-11 flex items-center justify-center">
                  <Icon className="size-5 text-foreground" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="font-display uppercase text-xl tracking-tight">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-foreground/65 leading-relaxed">
                    {item.body}
                  </p>
                </div>
                <div className="mt-auto h-px w-10 bg-gradient-to-r from-primary to-transparent" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

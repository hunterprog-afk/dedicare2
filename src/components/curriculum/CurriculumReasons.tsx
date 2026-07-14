import { m } from "motion/react"
import { GraduationCap, Heart, ShieldCheck, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"

type TranslatedReason = { title: string; body: string }
const REASON_ICONS = [GraduationCap, Heart, ShieldCheck, Sparkles]

/** Colonna sinistra di Curriculum: elenco motivi per candidarsi. */
export function CurriculumReasons() {
  const { t } = useTranslation()
  const reasons = t("curriculum.reasons", { returnObjects: true }) as TranslatedReason[]

  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5"
    >
      <h3 className="font-display uppercase text-xl tracking-tight">
        {t("curriculum.reasons_title")}
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reasons.map((r, i) => {
          const Icon = REASON_ICONS[i] ?? Sparkles
          return (
            <li
              key={r.title}
              className="liquid-glass rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="liquid-glass-strong rounded-full w-10 h-10 flex items-center justify-center">
                <Icon className="size-4 text-foreground" />
              </div>
              <h4 className="font-display uppercase text-base tracking-tight">
                {r.title}
              </h4>
              <p className="font-body text-sm text-foreground/65 leading-relaxed">
                {r.body}
              </p>
            </li>
          )
        })}
      </ul>
    </m.div>
  )
}

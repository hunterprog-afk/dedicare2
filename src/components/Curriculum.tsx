import { m } from "motion/react"
import { Briefcase } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"
import { CurriculumReasons } from "@/components/curriculum/CurriculumReasons"
import { CurriculumForm } from "@/components/curriculum/CurriculumForm"

/**
 * Sezione "Lavora con noi": header + griglia (motivi a sinistra, form di
 * candidatura a destra). Split in sotto-componenti coesi da un unico file
 * di 300+ righe (react-doctor no-giant-component, report 2026-07-14) —
 * stato/logica del form in @/hooks/useCurriculumForm, markup dei campi in
 * CurriculumFormFields, schermata di successo in CurriculumFormSuccess.
 * Comportamento invariato: vedi Curriculum.test.tsx.
 */
export function Curriculum() {
  const { t, i18n } = useTranslation()

  return (
    <section
      id="lavora-con-noi"
      data-section="light"
      className="relative py-16 md:py-40"
    >
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-flex items-center gap-2">
            <Briefcase className="size-3.5" />
            {t("curriculum.eyebrow")}
          </span>
          <BlurText
            key={i18n.language + "-curriculum-title"}
            text={t("curriculum.title")}
            as="h2"
            className="mt-4 font-display uppercase text-[clamp(32px,8vw,60px)] md:text-6xl leading-[0.95] md:leading-[0.9] tracking-tight max-w-[20ch] break-words"
            delay={0.07}
          />
          <m.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mt-4 font-body text-foreground/60 text-base max-w-[52ch] leading-relaxed"
          >
            {t("curriculum.intro")}
          </m.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          <CurriculumReasons />
          <CurriculumForm />
        </div>
      </div>
    </section>
  )
}

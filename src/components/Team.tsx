import { motion } from "motion/react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"

type Member = {
  name: string
  role: string
  bio: string
}

export function Team() {
  const { t, i18n } = useTranslation()
  const members = t("team.members", { returnObjects: true }) as Member[]
  const founder = members[0]

  if (!founder) return null

  return (
    <section id="team" className="relative py-16 md:py-40 border-t border-border/40 overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />

      <div className="relative max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            {t("team.eyebrow")}
          </span>
          <BlurText
            key={i18n.language + "-team-title"}
            text={t("team.title")}
            as="h2"
            className="mt-4 font-display uppercase text-[clamp(32px,8vw,60px)] md:text-6xl leading-[0.95] md:leading-[0.9] tracking-tight max-w-[20ch] mx-auto break-words"
            delay={0.07}
          />
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="mt-4 font-body text-foreground/60 text-base max-w-xl mx-auto leading-relaxed"
          >
            {t("team.intro")}
          </motion.p>
        </div>

        {/* Single card centrata — Lisis Zuniga */}
        <motion.div
          className="liquid-glass rounded-3xl p-6 md:p-12 max-w-3xl mx-auto flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Avatar grande con ring */}
          <div className="shrink-0 relative">
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-60"
              style={{ background: "linear-gradient(135deg, #15A89A 0%, #0B5FA5 100%)" }}
            />
            <div
              className="relative rounded-full w-28 h-28 md:w-36 md:h-36 flex items-center justify-center font-display uppercase text-3xl md:text-5xl tracking-tight text-white shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #15A89A 0%, #0B5FA5 100%)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(11,95,165,0.4)",
              }}
            >
              LZ
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h3 className="font-display uppercase text-2xl md:text-3xl tracking-tight leading-tight">
              {founder.name}
            </h3>
            <span className="font-body text-xs md:text-sm text-primary tracking-wider uppercase">
              {founder.role}
            </span>
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent mx-auto md:mx-0 mt-1 mb-1" />
            <p className="font-body text-sm md:text-base text-foreground/70 leading-relaxed">
              {founder.bio}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

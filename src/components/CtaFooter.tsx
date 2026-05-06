import { useState } from "react"
import { motion } from "motion/react"
import { ArrowUpRight, Phone, Mail, MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"
import { Button } from "@/components/ui/button"
import { ContactForm } from "@/components/ContactForm"
import { LegalModal } from "@/components/LegalModal"
import { OptimizedImage } from "@/components/OptimizedImage"
import { privacyPolicy, cookiePolicy, noteLegali } from "@/content/legal"

type LegalKey = "privacy" | "cookie" | "legal" | null

function LegalContent({ sections }: { sections: { heading: string; content: string }[] }) {
  return (
    <>
      {sections.map((s) => (
        <div key={s.heading}>
          <h3 className="font-semibold text-white mb-2">{s.heading}</h3>
          <p className="whitespace-pre-line text-white/70">{s.content}</p>
        </div>
      ))}
    </>
  )
}

const legalDocs = {
  privacy: privacyPolicy,
  cookie: cookiePolicy,
  legal: noteLegali,
}

export function CtaFooter() {
  const { t, i18n } = useTranslation()
  const [openModal, setOpenModal] = useState<LegalKey>(null)
  const isEn = (i18n.resolvedLanguage || i18n.language || "it").startsWith("en")

  return (
    <section id="contatti" className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden border-t border-border/40">
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(200,30%,6%)] via-[hsl(175,35%,5%)] to-[hsl(220,20%,4%)]" />

      {/* Noise */}
      <div className="absolute inset-0 noise pointer-events-none" />

      {/* Top fade */}
      <div className="absolute top-0 inset-x-0 h-[200px] gradient-fade-t" />

      {/* Geometric accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-secondary/[0.05] blur-2xl" />
      </div>

      {/* CTA content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 py-16 md:py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            {t("cta.eyebrow")}
          </span>
        </motion.div>

        <BlurText
          key={i18n.language + "-cta-title"}
          text={t("cta.title")}
          as="h2"
          className="mt-6 md:mt-8 font-display italic text-[clamp(36px,9vw,150px)] leading-[0.9] md:leading-[0.88] tracking-[-0.02em] text-center max-w-[16ch] break-words"
          delay={0.09}
          startDelay={0.1}
        />

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          className="mt-8 font-body text-base md:text-lg text-foreground/70 max-w-xl text-center leading-relaxed"
        >
          {t("cta.subline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex items-center gap-3 flex-wrap justify-center"
        >
          <Button
            variant="hero"
            className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            asChild
          >
            <a href="tel:+393882536992">
              <Phone className="mr-1.5 size-4" /> +39 388 253 6992
            </a>
          </Button>
          <Button
            variant="heroGlass"
            className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            asChild
          >
            <a href="mailto:info@dedicaresolutions.it">
              <Mail className="mr-1.5 size-4" /> {t("cta.scrivici")}
            </a>
          </Button>
        </motion.div>

        {/* Form + Mappa */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.85 }}
          className="mt-12 md:mt-16 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch"
        >
          <ContactForm />
          <div className="relative rounded-2xl overflow-hidden border border-white/5 min-h-[360px] md:min-h-[480px] flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <span className="font-body text-[11px] uppercase tracking-[0.2em] text-foreground/55">
                {t("cta.vieni_a_trovarci")}
              </span>
              <p className="mt-1 font-display italic text-base text-foreground/85">
                {t("cta.address")}
              </p>
            </div>
            <iframe
              title={t("cta.map_title")}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.123!2d9.298!3d45.494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sVia%20Roma%2080%2C%2020054%20Segrate%20MI!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen={false}
              className="w-full flex-1 min-h-[280px] md:min-h-[400px] block border-0"
              style={{ filter: "invert(0.9) hue-rotate(180deg) saturate(0.7) contrast(0.9)" }}
            />
          </div>
        </motion.div>

        {/* Contact info strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 flex flex-col sm:flex-row items-center gap-6 text-sm text-foreground/50 font-body"
        >
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-primary/60" />
            {t("cta.address")}
          </span>
          <span className="hidden sm:block h-4 w-px bg-border/40" />
          <span className="flex items-center gap-2">
            <Phone className="size-4 text-primary/60" />
            +39 388 253 6992
          </span>
          <span className="hidden sm:block h-4 w-px bg-border/40" />
          <span className="flex items-center gap-2">
            <Mail className="size-4 text-primary/60" />
            info@dedicaresolutions.it
          </span>
        </motion.div>

      </div>

      {/* Footer bar */}
      <div className="relative z-10 w-full border-t border-border/30 mt-auto">
        <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)] py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <OptimizedImage
              src="images/logo/nobg_logo-chiaro"
              alt="Dedicare Solutions"
              width={120}
              height={24}
              loading="lazy"
              className="h-6 w-auto object-contain opacity-60"
            />
            <span className="font-body text-xs text-foreground/40">
              {t("cta.copyright")}
            </span>
          </div>
          <nav className="flex items-center gap-6 flex-wrap justify-center">
            <button
              onClick={() => setOpenModal("privacy")}
              className="font-body text-xs text-foreground/40 hover:text-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {t("cta.privacy")}
            </button>
            <button
              onClick={() => setOpenModal("cookie")}
              className="font-body text-xs text-foreground/40 hover:text-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {t("cta.cookie")}
            </button>
            <button
              onClick={() => setOpenModal("legal")}
              className="font-body text-xs text-foreground/40 hover:text-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {t("cta.legal")}
            </button>
            <a
              href="mailto:info@dedicaresolutions.it"
              className="font-body text-xs text-foreground/40 hover:text-foreground/70 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              info@dedicaresolutions.it
            </a>
          </nav>
          <a
            href="https://hunterprog-afk.github.io/SD/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-foreground/30 hover:text-foreground/60 transition-colors flex items-center gap-1"
          >
            {t("cta.sito_classico")} <ArrowUpRight className="size-3" />
          </a>
        </div>
      </div>
      {/* Modal legali — sempre in italiano per validità legale */}
      {openModal && (
        <LegalModal
          open={true}
          onClose={() => setOpenModal(null)}
          title={legalDocs[openModal].title}
        >
          {isEn && (
            <p className="text-xs italic text-white/55 border-l-2 border-primary/40 pl-3 mb-2">
              {t("legal_modal.disclaimer")}
            </p>
          )}
          <LegalContent sections={legalDocs[openModal].sections} />
        </LegalModal>
      )}
    </section>
  )
}

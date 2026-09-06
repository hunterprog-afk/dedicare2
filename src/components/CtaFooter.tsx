import { useState } from "react"
import { m } from "motion/react"
import { Phone, Mail, MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"
import { Button } from "@/components/ui/button"
import { ContactForm } from "@/components/ContactForm"
import { LegalModal } from "@/components/LegalModal"
import { OptimizedImage } from "@/components/OptimizedImage"
import { privacyPolicy, cookiePolicy, noteLegali, trasparenza } from "@/content/legal"

type LegalKey = "privacy" | "cookie" | "legal" | "trasparenza"

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
  trasparenza: trasparenza,
}

export function CtaFooter() {
  const { t, i18n } = useTranslation()
  // `legalOpen` pilota solo apertura/chiusura del <dialog>; `legalKey` resta
  // sull'ultimo documento mostrato anche a modal chiuso, così il pannello
  // (che LegalModal tiene sempre montato per l'animazione di uscita CSS) non
  // perde mai il contenuto durante la transizione di chiusura.
  const [legalOpen, setLegalOpen] = useState(false)
  const [legalKey, setLegalKey] = useState<LegalKey>("privacy")
  const isEn = (i18n.resolvedLanguage || i18n.language || "it").startsWith("en")

  function openLegal(key: LegalKey) {
    setLegalKey(key)
    setLegalOpen(true)
  }

  return (
    <section id="contatti" data-section="dark" className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic background — navy→teal brand gradient (meno cupo del nero/grigio-blu generico precedente) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,35%,10%)] via-[hsl(168,30%,9%)] to-[hsl(222,32%,8%)]" />

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
        <m.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            {t("cta.eyebrow")}
          </span>
        </m.div>

        <BlurText
          key={i18n.language + "-cta-title"}
          text={t("cta.title")}
          as="h2"
          className="mt-6 md:mt-8 font-display italic text-[clamp(36px,9vw,150px)] leading-[0.9] md:leading-[0.88] tracking-[-0.02em] text-center max-w-[16ch] break-words"
          delay={0.09}
          startDelay={0.1}
        />

        <m.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          className="mt-8 font-body text-base md:text-lg text-foreground/70 max-w-xl text-center leading-relaxed"
        >
          {t("cta.subline")}
        </m.p>

        <m.div
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
            className="bg-white/15 hover:bg-white/25 border border-white/40 text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            asChild
          >
            <a href="mailto:info@dedicaresolutions.it">
              <Mail className="mr-1.5 size-4" /> {t("cta.scrivici")}
            </a>
          </Button>
        </m.div>

        {/* Form contatti */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.85 }}
          className="mt-12 md:mt-16 w-full max-w-2xl"
        >
          <ContactForm onOpenPrivacy={() => openLegal("privacy")} />
        </m.div>

        {/* Contact info strip */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 flex flex-col sm:flex-row items-center gap-6 text-sm text-foreground/80 font-body"
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
        </m.div>

      </div>

      {/* Footer bar */}
      <div className="relative z-10 w-full mt-auto">
        <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)] py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left max-w-full">
            <OptimizedImage
              src="images/logo/nobg_logo-chiaro"
              alt="Dedicare Solutions"
              width={120}
              height={24}
              loading="lazy"
              className="h-6 w-auto object-contain opacity-90 shrink-0"
            />
            <span className="font-body text-[11px] sm:text-xs text-foreground/70 break-words leading-snug">
              {t("cta.copyright")}
            </span>
          </div>
          <nav className="flex items-center gap-6 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => openLegal("privacy")}
              className="font-body text-xs text-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {t("cta.privacy")}
            </button>
            <button
              type="button"
              onClick={() => openLegal("cookie")}
              className="font-body text-xs text-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {t("cta.cookie")}
            </button>
            <button
              type="button"
              onClick={() => openLegal("legal")}
              className="font-body text-xs text-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {t("cta.legal")}
            </button>
            <button
              type="button"
              onClick={() => openLegal("trasparenza")}
              className="font-body text-xs text-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {t("cta.trasparenza")}
            </button>
            <a
              href="mailto:info@dedicaresolutions.it"
              className="font-body text-xs text-foreground/70 hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              info@dedicaresolutions.it
            </a>
          </nav>
        </div>
      </div>
      {/* Modal legali — sempre in italiano per validità legale.
          Montato sempre (non solo quando aperto): il <dialog> nativo gestisce
          la propria visibilità via showModal()/close(), e deve restare nel
          DOM per la durata della transizione di chiusura CSS. */}
      <LegalModal
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
        title={legalDocs[legalKey].title}
      >
        {isEn && (
          <p className="text-xs italic text-white/55 border-l-2 border-primary/40 pl-3 mb-2">
            {t("legal_modal.disclaimer")}
          </p>
        )}
        <LegalContent sections={legalDocs[legalKey].sections} />
      </LegalModal>
    </section>
  )
}

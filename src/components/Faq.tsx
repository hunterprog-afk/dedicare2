import { m } from "motion/react"
import { MessageCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type FaqItem = { q: string; a: string }

export function Faq() {
  const { t, i18n } = useTranslation()
  const items = t("faq.items", { returnObjects: true }) as FaqItem[]
  return (
    <section id="faq" data-section="light" className="relative py-16 md:py-40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)] grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-10 md:gap-16">
        {/* Left column */}
        <div className="md:sticky md:top-24 md:self-start">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            {t("faq.eyebrow")}
          </span>
          <BlurText
            key={i18n.language + "-faq-title"}
            text={t("faq.title")}
            as="h2"
            className="mt-4 font-display uppercase text-[clamp(34px,9vw,60px)] md:text-6xl leading-[0.95] md:leading-[0.9] tracking-tight break-words"
            delay={0.07}
          />
          <m.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="mt-5 font-body text-foreground/60 text-base leading-relaxed max-w-[36ch]"
          >
            {t("faq.intro")}
          </m.p>
          <m.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Button
              variant="heroGlass"
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              asChild
            >
              <a href="mailto:info@dedicaresolutions.it">
                <MessageCircle className="mr-2 size-4" /> {t("faq.cta")}
              </a>
            </Button>
          </m.div>
        </div>

        {/* Right column */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Accordion type="single" collapsible>
            {items.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`} className="border-border/40">
                <AccordionTrigger className="font-display uppercase text-base md:text-xl tracking-tight py-5 md:py-6 hover:no-underline data-[state=open]:text-primary text-left gap-3">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-foreground/70 text-[15px] leading-relaxed pb-6 max-w-[60ch]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </m.div>
      </div>
    </section>
  )
}

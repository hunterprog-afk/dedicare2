import { motion } from "motion/react"
import { MessageCircle } from "lucide-react"
import { BlurText } from "@/components/BlurText"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQ_ITEMS } from "@/lib/constants"

export function Faq() {
  return (
    <section id="faq" data-section="light" className="relative py-28 md:py-40 border-t border-border/40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)] grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-16">
        {/* Left column */}
        <div className="md:sticky md:top-24 md:self-start">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            FAQ
          </span>
          <BlurText
            text="Domande frequenti."
            as="h2"
            className="mt-4 font-display uppercase text-5xl md:text-6xl leading-[0.9] tracking-tight"
            delay={0.07}
          />
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="mt-5 font-body text-foreground/60 text-base leading-relaxed max-w-[36ch]"
          >
            Non trovate la risposta che cercate? Scriveteci direttamente — risponderemo entro poche ore.
          </motion.p>
          <motion.div
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
                <MessageCircle className="mr-2 size-4" /> Scrivici
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Accordion type="single" collapsible>
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/40">
                <AccordionTrigger className="font-display uppercase text-lg md:text-xl tracking-tight py-6 hover:no-underline data-[state=open]:text-primary text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-foreground/70 text-[15px] leading-relaxed pb-6 max-w-[60ch]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}

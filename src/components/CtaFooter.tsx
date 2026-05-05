import { motion } from "motion/react"
import { ArrowUpRight, Phone, Mail, MapPin } from "lucide-react"
import { BlurText } from "@/components/BlurText"
import { Button } from "@/components/ui/button"

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookie" },
  { label: "Note Legali", href: "/legal" },
  { label: "info@dedicaresolutions.it", href: "mailto:info@dedicaresolutions.it" },
]

export function CtaFooter() {
  return (
    <section id="contatti" className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden border-t border-border/40">
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
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            Iniziamo insieme
          </span>
        </motion.div>

        <BlurText
          text="Pronti a prendersi cura."
          as="h2"
          className="mt-8 font-display italic text-[clamp(40px,8vw,150px)] leading-[0.88] tracking-[-0.02em] text-center max-w-[16ch]"
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
          Una chiamata gratuita. Un piano su misura. L'assistenza che la vostra famiglia merita.
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
            <a href="tel:+39882536992">
              <Phone className="mr-1.5 size-4" /> +39 882 536 992
            </a>
          </Button>
          <Button
            variant="heroGlass"
            className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            asChild
          >
            <a href="mailto:info@dedicaresolutions.it">
              <Mail className="mr-1.5 size-4" /> Scrivici
            </a>
          </Button>
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
            Via Roma 80, Segrate (MI)
          </span>
          <span className="hidden sm:block h-4 w-px bg-border/40" />
          <span className="flex items-center gap-2">
            <Phone className="size-4 text-primary/60" />
            +39 882 536 992
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
            <img
              src="/images/logo/pitto-chiaro.png"
              alt="Dedicare Solutions"
              className="h-6 w-auto object-contain opacity-60"
            />
            <span className="font-body text-xs text-foreground/40">
              © 2025 Dedicare Solutions S.R.L.S. — P.IVA IT11600760968
            </span>
          </div>
          <nav className="flex items-center gap-6 flex-wrap justify-center">
            {FOOTER_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-body text-xs text-foreground/40 hover:text-foreground/70 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="https://hunterprog-afk.github.io/SD/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-foreground/30 hover:text-foreground/60 transition-colors flex items-center gap-1"
          >
            Sito classico <ArrowUpRight className="size-3" />
          </a>
        </div>
      </div>
    </section>
  )
}

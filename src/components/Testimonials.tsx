import { Quote } from "lucide-react"
import { BlurText } from "@/components/BlurText"
import { motion } from "motion/react"
import { TESTIMONIALS } from "@/lib/constants"

type TestimonialCard = (typeof TESTIMONIALS)[number]

function Card({ quote, name, role }: TestimonialCard) {
  return (
    <div className="liquid-glass rounded-2xl p-7 w-[340px] md:w-[400px] shrink-0 flex flex-col gap-5">
      <Quote className="size-5 text-primary/70" />
      <p className="font-body text-foreground/85 italic leading-relaxed text-[15px] flex-1">
        {quote}
      </p>
      <div className="mt-auto flex items-center gap-3">
        <div className="size-9 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 shrink-0" />
        <div>
          <p className="font-body font-medium text-sm text-foreground">{name}</p>
          <p className="font-body text-xs text-foreground/50 uppercase tracking-wide">{role}</p>
        </div>
      </div>
    </div>
  )
}

export function Testimonials() {
  const row1 = [...TESTIMONIALS, ...TESTIMONIALS]
  const row2 = [
    ...TESTIMONIALS.slice(3),
    ...TESTIMONIALS.slice(0, 3),
    ...TESTIMONIALS.slice(3),
    ...TESTIMONIALS.slice(0, 3),
  ]

  return (
    <section id="testimonianze" className="relative py-28 md:py-40 border-t border-border/40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)] mb-16">
        <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
          Testimonianze
        </span>
        <BlurText
          text="Parlano meglio di noi."
          as="h2"
          className="mt-4 font-display uppercase text-4xl md:text-6xl leading-[0.9] tracking-tight max-w-[16ch]"
          delay={0.07}
        />
        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mt-4 font-body text-foreground/60 text-base max-w-[48ch] leading-relaxed"
        >
          Le famiglie che ci hanno scelto descrivono meglio di chiunque cosa significa essere davvero accompagnati.
        </motion.p>
      </div>

      {/* Marquee rows */}
      <div className="group relative flex flex-col gap-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {/* Row 1 — left */}
        <div className="flex gap-5 w-max [animation:marquee_28s_linear_infinite] group-hover:[animation-play-state:paused]">
          {row1.map((t, i) => (
            <Card key={i} {...t} />
          ))}
        </div>
        {/* Row 2 — right */}
        <div className="flex gap-5 w-max [animation:marquee-rev_32s_linear_infinite] group-hover:[animation-play-state:paused]">
          {row2.map((t, i) => (
            <Card key={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  )
}

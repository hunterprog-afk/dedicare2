import { Quote, Star } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"
import { motion } from "motion/react"

type TestimonialCard = { quote: string; name: string; role: string; stars?: number }

function Card({ quote, name, role, stars }: TestimonialCard) {
  const starCount = Math.min(5, Math.max(1, Math.round(stars ?? 5)))

  return (
    <div className="liquid-glass rounded-2xl p-6 md:p-7 w-[290px] md:w-[400px] shrink-0 flex flex-col gap-4 md:gap-5">
      <div className="flex items-center justify-between">
        <Quote className="size-5 text-primary/70" />
        <div className="flex items-center gap-0.5">
          {Array.from({ length: starCount }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      <p className="font-body text-foreground/85 italic leading-relaxed text-[15px] flex-1">
        {quote}
      </p>
      <div className="mt-auto flex items-center gap-3 pt-4 border-t border-[hsl(220,12%,88%)]">
        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-secondary shrink-0 flex items-center justify-center text-white font-display text-base">
          {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div>
          <p className="font-body font-semibold text-sm text-[hsl(220,30%,14%)]">{name}</p>
          <p className="font-body text-xs text-[hsl(220,12%,38%)] uppercase tracking-wide mt-0.5">{role}</p>
        </div>
      </div>
    </div>
  )
}

export function Testimonials() {
  const { t, i18n } = useTranslation()
  const items = t("testimonials.items", { returnObjects: true }) as TestimonialCard[]
  const row1 = [...items, ...items]
  const row2 = [
    ...items.slice(3),
    ...items.slice(0, 3),
    ...items.slice(3),
    ...items.slice(0, 3),
  ]

  return (
    <section id="testimonianze" data-section="light" className="relative py-16 md:py-40 border-t border-border/40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)] mb-12 md:mb-16">
        <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
          {t("testimonials.eyebrow")}
        </span>
        <BlurText
          key={i18n.language + "-testi-title"}
          text={t("testimonials.title")}
          as="h2"
          className="mt-4 font-display uppercase text-[clamp(32px,8vw,60px)] md:text-6xl leading-[0.95] md:leading-[0.9] tracking-tight max-w-[16ch] break-words"
          delay={0.07}
        />
        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mt-4 font-body text-foreground/60 text-base max-w-[48ch] leading-relaxed"
        >
          {t("testimonials.intro")}
        </motion.p>
      </div>

      <div className="group relative flex flex-col gap-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex gap-5 w-max [animation:marquee_28s_linear_infinite] group-hover:[animation-play-state:paused]">
          {row1.map((tt, i) => <Card key={`r1-${i}`} {...tt} />)}
        </div>
        <div className="flex gap-5 w-max [animation:marquee-rev_32s_linear_infinite] group-hover:[animation-play-state:paused]">
          {row2.map((tt, i) => <Card key={`r2-${i}`} {...tt} />)}
        </div>
      </div>
    </section>
  )
}

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BlurText } from "@/components/BlurText"
import { SERVICES } from "@/lib/constants"
import { ServiceModal, type ServiceModalData } from "@/components/ServiceModal"

type TranslatedService = {
  title: string
  body: string
  longDescription?: string
  bullets?: string[]
}

export function ServicesBento() {
  const { t, i18n } = useTranslation()
  const translated = t("services.items", { returnObjects: true }) as TranslatedService[]

  const [modalOpen, setModalOpen] = useState(false)
  const [activeData, setActiveData] = useState<ServiceModalData | null>(null)

  const openService = (idx: number) => {
    const service = SERVICES[idx]
    const item = translated[idx] ?? { title: service.title, body: service.body, bullets: service.bullets }
    setActiveData({
      title: item.title,
      image: service.image,
      body: item.body,
      longDescription: item.longDescription,
      bullets: item.bullets ?? service.bullets,
    })
    setModalOpen(true)
  }

  return (
    <section id="servizi" data-section="light" className="relative py-16 md:py-40">
      <div className="max-w-[var(--max)] mx-auto px-[var(--gutter)]">
        {/* Header */}
        <div className="mb-10 md:mb-12">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-foreground/80 inline-block">
            {t("services.eyebrow")}
          </span>
          <BlurText
            key={i18n.language + "-services-title"}
            text={t("services.title")}
            as="h2"
            className="mt-4 font-display uppercase text-[clamp(32px,8vw,60px)] md:text-6xl leading-[0.95] md:leading-[0.9] tracking-tight max-w-[22ch] break-words"
            delay={0.07}
          />
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mt-4 font-body text-foreground/60 text-base max-w-[52ch] leading-relaxed"
          >
            {t("services.intro")}
          </motion.p>
        </div>

        {/* Bento grid — minimal image cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {SERVICES.map((service, idx) => {
            const item = translated[idx] ?? { title: service.title, body: service.body, bullets: service.bullets }
            return (
              <motion.button
                key={service.slug ?? service.icon}
                type="button"
                onClick={() => openService(idx)}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] text-left border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(168,49%,42%)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: idx * 0.05 }}
                aria-label={`${item.title} — ${t("services.scopri")}`}
              >
                {/* Background image */}
                <img
                  src={service.image}
                  alt={`Dedicare Solutions — ${item.title} a Milano e hinterland`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />

                {/* Dark gradient overlay for legibility */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.12) 100%)",
                  }}
                  aria-hidden="true"
                />

                {/* Title bottom-left */}
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 flex items-end justify-between gap-3">
                  <h3 className="font-display uppercase text-xl md:text-2xl leading-[0.95] tracking-tight text-white max-w-[14ch]">
                    {item.title}
                  </h3>

                  {/* CTA pill */}
                  <span
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-full pl-3 pr-2 py-1.5 text-[11px] uppercase tracking-wider font-body text-white border border-white/30 bg-white/10 backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-black group-hover:border-white"
                  >
                    <span className="whitespace-nowrap">{t("services.scopri")}</span>
                    <span
                      className="size-5 rounded-full flex items-center justify-center bg-white/20 group-hover:bg-black/15 transition-colors"
                      aria-hidden="true"
                    >
                      <ArrowUpRight className="size-3" strokeWidth={2.5} />
                    </span>
                  </span>
                </div>

                {/* Subtle teal hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(168, 49%, 38%, 0.20) 0%, hsl(168, 49%, 42%, 0.08) 60%, transparent 100%)",
                  }}
                  aria-hidden="true"
                />
              </motion.button>
            )
          })}
        </div>
      </div>

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={activeData}
      />
    </section>
  )
}

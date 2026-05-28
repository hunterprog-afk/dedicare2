import { useRef } from "react"
import { motion } from "motion/react"
import { ArrowUpRight, Phone } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { BlurText } from "@/components/BlurText"
import { VideoScrub } from "@/components/VideoScrub"
import { PartnerBadge, PARTNERS_DATA } from "@/components/PartnerBadge"

type Props = {
  scrollRef: React.RefObject<HTMLElement | null>
}

export function Hero({ scrollRef }: Props) {
  const { t, i18n } = useTranslation()
  const innerRef = useRef<HTMLDivElement>(null)

  return (
    // Outer: tall enough to scroll through the full video (300vh ≈ 8 s video at ~37px/frame)
    <section
      ref={scrollRef as React.RefObject<HTMLElement>}
      data-section="dark"
      className="relative"
      style={{ height: "300vh" }}
    >
      {/* Sticky inner — stays pinned while the user scrolls through the 300vh */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Poster fallback — visible immediately while the video loads (sits behind video) */}
        <img
          src={`${import.meta.env.BASE_URL}hero-poster.jpg`}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />

        {/* Video hero — scroll-scrubbed (overlays poster once loaded) */}
        <VideoScrub
          src={`${import.meta.env.BASE_URL}hero-dedicare.mp4`}
          poster={`${import.meta.env.BASE_URL}hero-poster.jpg`}
          className="absolute inset-0 w-full h-full z-0 object-cover"
          containerRef={scrollRef}
        />

        {/* Base dark overlay */}
        <div className="absolute inset-0 z-[1] bg-black/65" />

        {/* Center darkening radial */}
        <div className="absolute inset-0 z-[2] bg-[radial-gradient(70%_55%_at_50%_42%,rgba(0,0,0,0.35)_0%,transparent_100%)]" />

        {/* Top gradient */}
        <div className="absolute top-0 inset-x-0 h-32 z-[3] bg-gradient-to-b from-black/40 to-transparent" />

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 inset-x-0 h-[35vh] z-[3] gradient-fade-b" />

        {/* Accessibility */}
        <p className="sr-only">{t("hero.video_alt")}</p>

        {/* Content */}
        <div ref={innerRef} className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-[10vh] md:justify-center md:pt-0 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-[92vw]"
          >
            <div className="liquid-glass rounded-full p-1 inline-flex items-center gap-2 max-w-full">
              <span className="bg-primary text-white rounded-full px-3 py-1 text-[11px] md:text-xs font-semibold font-body shrink-0">
                {t("hero.tag_city")}
              </span>
              <span className="pr-3 text-[11px] md:text-sm text-white/90 font-body whitespace-nowrap overflow-hidden text-ellipsis">
                {t("hero.tag_label")}
              </span>
            </div>
          </motion.div>

          <BlurText
            key={i18n.language + "-hero-title"}
            text={t("hero.title")}
            as="h1"
            immediate
            className="mt-12 md:mt-6 font-display uppercase text-[clamp(40px,7vw,120px)] leading-[0.92] tracking-[-0.02em] text-white max-w-[14ch] drop-shadow-2xl"
            delay={0.09}
            startDelay={0.15}
          />

          <motion.p
            initial={{ filter: "blur(10px)", opacity: 0, y: 16 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 md:mt-6 font-body text-base md:text-lg text-white/80 max-w-xl leading-relaxed drop-shadow"
          >
            {t("hero.subline")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-12 md:mt-10 flex items-center gap-3 flex-wrap justify-center"
          >
            <Button
              variant="hero"
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              asChild
            >
              <a href="#contatti">
                {t("hero.cta_primary")} <ArrowUpRight className="ml-1 size-4" />
              </a>
            </Button>
            <Button
              variant="heroGlass"
              className="bg-white/15 hover:bg-white/25 border border-white/40 text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              asChild
            >
              <a href="tel:+393882536992">
                <Phone className="mr-1.5 size-4" /> +39 388 253 6992
              </a>
            </Button>
          </motion.div>

          {/* Partners */}
          <div className="absolute bottom-4 md:bottom-8 inset-x-0 flex flex-col items-center gap-5 md:gap-3 px-6">
            <span className="text-[11px] font-body uppercase tracking-[0.18em] text-white/55">
              {t("hero.partners_label")}
            </span>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center max-w-[980px]">
              {PARTNERS_DATA.map((p) => (
                <PartnerBadge key={p.abbr} partner={p} variant="dark" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

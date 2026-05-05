import { useRef } from "react"
import { motion } from "motion/react"
import { ArrowUpRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlurText } from "@/components/BlurText"
import { VideoScrub } from "@/components/VideoScrub"
import { PARTNERS } from "@/lib/constants"

type Props = {
  scrollRef: React.RefObject<HTMLElement | null>
}

export function Hero({ scrollRef }: Props) {
  const innerRef = useRef<HTMLDivElement>(null)

  return (
    <section
      ref={scrollRef as React.RefObject<HTMLElement>}
      className="relative h-screen overflow-hidden"
    >
      {/* Video hero — autoplay loop */}
      <VideoScrub
        src={`${import.meta.env.BASE_URL}hero-dedicare.mp4`}
        className="absolute inset-0 w-full h-full z-0 object-cover"
      />

      {/* Base dark overlay — strong enough to read text on any frame */}
      <div className="absolute inset-0 z-[1] bg-black/65" />

      {/* Center darkening radial — extra contrast where title sits */}
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(70%_55%_at_50%_42%,rgba(0,0,0,0.35)_0%,transparent_100%)]" />

      {/* Top gradient — softens transition to navbar */}
      <div className="absolute top-0 inset-x-0 h-32 z-[3] bg-gradient-to-b from-black/40 to-transparent" />

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 inset-x-0 h-[35vh] z-[3] gradient-fade-b" />

      {/* Accessibility */}
      <p className="sr-only">
        Video di presentazione di Dedicare Solutions — assistenza sanitaria professionale nell'area metropolitana di Milano.
      </p>

      {/* Content */}
      <div ref={innerRef} className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="liquid-glass rounded-full px-1 py-1 inline-flex items-center gap-2">
            <span className="bg-primary text-white rounded-full px-3 py-1 text-xs font-semibold font-body">
              Milano
            </span>
            <span className="pr-3 text-sm text-white/85 font-body">
              Assistenza Sanitaria Professionale
            </span>
          </div>
        </motion.div>

        <BlurText
          text="La cura che meriti."
          as="h1"
          className="mt-6 font-display uppercase text-[clamp(44px,7vw,120px)] leading-[0.92] tracking-[-0.02em] text-white max-w-[14ch] drop-shadow-lg"
          delay={0.09}
          startDelay={0.15}
        />

        <motion.p
          initial={{ filter: "blur(10px)", opacity: 0, y: 16 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-body text-base md:text-lg text-white/80 max-w-xl leading-relaxed drop-shadow"
        >
          Dedicare Solutions affianca anziani, adulti, bambini e disabili nel percorso di cura — a domicilio, in ospedale e in ogni spostamento.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-10 flex items-center gap-3 flex-wrap justify-center"
        >
          <Button
            variant="hero"
            className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            asChild
          >
            <a href="#contatti">
              Consulenza gratuita <ArrowUpRight className="ml-1 size-4" />
            </a>
          </Button>
          <Button
            variant="heroGlass"
            className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            asChild
          >
            <a href="tel:+39882536992">
              <Phone className="mr-1.5 size-4" /> +39 882 536 992
            </a>
          </Button>
        </motion.div>

        {/* Partners */}
        <div className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-4 px-6">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-body text-white/80">
            Collaboriamo con
          </span>
          <div className="flex items-center gap-6 md:gap-10 flex-wrap justify-center">
            {PARTNERS.map((p) => (
              <span
                key={p}
                className="font-display italic text-lg md:text-xl text-white/60 tracking-tight"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

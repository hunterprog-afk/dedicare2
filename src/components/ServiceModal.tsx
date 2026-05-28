import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, X, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"

export interface ServiceModalData {
  title: string
  image: string
  body: string
  longDescription?: string
  bullets?: string[]
}

interface ServiceModalProps {
  open: boolean
  onClose: () => void
  data: ServiceModalData | null
}

export function ServiceModal({ open, onClose, data }: ServiceModalProps) {
  const { t } = useTranslation()
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      const previous = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = previous
      }
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  // Move focus to close button on open
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [open])

  const handleCtaClick = () => {
    onClose()
    // Defer to allow modal to unmount + body scroll to restore
    requestAnimationFrame(() => {
      const target =
        document.getElementById("contatti") ||
        document.getElementById("contact") ||
        document.getElementById("lavora-con-noi")
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" })
      } else {
        window.location.hash = "#contatti"
      }
    })
  }

  return (
    <AnimatePresence>
      {open && data && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={data.title}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full sm:max-w-2xl max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#161D2E] border border-white/10 shadow-2xl mx-0 sm:mx-4 overflow-hidden"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Hero image */}
            <div className="relative aspect-video w-full bg-black/40 shrink-0">
              <img
                src={data.image}
                alt={data.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(22,29,46,0.95) 0%, rgba(22,29,46,0.3) 50%, rgba(22,29,46,0.1) 100%)",
                }}
                aria-hidden="true"
              />
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-4 right-4 flex items-center justify-center size-9 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label={t("services.modal_close", "Chiudi")}
              >
                <X className="size-4" />
              </button>
              <h2 className="absolute bottom-4 left-5 right-5 font-display uppercase text-2xl md:text-3xl leading-[0.95] tracking-tight text-white">
                {data.title}
              </h2>
            </div>

            {/* Body — scrollable */}
            <div className="overflow-y-auto p-6 text-white/80 font-body text-sm leading-relaxed space-y-5 scroll-smooth">
              {data.longDescription && (
                <p className="text-white/85 text-[15px] leading-relaxed">
                  {data.longDescription}
                </p>
              )}
              {!data.longDescription && data.body && (
                <p className="text-white/85 text-[15px] leading-relaxed">
                  {data.body}
                </p>
              )}
              {data.bullets && data.bullets.length > 0 && (
                <ul className="space-y-2.5">
                  {data.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check
                        className="size-4 shrink-0 mt-0.5"
                        strokeWidth={2.5}
                        style={{ color: "hsl(174, 62%, 55%)" }}
                      />
                      <span className="text-white/85">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 order-2 sm:order-1"
              >
                {t("services.modal_close", "Chiudi")}
              </button>
              <button
                onClick={handleCtaClick}
                className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-medium text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 order-1 sm:order-2"
                style={{ background: "hsl(174, 62%, 38%)" }}
              >
                <span>{t("services.modal_cta", "Richiedi questo servizio")}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

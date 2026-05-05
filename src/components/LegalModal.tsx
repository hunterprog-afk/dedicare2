import { useEffect } from "react"
import { X } from "lucide-react"
import { useTranslation } from "react-i18next"

interface LegalModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function LegalModal({ open, onClose, title, children }: LegalModalProps) {
  const { t } = useTranslation()
  // Blocca lo scroll del body quando il modal è aperto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Chiude con tasto Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Overlay scuro */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Pannello */}
      <div className="relative z-10 w-full sm:max-w-2xl max-h-[90dvh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#161D2E] border border-white/10 shadow-2xl mx-0 sm:mx-4">
        {/* Header fisso */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="font-display text-lg font-semibold text-white tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label={t("legal_modal.close")}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Contenuto scrollabile */}
        <div className="overflow-y-auto px-6 py-6 text-white/75 font-body text-sm leading-relaxed space-y-4 scroll-smooth">
          {children}
        </div>

        {/* Footer fisso */}
        <div className="shrink-0 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            {t("legal_modal.close")}
          </button>
        </div>
      </div>
    </div>
  )
}

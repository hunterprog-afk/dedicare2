import { useEffect, useEffectEvent, useRef, type MouseEvent } from "react"
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

const EMPTY_DATA: ServiceModalData = { title: "", image: "", body: "", bullets: [] }

export function ServiceModal({ open, onClose, data }: ServiceModalProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Il <dialog> resta sempre montato (serve per l'animazione di uscita via
  // CSS), quindi `data` può essere null prima della prima apertura: usiamo un
  // fallback vuoto per evitare crash, tanto in quello stato il dialog è
  // comunque chiuso/non visibile.
  const safeData = data ?? EMPTY_DATA

  // Pilota il <dialog> nativo in risposta al prop `open`.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Listener su 'close': intercetta le chiusure gestite dal browser senza
  // passare dai nostri handler (Escape nativo, altri "light dismiss"). Per i
  // trigger interni sotto chiamiamo onClose() anche in modo diretto (vedi
  // requestClose), per non far dipendere lo sblocco scroll/stato React dalla
  // latenza di consegna dell'evento — onClose è idempotente.
  // useEffectEvent invece di [onClose] in dependency array: il dialog resta
  // montato per tutta la vita del parent, il listener va attaccato una
  // volta sola (stesso pattern dell'ex handler Escape, vedi PR #8).
  const onNativeClose = useEffectEvent(() => onClose())
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onNativeClose()
    dialog.addEventListener("close", handleClose)
    return () => dialog.removeEventListener("close", handleClose)
  }, [])

  // Chiude il dialog nativo e notifica subito il parent, senza aspettare la
  // consegna asincrona dell'evento 'close'.
  function requestClose() {
    dialogRef.current?.close()
    onClose()
  }

  // Lock body scroll while modal is open (difesa in profondità, vedi LegalModal)
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  function handleBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      requestClose()
    }
  }

  const handleCtaClick = () => {
    requestClose()
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
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-label={safeData.title}
      className="native-dialog flex items-end sm:items-center justify-center"
    >
      {/* Panel */}
      <div className="native-dialog__panel relative w-full sm:max-w-2xl max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#161D2E] border border-white/10 shadow-2xl mx-0 sm:mx-4 overflow-hidden">
        {/* Hero image */}
        <div className="relative aspect-video w-full bg-black/40 shrink-0">
          <img
            src={safeData.image}
            alt={safeData.title}
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
            autoFocus
            onClick={requestClose}
            className="absolute top-4 right-4 flex items-center justify-center size-9 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label={t("services.modal_close", "Chiudi")}
          >
            <X className="size-4" />
          </button>
          <h2 className="absolute bottom-4 left-5 right-5 font-display uppercase text-2xl md:text-3xl leading-[0.95] tracking-tight text-white">
            {safeData.title}
          </h2>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto p-6 text-white/80 font-body text-sm leading-relaxed space-y-5 scroll-smooth">
          {safeData.longDescription && (
            <p className="text-white/85 text-[15px] leading-relaxed">
              {safeData.longDescription}
            </p>
          )}
          {!safeData.longDescription && safeData.body && (
            <p className="text-white/85 text-[15px] leading-relaxed">
              {safeData.body}
            </p>
          )}
          {safeData.bullets && safeData.bullets.length > 0 && (
            <ul className="space-y-2.5">
              {safeData.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <Check
                    className="size-4 shrink-0 mt-0.5"
                    strokeWidth={2.5}
                    style={{ color: "hsl(168, 49%, 42%)" }}
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
            onClick={requestClose}
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 order-2 sm:order-1"
          >
            {t("services.modal_close", "Chiudi")}
          </button>
          <button
            onClick={handleCtaClick}
            className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-medium text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 order-1 sm:order-2"
            style={{ background: "hsl(168, 49%, 38%)" }}
          >
            <span>{t("services.modal_cta", "Richiedi questo servizio")}</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </dialog>
  )
}

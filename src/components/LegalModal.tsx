import { useEffect, useEffectEvent, useRef, type MouseEvent } from "react"
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
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Pilota il <dialog> nativo in risposta al prop `open`. showModal()/close()
  // danno gratis focus-trap, top-layer stacking e semantica "dialog" senza
  // bisogno di role/aria-modal manuali.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Listener su 'close': è l'unico modo per intercettare le chiusure che il
  // browser gestisce da sé senza passare dai nostri handler (Escape nativo,
  // altri "light dismiss"). Per i trigger interni (bottoni, backdrop) sotto
  // chiamiamo onClose() anche in modo diretto, per non far dipendere lo
  // sblocco dello scroll/stato React dalla latenza di consegna dell'evento
  // nativo — onClose è idempotente (setState con lo stesso valore è un
  // no-op), quindi la doppia chiamata è innocua.
  // useEffectEvent invece di mettere onClose in dependency array: il dialog
  // resta montato per tutta la vita del parent, quindi il listener va
  // attaccato una volta sola e non ri-sottoscritto ad ogni render (stesso
  // pattern già adottato per l'ex handler Escape, vedi PR #8).
  const onNativeClose = useEffectEvent(() => onClose())
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onNativeClose()
    dialog.addEventListener("close", handleClose)
    return () => dialog.removeEventListener("close", handleClose)
  }, [])

  // Chiude il dialog nativo e notifica subito il parent, senza aspettare la
  // consegna asincrona dell'evento 'close' (vedi commento sopra).
  function requestClose() {
    dialogRef.current?.close()
    onClose()
  }

  // Blocca lo scroll del body mentre il modal è aperto. showModal() rende già
  // inerte il resto della pagina (no focus/click esterni), ma non garantisce
  // da solo che rotellina/touch-scroll non muovano il body sotto in tutti i
  // browser: manteniamo il lock esplicito come difesa in profondità.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Click fuori dal pannello (sul box del dialog stesso, non su un figlio) chiude.
  function handleBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      requestClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-label={title}
      className="native-dialog flex items-end sm:items-center justify-center"
    >
      {/* Pannello */}
      <div className="native-dialog__panel relative w-full sm:max-w-2xl max-h-[90dvh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#161D2E] border border-white/10 shadow-2xl mx-0 sm:mx-4">
        {/* Header fisso */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="font-display text-lg font-semibold text-white tracking-tight">
            {title}
          </h2>
          <button
            autoFocus
            onClick={requestClose}
            className="flex items-center justify-center size-8 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label={t("legal_modal.close")}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Contenuto scrollabile */}
        <div className="overflow-y-auto p-6 text-white/75 font-body text-sm leading-relaxed space-y-4 scroll-smooth">
          {children}
        </div>

        {/* Footer fisso */}
        <div className="shrink-0 px-6 py-4 border-t border-white/10">
          <button
            onClick={requestClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            {t("legal_modal.close")}
          </button>
        </div>
      </div>
    </dialog>
  )
}

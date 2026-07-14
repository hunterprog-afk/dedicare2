import { useTranslation } from "react-i18next"

interface CurriculumFormSuccessProps {
  onRetry: () => void
}

/** Schermata mostrata dentro il pannello form dopo un invio riuscito. */
export function CurriculumFormSuccess({ onRetry }: CurriculumFormSuccessProps) {
  const { t } = useTranslation()

  return (
    <div className="text-center py-6">
      <div className="mb-4 flex justify-center">
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 text-primary text-3xl">
          ✓
        </span>
      </div>
      <p className="font-display italic text-2xl text-white mb-2">
        {t("curriculum.success_title")}
      </p>
      <p className="font-body text-sm text-white/60">
        {t("curriculum.success_body")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 text-xs font-body text-primary/70 hover:text-primary transition-colors underline underline-offset-2"
      >
        {t("curriculum.success_retry")}
      </button>
    </div>
  )
}

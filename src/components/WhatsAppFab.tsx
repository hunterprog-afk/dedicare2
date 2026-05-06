import { useTranslation } from "react-i18next"

export function WhatsAppFab() {
  const { t } = useTranslation()
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group">
      {/* Tooltip */}
      <span
        className="
          absolute right-full mr-3 top-1/2 -translate-y-1/2
          whitespace-nowrap rounded-lg px-3 py-1.5
          bg-[#1a1a1a] text-white text-xs font-body shadow-lg
          opacity-0 pointer-events-none
          group-hover:opacity-100
          transition-opacity duration-200
        "
      >
        {t("whatsapp.tooltip")}
        {/* Arrow */}
        <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1a1a1a]" />
      </span>

      {/* FAB button */}
      <a
        href="https://wa.me/393882536992"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsapp.aria")}
        className="
          flex items-center justify-center
          w-14 h-14 rounded-full
          bg-[#25D366]
          shadow-[0_4px_20px_rgba(37,211,102,0.45)]
          hover:scale-110 transition-transform duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background
        "
      >
        {/* WhatsApp SVG logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="28"
          height="28"
          fill="white"
          aria-hidden="true"
        >
          <path d="M16.002 2.667C8.638 2.667 2.667 8.637 2.667 16c0 2.358.621 4.57 1.706 6.487L2.667 29.333l7.02-1.682A13.276 13.276 0 0 0 16.002 29.333C23.363 29.333 29.333 23.363 29.333 16S23.363 2.667 16.002 2.667Zm0 2.4c5.924 0 10.933 5.01 10.933 10.933 0 5.924-5.01 10.933-10.933 10.933a10.9 10.9 0 0 1-5.556-1.517l-.398-.242-4.168.998.993-4.06-.27-.418A10.9 10.9 0 0 1 5.069 16c0-5.924 5.01-10.933 10.933-10.933Zm-3.87 5.6c-.222 0-.583.083-.888.416-.306.334-1.167 1.14-1.167 2.779s1.195 3.224 1.362 3.446c.167.222 2.307 3.668 5.668 4.998 2.807 1.107 3.376.889 3.986.833.61-.055 1.972-.806 2.25-1.584.278-.778.278-1.445.195-1.584-.083-.139-.306-.222-.64-.388-.334-.167-1.973-.973-2.279-1.084-.306-.11-.528-.167-.75.167-.222.333-.861 1.083-1.055 1.305-.195.222-.39.25-.723.083-.334-.167-1.41-.52-2.688-1.66-.993-.888-1.664-1.984-1.858-2.318-.195-.333-.02-.514.146-.68.15-.15.334-.39.5-.584.167-.194.222-.333.334-.555.11-.222.055-.417-.028-.584-.083-.167-.75-1.81-1.028-2.473-.27-.646-.546-.557-.75-.567-.194-.009-.417-.011-.639-.011Z" />
        </svg>
      </a>
    </div>
  )
}

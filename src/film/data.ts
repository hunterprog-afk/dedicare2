/** Scroll per scena in altezze di schermo (hero e finale 1,7) e quanto la camera rallenta a metà scena. */
export const SCENE_SCROLL = [1.7, 1.4, 1.4, 1.4, 1.4, 1.4, 1.7] as const
export const LINGER = [0.4, 0.3, 0.3, 0.3, 0.3, 0.3, 0.4] as const
/** Scena -> servizio di cui apre l'elenco completo. */
export const PANELS: Record<number, "assistenza247" | "oss" | "accompagnamento" | "multidisciplinare"> = {
  1: "assistenza247",
  3: "oss",
  4: "accompagnamento",
  5: "multidisciplinare",
}
export const TOTAL = SCENE_SCROLL.reduce((a, b) => a + b, 0)


/** Umore della scena: colora il piccolo orologio (notte, alba, mattino, sera). */
export const MOODS = ["night", "night", "dawn", "morning", "morning", "morning", "evening"] as const

// Sempre caricato, piccolo: header pieno oltre 80 px, barra contatti del telefono dopo l'hero,
// chiusura del foglio dell'indice prima dello scroll alle ancore.
// La gestione dell'ora senza movimento (prefers-reduced-motion) la aggiunge chi costruisce il movimento.

const header = document.querySelector<HTMLElement>(".site-header")
if (header) {
  const update = () => header.classList.toggle("is-solid", header.classList.contains("site-header-legal") || scrollY > 80)
  update()
  addEventListener("scroll", update, { passive: true })
}

const bar = document.querySelector<HTMLElement>(".mobile-bar")
const hero = document.getElementById("inizio")
if (bar && hero && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => !e.isIntersecting)) {
      bar.classList.add("is-shown")
      io.disconnect()
    }
  })
  io.observe(hero)
} else if (bar) {
  bar.classList.add("is-shown")
}

const sheet = document.getElementById("indice-ore")
sheet?.addEventListener("click", (e) => {
  if ((e.target as Element).closest("a[href^='#']")) (sheet as HTMLElement).hidePopover?.()
})

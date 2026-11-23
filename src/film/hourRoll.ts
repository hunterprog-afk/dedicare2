/** Cambia l'ora mostrata con un rullo verticale: la cifra vecchia esce verso l'alto, la nuova sale da sotto. */
export function setHour(host: HTMLElement, time: string, animate = true) {
  if (host.dataset.filmHour === time) return
  host.dataset.filmHour = time
  const cells = host.querySelectorAll<HTMLElement>(".hr-c")
  const digits = time.replace(":", "").split("")
  cells.forEach((cell, i) => {
    const old = cell.firstElementChild as HTMLElement | null
    const next = digits[i]
    if (!old || old.textContent === next) return
    if (!animate || typeof cell.animate !== "function") {
      old.textContent = next
      return
    }
    // Una sola animazione per cifra: se ne arriva un'altra mentre la prima corre, la prima si chiude subito.
    cell.querySelectorAll<HTMLElement>(":scope > span:not(:last-child)").forEach((s) => s.remove())
    const fresh = document.createElement("span")
    fresh.textContent = next
    cell.appendChild(fresh)
    const opts: KeyframeAnimationOptions = { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
    old.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-110%)", opacity: 0 }], opts)
    const a = fresh.animate([{ transform: "translateY(110%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], opts)
    a.onfinish = () => old.remove()
  })
}

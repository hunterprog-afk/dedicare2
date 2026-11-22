// Cifre dell'orologio: ogni carattere è una finestra alta 1em; cambiano solo le cifre diverse,
// la vecchia esce verso l'alto e la nuova entra dal basso in 240 ms.

const WIN = "display:inline-block;position:relative;overflow:hidden;height:1em;line-height:1em;vertical-align:top"
const DIGIT = "display:block"
const IN = "display:block;position:absolute;left:0;top:0"
const ROLL: KeyframeAnimationOptions = { duration: 240, easing: "cubic-bezier(0.2, 0, 0, 1)", fill: "forwards" }

interface Win {
  el: HTMLElement
  anims: Animation[]
}

function span(text: string, css: string) {
  const s = document.createElement("span")
  s.textContent = text
  s.style.cssText = css
  return s
}

/** Porta la finestra a riposo: un solo figlio, nessuna animazione in corso. */
function settle(w: Win) {
  for (const a of w.anims) a.cancel()
  w.anims = []
  while (w.el.childElementCount > 1) w.el.firstElementChild!.remove()
  const last = w.el.firstElementChild as HTMLElement | null
  if (last) last.style.cssText = DIGIT
}

function roll(w: Win, ch: string) {
  settle(w)
  const old = w.el.firstElementChild as HTMLElement
  const next = span(ch, IN)
  w.el.append(next)
  const a1 = old.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], ROLL)
  const a2 = next.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], ROLL)
  a2.onfinish = () => settle(w)
  w.anims = [a1, a2]
}

export interface Clock {
  set(text: string, animate: boolean): void
}

/** `shown(el)`: falso per l'orologio nascosto a quella larghezza (pillola su desktop, binario sul telefono):
 *  lì le cifre cambiano senza rotolare, così nessuna animazione gira su un elemento che non si vede. */
export function createClock(targets: readonly HTMLElement[], initial: string, shown: (el: HTMLElement) => boolean = () => true): Clock {
  let current = initial
  const groups: Win[][] = targets.map((el) => {
    el.textContent = ""
    // Riga alta quanto le finestre: nella pillola (flex centrato) le cifre restano in asse con l'icona.
    el.style.lineHeight = "1"
    return [...initial].map((ch) => {
      const w = span("", WIN)
      w.append(span(ch, DIGIT))
      el.append(w)
      return { el: w, anims: [] }
    })
  })
  return {
    set(text, animate) {
      if (text === current) return
      groups.forEach((wins, g) => {
        const rolls = animate && shown(targets[g])
        for (let i = 0; i < wins.length; i++) {
          if (text[i] === current[i]) continue
          if (rolls) roll(wins[i], text[i])
          else {
            settle(wins[i])
            wins[i].el.firstElementChild!.textContent = text[i]
          }
        }
      })
      current = text
    },
  }
}

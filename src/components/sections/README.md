# Sezioni della pagina: chi costruisce cosa

La composizione (`src/pages/Home.tsx`) monta già ogni sezione, nell'ordine della specifica, con il suo `id`,
`data-tone`, `data-band`, `data-hour-at`, `data-hour`, `data-label-hour`. Chi costruisce una sezione
**sostituisce solo il file indicato** e prende gli attributi da `sectionAttrs("<id>")` (`src/content/hours.ts`):
non si toccano gli id, le ore né l'ordine in `Home.tsx`. I file con `SectionPlaceholder` sono segnaposto
(`data-placeholder` nell'HTML): quando un file viene sostituito, il controllo di `scripts/check-dist.mjs`
sui testi dell'HTML pre-renderizzato si attiva da solo.

| File | Sezione (id) | Passo della specifica | Chi la costruisce |
|---|---|---|---|
| `Hero.tsx` (+ `Hero.css`) | `#inizio` | 2 | fatto (builder di base) |
| `AChi.tsx` | `#a-chi` | 3.1 | builder delle sezioni |
| `ServiziOrario.tsx` | `#servizi` | 3.2 | builder delle sezioni |
| `Assistenza247.tsx` | `#assistenza-24-7` | 3.3 | builder delle sezioni |
| `CambioTurno.tsx` | `#cambio-turno` | 3.4 | builder delle sezioni |
| `OperatoriOss.tsx` | `#operatori-oss` | 3.5 | builder delle sezioni |
| `Accompagnamento.tsx` | `#accompagnamento` | 3.6 | builder delle sezioni |
| `Multidisciplinare.tsx` | `#multidisciplinare` | 3.7 | builder delle sezioni |
| `Perche.tsx` | `#perche` (+ `#filosofia`) | 3.8 | builder delle sezioni |
| `ComeFunziona.tsx` | `#come-funziona` (+ `#processo`) | 3.9 | builder delle sezioni |
| `Aree.tsx`, `MappaMilano.tsx` | `#aree` | 3.10 | builder delle sezioni |
| `Tariffe.tsx` | `#tariffe` | 3.11 | builder delle sezioni |
| `Sera.tsx` | `#sera` | 3.12 | builder delle sezioni |
| `Faq.tsx` | `#faq` | 3.13 | builder delle sezioni |
| `LavoraConNoi.tsx` | `#lavora-con-noi` | 3.14 (il modulo è dei moduli) | builder delle sezioni |
| `Contatti.tsx` | `#contatti` | 3.15 (il modulo è dei moduli) | builder delle sezioni |
| `../shell/Footer.tsx` | `<footer>` | 4.1 | builder di footer e legali |
| `../legal/LegalPage.tsx` | `/privacy/`, `/cookie/`, `/note-legali/` | 4.2 | builder di footer e legali |
| `../forms/ContactForm.tsx`, `CurriculumForm.tsx` (+ da creare: `Field.tsx`, `useForm.ts`, `src/lib/formsApi.ts`, `src/lib/validation.ts`) | moduli dentro i fogli di contatti e lavora con noi | 5 | builder dei moduli |

## Convenzioni

- **Stile**: classi Tailwind per il layout; per il resto un file CSS accanto al componente, importato dal componente
  (`import "./Nome.css"`) e scritto dentro `@layer components { … }`, così le utilità di Tailwind vincono sempre.
  Niente modifiche a `src/styles/*` salvo token nuovi concordati.
- **Colori**: solo le variabili del tono (`--ink`, `--ink-2`, `--btn-bg`, `--btn-ink`, `--line`, `--focus`, `--hour`)
  o i 7 esadecimali della palette. `npm run budgets` fallisce se nel CSS compare un altro colore.
- **Tipografia**: classi `t-h1`, `t-h2`, `t-display`, `t-h3`, `t-lead`, `t-body`, `t-eyebrow`, `t-phone`, `t-clock`.
- **Pezzi comuni**: `Button`, `Sheet`, `HourLabel`, `Picture` (`light="night" | "day"` aggiunge il velo), `icons`, `Logo`.
- **Contratto con il motore di movimento** (specifica §7): `[data-reveal]`, `[data-word]`, `[data-light]` + `.veil`,
  `#assistenza-24-7 .photo-b`, `.cambio-photo`, `.sera-photo`, `.map-window[data-comune]`. Gli elementi mai animati
  (H1, numero di telefono, riga del 112, testi legali, footer, FAQ) non portano nessun attributo di ingresso.
- **Testi**: solo da `src/i18n/locales/*.json` (chiavi già presenti per tutta la pagina) e `src/content/legal.ts`.
- **Foto**: `Picture name="…"` con i nomi di `src/content/images.ts`; finché le foto non ci sono mostra il segnaposto.

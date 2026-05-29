# Dedicare Solutions — CLAUDE.md

## Progetto
Landing page cinematic per **Dedicare Solutions S.r.l.s.**, azienda di assistenza sanitaria domiciliare nell'area metropolitana di Milano.

**URL live:** https://hunterprog-afk.github.io/dedicare2/
**Azienda:** Dedicare Solutions S.r.l.s. — P.IVA IT11600760968
**Fondatore:** Lisis Zuniga · +39 388 253 6992 · info@dedicaresolutions.it
**Sede:** Via Roma 80, Segrate (MI) 20054

---

## Stack tecnologico
- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **Motion** (Framer Motion successor) per animazioni
- **Three.js 0.184** per il componente MilanCity3D
- **i18next** per internazionalizzazione IT/EN
- **shadcn/ui** (accordion, button)
- Deploy su **GitHub Pages** via GitHub Actions (push su `main` → deploy automatico)

---

## Avvio rapido
```bash
npm install
npm run dev       # dev server su localhost:5173
npm run build     # build produzione in dist/
npm run preview   # preview build locale
```

---

## Struttura componenti (tutti in `src/components/`)

| Componente | Descrizione |
|---|---|
| `Hero.tsx` | Hero 300vh sticky con video scroll-scrub |
| `Navbar.tsx` | Nav con ThemeToggle + LanguageToggle |
| `ServicesBento.tsx` | 6 servizi in bento grid |
| `Pourquoi.tsx` | 4 reason cards (perché sceglierci) |
| `Team.tsx` | Schede team |
| `Process.tsx` | 4 step: Contatto → Valutazione → Attivazione → Follow-up |
| `AreeServite.tsx` | Copertura geografica Milano e comuni |
| `Stats.tsx` | KPI: 24/7, 100%, 3+, MI |
| `Certificazioni.tsx` | Partner badges (INPS, ASL, CRI, ANOSS, ecc.) |
| `Tariffario.tsx` | Tabella prezzi/servizi |
| `Testimonials.tsx` | 7 testimonianze clienti |
| `Faq.tsx` | 7 domande frequenti (accordion) |
| `Blog.tsx` | Sezione blog |
| `CtaFooter.tsx` | Footer con CTA + link legali |
| `ContactForm.tsx` | Form contatti |
| `WhatsAppFab.tsx` | Pulsante WhatsApp floating |
| `VideoScrub.tsx` | Controller video seek-on-scroll |
| `MilanCity3D.tsx` | Visualizzazione 3D Milano con Three.js |
| `LegalModal.tsx` | Modal privacy/termini |

---

## File chiave

- `src/lib/constants.ts` — tutti i contenuti statici (servizi, FAQ, processo, ecc.)
- `src/i18n/locales/it.json` / `en.json` — traduzioni IT/EN
- `src/index.css` — design tokens CSS (--ink, --cream, --ochre, --terra, --warm)
- `index.html` — SEO meta tags, schema.org MedicalBusiness, GA deferred
- `vite.config.ts` — base `/dedicare2/`, manual chunks (react, motion, three)

---

## Design system

**Palette (dark mode default):**
- `--ink`: sfondo scuro principale
- `--cream`: testo principale chiaro
- `--ochre`: accento giallo/oro
- `--terra`: accento terracotta/rosso
- `--warm`: accento caldo secondario

**Light mode:** override tramite `:root.light` in `index.css`

**Font:** Oswald (display/titoli) + Inter (body)

**Breakpoints Tailwind:** sm 640px · md 768px · lg 1024px · xl 1280px · 2xl 1536px

---

## Convenzioni di sviluppo

- Tutto il testo visibile va nelle traduzioni (`src/i18n/locales/it.json` e `en.json`)
- Contenuti statici (array di dati) vanno in `src/lib/constants.ts`
- Animazioni con `motion` (non framer-motion direttamente)
- Classi Tailwind 4: non usare plugin JIT legacy, usare sintassi v4
- Nessun commento nel codice salvo logica non ovvia
- Componenti React funzionali + TypeScript strict

---

## Hero video scroll-scrub

Il componente `Hero.tsx` usa `VideoScrub.tsx` che fa seek del video HTML5 in base allo scroll:
```
currentTime = scrollProgress × videoDuration
```
Video: `public/hero-dedicare.mp4` (1.05 MB, H.264)
Poster fallback: `public/hero-poster.jpg` (32 KB, per LCP)

---

## Deploy

Push su `main` → GitHub Actions esegue `npm run build` → pubblica `dist/` su GitHub Pages.
Base URL in Vite: `/dedicare2/` (non modificare senza aggiornare anche `index.html`).

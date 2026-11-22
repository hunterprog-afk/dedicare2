# Dedicare Solutions — sito

Sito di Dedicare Solutions (assistenza domiciliare a Milano e hinterland), in italiano e in inglese.
È un sito statico pre-renderizzato: ogni pagina è un HTML già completo, che il browser poi «idrata».

Stack: React 19, Vite, TypeScript, Tailwind CSS v4. Il movimento usa GSAP e Lenis (scorrimento morbido solo da 1024 px con puntatore fine).

## Comandi

```bash
npm install
npm run dev               # server di sviluppo
npm test                  # test (Vitest)
npm run build             # build di produzione: tipi, bundle, pre-render e controlli sul risultato
npm run build:anteprima   # build per anteprime fuori produzione (imposta DEDICARE_ANTEPRIMA=1)
npm run images            # ottimizza le foto (AVIF + WebP) in public/img e aggiorna src/content/images.generated.json
```

Altri comandi: `npm run lint`, `npm run budgets`, `npm run icons`, `npm run grain`.

## Struttura

```
src/
  components/
    sections/   le sezioni della pagina, una per ora del giorno
    shell/      header, footer, barra contatti sul telefono
    forms/      modulo contatti e modulo candidatura
    brand/      logo
    legal/      pagine legali
  content/      contatti, ore del giorno, immagini, testi legali
  i18n/locales/ testi del sito (it.json, en.json)
  motion/       motore di scroll, orologio, scorrimento morbido
  styles/       stile globale
scripts/        pre-render, controlli sulla build, immagini, icone
public/         file serviti così come sono
```

## Testi

- Testi del sito: `src/i18n/locales/it.json` e `src/i18n/locales/en.json`. Le chiavi devono essere le stesse in entrambi.
- Testi legali: `src/content/legal.ts`.

## Moduli

I moduli usano l'endpoint indicato da `VITE_FORMS_API_BASE` (variabile del repository, usata dal workflow di pubblicazione); se è vuota si usa Formspree.
La build di produzione richiede che i testi legali corrispondano al fornitore dei moduli configurato: in caso contrario `scripts/check-dist.mjs` interrompe la build.

## Logo

Il logo attuale è provvisorio. Si sostituisce in `src/components/brand/Logo.tsx`.

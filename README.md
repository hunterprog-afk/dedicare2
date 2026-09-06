# Dedicare Solutions — Sito v2

Cinematic landing page per **Dedicare Solutions** — assistenza sanitaria professionale a Segrate (MI).

Vite + React 18 + TypeScript · Tailwind CSS v4 · Framer Motion · shadcn/ui

---

## Avvio rapido

```bash
npm install
npm run dev
```

## Sequenza video (hero scroll-scrub)

Il hero usa una **sequenza di fotogrammi JPEG** invece di un `<video>`, come le pagine Apple AirPods. Devi estrarre i frame dal tuo video sorgente.

### Requisiti

- `ffmpeg` installato localmente
- Un video sorgente (5-15 secondi ideale)

### Estrazione frame

```bash
mkdir -p input public/frames
cp /path/to/il-tuo-video.mp4 input/source.mp4

ffmpeg -i input/source.mp4 \
  -vf "fps=30,scale='min(1920,iw)':'-2':flags=lanczos" \
  -q:v 3 \
  public/frames/frame_%04d.jpg

# Conta i frame e aggiorna FRAME_COUNT in src/lib/constants.ts
ls public/frames | wc -l
```

### Conversione WebP (opzionale, -40% dimensione)

```bash
for f in public/frames/*.jpg; do
  cwebp -q 82 "$f" -o "${f%.jpg}.webp" && rm "$f"
done
# poi cambia FRAME_EXT = "webp" in src/lib/constants.ts
```

**Attenzione Vercel Hobby:** se il totale dei frame supera 20 MB, avvicini al limite da 25 MB. Usa WebP o riduci l'FPS a 24.

---

## Struttura

```
src/
  App.tsx
  main.tsx
  index.css
  components/
    ScrubSequence.tsx
    BlurText.tsx
    Navbar.tsx
    Hero.tsx
    ServicesBento.tsx
    Pourquoi.tsx
    Process.tsx
    Stats.tsx
    Testimonials.tsx
    Faq.tsx
    CtaFooter.tsx
    ui/
      button.tsx
      accordion.tsx
  lib/
    utils.ts
    constants.ts
public/
  frames/
  images/logo/
  logo.svg
```

## Moduli (candidatura/contatti)

I due moduli del sito (candidatura "Lavora con noi" e contatti nel footer) inviano tramite gli endpoint pubblici del bot aziendale `report-ore-bot` (Node su Fly.io, regione Francoforte), che inoltra via Microsoft Graph a info@dedicaresolutions.it. Il precedente fornitore terzo di modulistica è stato dismesso a settembre 2026: non ha mai aderito all'EU-U.S. Data Privacy Framework e non risultava alcun accordo ex art. 28 GDPR (DPA) agli atti.

- `POST /public/candidatura` (`multipart/form-data`, con CV in PDF) — vedi `src/hooks/useCurriculumForm.ts`
- `POST /public/contatto` (`application/json`) — vedi `src/components/ContactForm.tsx`
- Client comune, base URL ed endpoint: `src/lib/formsApi.ts`

Per sviluppo locale, punta `VITE_FORMS_API_BASE` a un'istanza locale del bot (default in produzione: `https://dedicare-report-ore-bot.fly.dev`, hardcoded in `formsApi.ts`):

```bash
cp .env.example .env
# .env → VITE_FORMS_API_BASE=http://localhost:3100
```

Non committare mai il file `.env` (solo `.env.example`).

Al posto della checkbox "Acconsento" (non dovuta per le candidature ex art. 111-bis Codice Privacy) entrambi i moduli mostrano una dichiarazione di presa visione con link alla relativa informativa:

- Candidatura → pagina statica dedicata [`public/informativa-candidati.html`](public/informativa-candidati.html), pubblicata su `/informativa-candidati.html`
- Contatti → modal Privacy Policy esistente (`LegalModal`, aperto da `CtaFooter`)

© 2025 Dedicare Solutions S.R.L.S. — P.IVA IT11600760968

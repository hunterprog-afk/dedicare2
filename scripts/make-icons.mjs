// Favicon, icone PNG e immagine social PROVVISORIE di LyzCare, in attesa del logo definitivo.
// I contorni delle lettere vengono da Big Shoulders (OFL), già tracciati in scripts/assets/lyzcare-glifi.json:
// le icone non dipendono dai font installati sulla macchina che le genera.
import { readFileSync, writeFileSync, statSync } from "node:fs"
import sharp from "sharp"

const glifi = JSON.parse(readFileSync("scripts/assets/lyzcare-glifi.json", "utf8"))
const INDACO = "#231C4D"
const NEBBIA = "#FFF4EF"
const ORO = "#FFD98A"
const r1 = (n) => Math.round(n * 10) / 10

/** «Ly» in nebbia su un quadrato indaco con angoli arrotondati (la favicon), lato `side`. */
function markSvg(side, { rounded = true } = {}) {
  const [x0, y0, x1, y1] = glifi.Ly.bounds
  const w = x1 - x0
  const h = y1 - y0
  const k = Math.min((side * 0.7) / w, (side * 0.74) / h)
  const tx = (side - w * k) / 2 - x0 * k
  const ty = (side - h * k) / 2 - y0 * k
  const rx = rounded ? side * 0.22 : 0
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" width="${side}" height="${side}">` +
    `<rect width="${side}" height="${side}" rx="${r1(rx)}" fill="${INDACO}"/>` +
    `<path transform="matrix(${r1(k * 1000) / 1000} 0 0 ${r1(k * 1000) / 1000} ${r1(tx)} ${r1(ty)})" d="${glifi.Ly.d}" fill="${NEBBIA}"/></svg>`
  )
}

/** La scritta «LyzCare» (Lyz nebbia 800, Care oro 500), alta `capPx` px di maiuscola, con il suo riquadro. */
function wordmarkSvg(capPx) {
  const k = capPx / glifi.capHeight
  const gap = 0
  const careX = glifi.Lyz.advance + gap
  const minY = Math.min(glifi.Lyz.bounds[1], glifi.Care.bounds[1])
  const maxY = Math.max(glifi.Lyz.bounds[3], glifi.Care.bounds[3])
  const W = Math.ceil((careX + glifi.Care.bounds[2]) * k) + 2
  const H = Math.ceil((maxY - minY) * k) + 2
  const ty = -minY * k + 1
  return {
    svg:
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
      `<g transform="matrix(${k} 0 0 ${k} 0 ${r1(ty)})"><path d="${glifi.Lyz.d}" fill="${NEBBIA}"/>` +
      `<path transform="translate(${careX} 0)" d="${glifi.Care.d}" fill="${ORO}"/></g></svg>`,
    width: W,
    height: H,
  }
}

writeFileSync("public/favicon.svg", markSvg(64))

const render = (svg, size) => sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer()

for (const side of [32, 180, 192, 512]) {
  // Sopra i 32 px il quadrato resta pieno: iOS e Android arrotondano da soli.
  writeFileSync(`public/favicon-${side}.png`, await render(markSvg(side, { rounded: side === 32 }), side))
}

// og-image 1200 × 630: a sinistra la finestra accesa della prima scena del film (public/film, quindi riproducibile), a destra la scritta
// LyzCare e una riga di testo in Literata su fondo indaco. Il bordo della foto sfuma nel fondo.
{
  const PHOTO_W = 640
  const scene = sharp("public/film/s1-foto.webp").resize({ height: 630 })
  const sceneW = (await scene.clone().png().toBuffer({ resolveWithObject: true })).info.width
  const photo = await scene
    .extract({ left: Math.round((sceneW - PHOTO_W) / 2), top: 0, width: PHOTO_W, height: 630 })
    .png()
    .toBuffer()
  const fade = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO_W}" height="630"><defs><linearGradient id="f" x1="0" x2="1" y1="0" y2="0"><stop offset="0.72" stop-color="${INDACO}" stop-opacity="0"/><stop offset="1" stop-color="${INDACO}" stop-opacity="1"/></linearGradient></defs><rect width="${PHOTO_W}" height="630" fill="url(#f)"/></svg>`,
  )
  const word = wordmarkSvg(92)
  const wordPng = await sharp(Buffer.from(word.svg), { density: 300 }).resize(word.width, word.height).png().toBuffer()
  const text = await sharp({
    text: {
      text: `<span foreground="${NEBBIA}">Assistenza domiciliare
a Milano</span>`,
      fontfile: "scripts/assets/Literata-opsz-wght.ttf",
      font: "Literata 40",
      width: 470,
      rgba: true,
      wrap: "word",
    },
  })
    .png()
    .toBuffer()
  const meta = await sharp(text).metadata()
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: INDACO } })
    .composite([
      { input: photo, left: 0, top: 0 },
      { input: fade, left: 0, top: 0 },
      { input: wordPng, left: 690, top: 200 },
      { input: text, left: 692, top: 200 + word.height + 36 },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 85 })
    .toFile("public/og-image.png")
  console.log(`og-image: scritta ${word.width} x ${word.height}, testo ${meta.width} x ${meta.height}`)
}

for (const f of ["favicon.svg", "favicon-32.png", "favicon-180.png", "favicon-192.png", "favicon-512.png", "og-image.png"]) {
  console.log(`${f}: ${(statSync(`public/${f}`).size / 1024).toFixed(1)} KB`)
}
for (const f of ["favicon-32.png", "favicon-180.png", "favicon-192.png", "favicon-512.png", "og-image.png"]) {
  const m = await sharp(`public/${f}`).metadata()
  console.log(`${f}: ${m.width} x ${m.height}`)
}

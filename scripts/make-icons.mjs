// Favicon, icone PNG e immagine social, tutte dal simbolo «La soglia» (geometria condivisa col logo).
import { readFileSync, writeFileSync, statSync } from "node:fs"
import sharp from "sharp"

const geo = JSON.parse(readFileSync("src/components/brand/soglia-geometria.json", "utf8"))

// Colori fermi delle 18 pareti (dal fronte al fondo): stessa legge del logo, mescolanza OKLab verso il fondo della stanza.
const MATTINO = {
  body: "#231C4D",
  top: "#FFD98A",
  bottom: "#FFF4EF",
  walls: "#312C5A #3E3A65 #49466E #565278 #625E81 #6F6B8B #7A7593 #85809B #928DA5 #9E98AD #A9A3B5 #B5AEBD #C1BAC6 #CDC5CE #D9D1D6 #E6DCDE #F2E8E7 #FFF4EF".split(" "),
}
const NOTTE = {
  body: "#FFF4EF",
  top: "#FFD98A",
  bottom: "#FFB59A",
  walls: "#FFEFE8 #FFEBE2 #FFE7DD #FFE3D8 #FFDFD3 #FFDCCE #FFD9CA #FFD5C5 #FFD2C0 #FFCEBC #FFCBB8 #FFC8B4 #FFC5AF #FFC2AB #FFBFA7 #FFBBA3 #FFB89E #FFB59A".split(" "),
}

const r1 = (n) => Math.round(n * 10) / 10

function symbolSvg(c, { size, darkVariant = false }) {
  const w = (size * 330) / 384
  const style = darkVariant ? "<style>@media (prefers-color-scheme: dark){ .b{fill:#FFF4EF} }</style>" : ""
  const walls = geo.walls.map((d, i) => `<path d="${d}" fill="${c.walls[i]}"/>`).join("")
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${geo.viewBox}" width="${r1(w)}" height="${size}">${style}` +
    `<defs><clipPath id="c"><path d="${geo.inner}"/></clipPath>` +
    `<linearGradient id="s" gradientUnits="userSpaceOnUse" x1="0" y1="${r1(geo.backY[0])}" x2="0" y2="${r1(geo.backY[1])}"><stop offset="0" stop-color="${c.top}"/><stop offset="1" stop-color="${c.bottom}"/></linearGradient>` +
    `<radialGradient id="g" gradientUnits="userSpaceOnUse" cx="${r1(geo.glow[0])}" cy="${r1(geo.glow[1])}" r="${r1(geo.glow[2])}"><stop offset="0" stop-color="#FFF4EF" stop-opacity=".9"/><stop offset="1" stop-color="#FFF4EF" stop-opacity="0"/></radialGradient>` +
    `<path id="k" d="${geo.back}"/></defs>` +
    `<path class="b" d="${geo.body}" fill-rule="evenodd" fill="${c.body}"/>` +
    `<g clip-path="url(#c)">${walls}<use href="#k" fill="url(#s)"/><use href="#k" fill="url(#g)"/></g></svg>`
  )
}

// favicon.svg: simbolo Mattino a colori fissi, con il corpo chiaro se il browser è in tema scuro.
const faviconSvg = symbolSvg(MATTINO, { size: 384, darkVariant: true })
writeFileSync("public/favicon.svg", faviconSvg)

const render = (svg, height) => sharp(Buffer.from(svg), { density: 300 }).resize({ height }).png().toBuffer()

// favicon-32: simbolo alto 28 px su 32 × 32 trasparente.
{
  const sym = await render(symbolSvg(MATTINO, { size: 384 }), 28)
  await sharp({ create: { width: 32, height: 32, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: sym, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile("public/favicon-32.png")
}
// favicon-180/192/512: fondo pieno nebbia, simbolo alto 70% del lato.
for (const side of [180, 192, 512]) {
  const sym = await render(symbolSvg(MATTINO, { size: 384 }), Math.round(side * 0.7))
  await sharp({ create: { width: side, height: side, channels: 4, background: "#FFF4EF" } })
    .composite([{ input: sym, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile(`public/favicon-${side}.png`)
}

// og-image 1200 × 630: a sinistra la foto della finestra accesa (da public/img, quindi riproducibile), a destra il simbolo Notte
// e una riga di testo in Literata su fondo indaco. Il bordo della foto sfuma nel fondo.
{
  const PHOTO_W = 640
  const photo = await sharp("public/img/notte-finestra-orizz-1536.webp")
    .resize({ height: 630 })
    .extract({ left: 0, top: 0, width: PHOTO_W, height: 630 })
    .png()
    .toBuffer()
  const fade = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO_W}" height="630"><defs><linearGradient id="f" x1="0" x2="1" y1="0" y2="0"><stop offset="0.72" stop-color="#231C4D" stop-opacity="0"/><stop offset="1" stop-color="#231C4D" stop-opacity="1"/></linearGradient></defs><rect width="${PHOTO_W}" height="630" fill="url(#f)"/></svg>`,
  )
  const sym = await render(symbolSvg(NOTTE, { size: 384 }), 200)
  const text = await sharp({
    text: {
      text: '<span foreground="#FFF4EF">Dedicare · Assistenza domiciliare a Milano</span>',
      fontfile: "scripts/assets/Literata-opsz-wght.ttf",
      font: "Literata 46",
      width: 470,
      rgba: true,
      wrap: "word",
    },
  })
    .png()
    .toBuffer()
  const meta = await sharp(text).metadata()
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#231C4D" } })
    .composite([
      { input: photo, left: 0, top: 0 },
      { input: fade, left: 0, top: 0 },
      { input: sym, left: 690, top: 120 },
      { input: text, left: 690, top: 360 },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 85 })
    .toFile("public/og-image.png")
  console.log(`og-image: testo ${meta.width} x ${meta.height}`)
}

for (const f of ["favicon.svg", "favicon-32.png", "favicon-180.png", "favicon-192.png", "favicon-512.png", "og-image.png"]) {
  console.log(`${f}: ${(statSync(`public/${f}`).size / 1024).toFixed(1)} KB`)
}
for (const f of ["favicon-32.png", "favicon-180.png", "favicon-192.png", "favicon-512.png", "og-image.png"]) {
  const m = await sharp(`public/${f}`).metadata()
  console.log(`${f}: ${m.width} x ${m.height}`)
}

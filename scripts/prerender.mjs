// Pre-render: scrive un HTML per ogni rotta partendo da dist/index.html e dal bundle server.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const { render } = await import(pathToFileURL(resolve("dist-ssr/entry-server.js")).href)
const template = readFileSync("dist/index.html", "utf8")

const ROUTES = [
  { path: "/", file: "index.html" },
  { path: "/en/", file: "en/index.html" },
  { path: "/privacy/", file: "privacy/index.html" },
  { path: "/cookie/", file: "cookie/index.html" },
  { path: "/note-legali/", file: "note-legali/index.html" },
]

// Chunk che l'entry-client scarica prima di idratare (testi della lingua, pagine legali): si precaricano dall'HTML,
// così partono insieme allo script d'ingresso invece che dopo.
const assets = readdirSync("dist/assets")
const chunk = (prefix) => {
  const f = assets.find((a) => a.startsWith(`${prefix}-`) && a.endsWith(".js"))
  if (!f) {
    console.error(`prerender: manca il chunk ${prefix}-*.js in dist/assets`)
    process.exit(1)
  }
  return `<link rel="modulepreload" href="/assets/${f}">`
}

const preloads = (path, lang) => [chunk(lang), ...(/^\/(privacy|cookie|note-legali)\//.test(path) ? [chunk("LegalPage")] : [])]

const HTML_TAG = '<html lang="it" data-phase="dark" data-dphase="notte">'
if (!template.includes(HTML_TAG)) {
  console.error("prerender: il tag <html> del template non è quello atteso")
  process.exit(1)
}

for (const r of ROUTES) {
  const { html, head, lang, phase } = render(r.path)
  const out = template
    .replace(HTML_TAG, `<html lang="${lang}" data-phase="${phase}" data-dphase="${phase === "dark" ? "notte" : "mattino"}">`)
    .replace("<!--app-head-->", () => [head, ...preloads(r.path, lang)].join("\n    "))
    .replace("<!--app-html-->", () => html)
  if (!out.includes("<h1") || out.includes("<!--app-")) {
    console.error(`prerender: ${r.file} senza <h1 o con segnaposto residui`)
    process.exit(1)
  }
  const target = resolve("dist", r.file)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, out)
  console.log(`prerender: ${r.file} (${(out.length / 1024).toFixed(1)} KB)`)
}

const today = new Date().toISOString().slice(0, 10)
const BASE = "https://dedicaresolutions.it"
const alt = `
    <xhtml:link rel="alternate" hreflang="it" href="${BASE}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/"/>`
const urls = [
  `  <url><loc>${BASE}/</loc><lastmod>${today}</lastmod>${alt}</url>`,
  `  <url><loc>${BASE}/en/</loc><lastmod>${today}</lastmod>${alt}</url>`,
  `  <url><loc>${BASE}/privacy/</loc><lastmod>${today}</lastmod></url>`,
  `  <url><loc>${BASE}/cookie/</loc><lastmod>${today}</lastmod></url>`,
  `  <url><loc>${BASE}/note-legali/</loc><lastmod>${today}</lastmod></url>`,
  `  <url><loc>${BASE}/informativa-candidati.html</loc><lastmod>${today}</lastmod></url>`,
]
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`,
)

rmSync("dist-ssr", { recursive: true, force: true })
console.log("prerender: sitemap.xml scritta, dist-ssr rimossa")

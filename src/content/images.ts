// Le 15 fotografie. `fase` sceglie il gradiente del segnaposto finché la foto non c'è.

export type PhotoPhase = "night" | "dawn" | "day" | "dusk"

export interface PhotoDef {
  name: string
  w: number
  h: number
  fase: PhotoPhase
  /** Chiave in `img.*` dei testi (le varianti verticali condividono l'alt). */
  altKey: string
  sizes: string
}

const H = (name: string, fase: PhotoPhase, altKey: string, sizes: string): PhotoDef => ({ name, w: 1536, h: 1024, fase, altKey, sizes })
const V = (name: string, fase: PhotoPhase, altKey: string, sizes: string): PhotoDef => ({ name, w: 1024, h: 1536, fase, altKey, sizes })

export const PHOTOS: readonly PhotoDef[] = [
  H("notte-finestra-orizz", "night", "notte-finestra", "100vw"),
  V("notte-finestra-vert", "night", "notte-finestra", "100vw"),
  H("notte-lampada", "night", "notte-lampada", "(min-width:1024px) 840px, 100vw"),
  H("notte-cucina", "night", "notte-cucina", "(min-width:1024px) 840px, 100vw"),
  H("alba-naviglio", "dawn", "alba-naviglio", "100vw"),
  V("alba-naviglio-vert", "dawn", "alba-naviglio", "100vw"),
  H("alba-persiane", "dawn", "alba-persiane", "(min-width:1024px) 606px, 100vw"),
  H("mattino-tazza", "day", "mattino-tazza", "(min-width:1024px) 426px, 100vw"),
  H("mattino-accompagnamento", "day", "mattino-accompagnamento", "(min-width:1024px) 62vw, 100vw"),
  H("giorno-piano", "day", "giorno-piano", "(min-width:1024px) 696px, 100vw"),
  H("giorno-gioco", "day", "giorno-gioco", "(min-width:1024px) 62vw, 100vw"),
  H("sera-balcone", "dusk", "sera-balcone", "100vw"),
  V("sera-balcone-vert", "dusk", "sera-balcone", "100vw"),
  V("ingresso-turno", "night", "ingresso-turno", "(min-width:1024px) 426px, 100vw"),
  H("sera-tram", "night", "sera-tram", "(min-width:1024px) 426px, 100vw"),
]

export const PLACEHOLDER_BG: Record<PhotoPhase, string> = {
  night: "linear-gradient(180deg,#17123A,#231C4D)",
  dawn: "linear-gradient(180deg,#5A5482,#A99BF0 50%,#FFB59A)",
  day: "linear-gradient(180deg,#FFF4EF,#FFD98A)",
  dusk: "linear-gradient(180deg,#FFB59A,#A99BF0)",
}

export function getPhoto(name: string): PhotoDef {
  const p = PHOTOS.find((x) => x.name === name)
  if (!p) throw new Error(`Foto sconosciuta: ${name}`)
  return p
}

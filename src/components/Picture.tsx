import { useTranslation } from "react-i18next"
import generated from "@/content/images.generated.json"
import { PLACEHOLDER_BG, getPhoto } from "@/content/images"
import { cn } from "@/lib/cn"

type Manifest = Record<string, { w: number; h: number; widths: number[] }>
const manifest = generated as Manifest

interface PictureProps {
  name: string
  /** Variante verticale per lo schermo stretto (< 640 px), stessa foto ritagliata in 2:3. */
  mobileName?: string
  sizes: string
  /** Solo la foto dell'hero: caricamento immediato e priorità alta. */
  priority?: boolean
  className?: string
  imgClassName?: string
  objectPosition?: string
  /** «Si accende la luce»: aggiunge il velo e il suo tono (notte 0,30 / giorno 0,55). */
  light?: "night" | "day"
  /** Senza angoli arrotondati (foto a tutto schermo). */
  flat?: boolean
}

function srcSet(name: string, widths: number[], ext: "avif" | "webp") {
  return widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(", ")
}

/** `<picture>` AVIF + WebP se la foto è nel manifest; altrimenti un segnaposto dello stesso box. */
export function Picture({ name, mobileName, sizes, priority, className, imgClassName, objectPosition, light, flat }: PictureProps) {
  const { t } = useTranslation()
  const photo = getPhoto(name)
  const alt = t(`img.${photo.altKey}`)
  const entry = manifest[name]
  const mobile = mobileName ? manifest[mobileName] : undefined
  const style = { aspectRatio: `${photo.w} / ${photo.h}` } as const
  const pos = objectPosition ? { objectPosition } : undefined

  return (
    <div className={cn("pic", flat && "pic-flat", className)} style={style} data-light={light}>
      {entry ? (
        <picture>
          {mobile && mobileName && (
            <>
              <source media="(max-width: 639px)" type="image/avif" srcSet={srcSet(mobileName, mobile.widths, "avif")} sizes={sizes} />
              <source media="(max-width: 639px)" type="image/webp" srcSet={srcSet(mobileName, mobile.widths, "webp")} sizes={sizes} />
            </>
          )}
          <source type="image/avif" srcSet={srcSet(name, entry.widths, "avif")} sizes={sizes} />
          <source type="image/webp" srcSet={srcSet(name, entry.widths, "webp")} sizes={sizes} />
          <img
            className={imgClassName}
            style={pos}
            src={`/img/${name}-${Math.max(...entry.widths)}.webp`}
            width={entry.w}
            height={entry.h}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : undefined}
          />
        </picture>
      ) : (
        <div
          className={cn("pic-skeleton", imgClassName)}
          role="img"
          aria-label={alt}
          style={{ background: PLACEHOLDER_BG[photo.fase], ...pos }}
        />
      )}
      {light && <div className="veil" data-light-veil aria-hidden="true" />}
    </div>
  )
}

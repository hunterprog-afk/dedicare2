import type { ImgHTMLAttributes } from "react"

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  /**
   * Path to the image WITHOUT extension, relative to the public folder
   * (e.g. "images/logo/nobg_logo-chiaro"). The component renders a
   * <picture> with a WebP <source> and a PNG <img> fallback.
   * BASE_URL is prepended automatically.
   */
  src: string
  alt: string
}

export function OptimizedImage({ src, alt, ...imgProps }: Props) {
  const base = import.meta.env.BASE_URL
  const webp = `${base}${src}.webp`
  const png = `${base}${src}.png`

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img src={png} alt={alt} decoding="async" {...imgProps} />
    </picture>
  )
}

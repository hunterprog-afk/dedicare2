type Props = {
  src: string
  className?: string
  poster?: string
}

export function VideoScrub({ src, className, poster }: Props) {
  return (
    <video
      className={className}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      style={{ objectFit: "cover", transform: "translateZ(0)", willChange: "transform" }}
    />
  )
}

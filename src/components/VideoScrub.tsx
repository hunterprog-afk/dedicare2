import { useRef, useEffect } from "react"
import { useScroll, useMotionValueEvent } from "motion/react"

type Props = {
  src: string
  className?: string
  poster?: string
  containerRef: React.RefObject<HTMLElement | null>
}

export function VideoScrub({ src, className, poster, containerRef }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Preload video so duration is available immediately
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.load()
  }, [src])

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const video = videoRef.current
    if (!video || !video.duration) return
    video.currentTime = progress * video.duration
  })

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      style={{ objectFit: "cover", transform: "translateZ(0)", willChange: "transform" }}
    />
  )
}

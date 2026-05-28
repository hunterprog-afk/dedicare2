import { useRef, useEffect, useState } from "react"
import { useScroll, useMotionValueEvent } from "motion/react"

type Props = {
  src: string
  className?: string
  poster?: string
  containerRef: React.RefObject<HTMLElement | null>
}

export function VideoScrub({ src, className, poster, containerRef }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isReady, setIsReady] = useState(false)

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

  // Mark ready as soon as metadata (duration) is available — much faster than loadeddata
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handleReady = () => setIsReady(true)
    // readyState >= 1 = HAVE_METADATA (duration known, scrub can start)
    if (video.readyState >= 1 && video.duration) {
      setIsReady(true)
      return
    }
    video.addEventListener("loadedmetadata", handleReady)
    return () => video.removeEventListener("loadedmetadata", handleReady)
  }, [src])

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const video = videoRef.current
    if (!video || !video.duration) return
    video.currentTime = progress * video.duration
  })

  return (
    <>
      <video
        ref={videoRef}
        className={className}
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        style={{ objectFit: "cover", transform: "translateZ(0)", willChange: "transform" }}
      />
      <div
        aria-hidden="true"
        className={`video-shimmer absolute inset-0 z-[5] pointer-events-none transition-opacity duration-700 ${
          isReady ? "opacity-0" : "opacity-100"
        }`}
      />
    </>
  )
}

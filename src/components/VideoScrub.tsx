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

  // Listen for loadeddata to mark ready
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handleReady = () => setIsReady(true)
    if (video.readyState >= 2) {
      setIsReady(true)
      return
    }
    video.addEventListener("loadeddata", handleReady)
    return () => video.removeEventListener("loadeddata", handleReady)
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

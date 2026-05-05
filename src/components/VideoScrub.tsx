import { useEffect, useRef } from "react"

type Props = {
  src: string
  scrollTargetRef: React.RefObject<HTMLElement | null>
  className?: string
  poster?: string
}

export function VideoScrub({ src, scrollTargetRef, className, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef   = useRef<number | null>(null)
  const prefersReduced = useRef(
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )

  // Preload the video without playing
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.preload = "auto"
    video.load()
  }, [src])

  // RAF loop: scrub currentTime based on scroll progress
  useEffect(() => {
    if (prefersReduced.current) return

    const tick = () => {
      const video = videoRef.current
      const el    = scrollTargetRef.current
      if (video && el && video.duration) {
        const rect     = el.getBoundingClientRect()
        const total    = el.offsetHeight - window.innerHeight
        const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0
        const target   = progress * video.duration
        if (Math.abs(video.currentTime - target) > 0.04) {
          video.currentTime = target
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [scrollTargetRef])

  // For prefers-reduced-motion: show poster / first frame only
  useEffect(() => {
    if (!prefersReduced.current) return
    const video = videoRef.current
    if (video) video.currentTime = 0.5
  }, [])

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
      style={{ objectFit: "cover", transform: "translateZ(0)", willChange: "contents" }}
    />
  )
}

import { motion, useInView } from "motion/react"
import { useRef } from "react"

type Props = {
  text: string
  className?: string
  delay?: number
  startDelay?: number
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div"
  immediate?: boolean
}

export function BlurText({
  text,
  className = "",
  delay = 0.07,
  startDelay = 0,
  as: Tag = "h2",
  immediate = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, {
    once: true,
    amount: 0.15,
    margin: "0px 0px -10% 0px",
  })
  const shouldAnimate = immediate || inView
  const words = text.split(" ")

  return (
    <Tag ref={ref as never} className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block will-change-[filter,transform,opacity]"
          initial={{ filter: "blur(10px)", opacity: 0, y: 24 }}
          animate={shouldAnimate ? { filter: "blur(0px)", opacity: 1, y: 0 } : undefined}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
            delay: startDelay + i * delay,
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  )
}

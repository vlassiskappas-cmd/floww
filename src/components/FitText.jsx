import { useLayoutEffect, useRef } from 'react'

const MEASURE_FONT_SIZE = 100

export default function FitText({ text, className }) {
  const containerRef = useRef(null)
  const textRef = useRef(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    const el = textRef.current
    if (!container || !el) return

    const fit = () => {
      const availableWidth = container.clientWidth
      el.style.fontSize = `${MEASURE_FONT_SIZE}px`
      const naturalWidth = el.scrollWidth
      if (naturalWidth > 0 && availableWidth > 0) {
        el.style.fontSize = `${(availableWidth / naturalWidth) * MEASURE_FONT_SIZE}px`
      }
    }

    fit()
    const resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(container)

    let cancelled = false
    document.fonts?.ready?.then(() => {
      if (!cancelled) fit()
    })

    return () => {
      cancelled = true
      resizeObserver.disconnect()
    }
  }, [text])

  return (
    <span ref={containerRef} className="fit-text">
      <span ref={textRef} className={className}>
        {text}
      </span>
    </span>
  )
}

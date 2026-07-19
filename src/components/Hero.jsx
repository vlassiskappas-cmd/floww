import { useLayoutEffect, useRef, useState } from 'react'
import FitText from './FitText.jsx'

// Matches the line-height set on .hero__title--cutout in index.css. The
// browser lays out (and centers, and clips) each line using this box, so
// the height budget must be based on it, not the tighter glyph-ink extent.
const LINE_HEIGHT = 0.88
const LINE_COUNT = 2

export default function Hero() {
  const [titleFontSize, setTitleFontSize] = useState(null)
  const [maxFontSize, setMaxFontSize] = useState(null)
  const heroFullRef = useRef(null)

  useLayoutEffect(() => {
    const el = heroFullRef.current
    if (!el) return

    const measure = () => {
      const styles = getComputedStyle(el)
      const paddingTop = parseFloat(styles.paddingTop) || 0
      const paddingBottom = parseFloat(styles.paddingBottom) || 0
      const availableHeight = el.clientHeight - paddingTop - paddingBottom
      setMaxFontSize(availableHeight / (LINE_COUNT * LINE_HEIGHT))
    }

    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <>
      <section className="hero hero--full" ref={heroFullRef}>
        <h1 className="hero__title hero__title--cutout hero__title--wide">
          <FitText
            text="Startup"
            className="hero__cutout-line"
            onFit={setTitleFontSize}
            maxFontSize={maxFontSize}
          />
          <span className="fit-text">
            <span
              className="hero__cutout-line"
              style={titleFontSize ? { fontSize: titleFontSize } : undefined}
            >
              Flow
            </span>
          </span>
        </h1>

        <a
          href="#hero-intro"
          className="scroll-indicator"
          aria-label="Scroll down"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4v14m0 0-5-5m5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </section>

      <section className="hero-intro" id="hero-intro">
        <div className="hero__inner">
          <p className="eyebrow">— Startup studio</p>

          <p className="hero__subtitle">
            StartupFlow is the startup-focused division of Frame Creative
            Group — identity, launch websites and pitch collateral, built by
            a senior team that ships fast.
          </p>

          <div className="hero__actions">
            <a href="/contact" className="btn btn--pill">
              Start a project <span className="btn__dot" aria-hidden="true" />
            </a>
            <a href="/services" className="btn btn--ghost">
              See what we do →
            </a>
          </div>
        </div>

        <div className="hero__ticker" aria-hidden="true">
          <p>
            Brand identity · Naming &amp; strategy · Launch websites · Pitch
            &amp; collateral · Brand identity · Naming &amp; strategy · Launch
            websites · Pitch &amp; collateral ·
          </p>
        </div>
      </section>
    </>
  )
}

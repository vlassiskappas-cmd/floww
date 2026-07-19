import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import FitText from './FitText.jsx'

// Matches the line-height set on .hero__title--cutout in index.css. The
// browser lays out (and centers, and clips) each line using this box, so
// the height budget must be based on it, not the tighter glyph-ink extent.
const LINE_HEIGHT = 0.88
const LINE_COUNT = 2

// How much extra scroll distance (in viewport heights) drives the pinned
// zoom before normal scrolling resumes.
const ZOOM_SCROLL_VH = 120
// Final scale reached at the end of the zoom. Only the letter shapes (the
// "hole" in the black layer) need to grow enough to push their own outer
// edge past the viewport — the pattern behind them no longer stretches
// (see the background-size/-position compensation below), so this can be
// a fairly modest scale rather than an extreme one.
const MAX_ZOOM_SCALE = 100
// Horizontally centered, always.
const ORIGIN_X_FRACTION = 0.5

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Hero() {
  const [titleFontSize, setTitleFontSize] = useState(null)
  const [maxFontSize, setMaxFontSize] = useState(null)
  const [reduceMotion] = useState(prefersReducedMotion)
  const [zoom, setZoom] = useState({ scale: 1, mode: 'fixed' })
  // Vertical zoom origin, as a fraction of the hero section's own height.
  // Derived from the actual rendered position of the "Startup" line (its
  // vertical center, which sits inside the "R") rather than a fixed
  // constant, because how much empty space surrounds the text vertically
  // varies a lot by aspect ratio — FitText sizes the word to fill the
  // available width, so on a tall/narrow viewport the text ends up far
  // smaller (and the fixed fraction would land outside the letters
  // entirely) than on a wide one.
  const [originYFraction, setOriginYFraction] = useState(0.34)
  const heroFullRef = useRef(null)
  const zoomStageRef = useRef(null)
  const heroHeightRef = useRef(0)

  useLayoutEffect(() => {
    const el = heroFullRef.current
    if (!el) return

    const measure = () => {
      const styles = getComputedStyle(el)
      const paddingTop = parseFloat(styles.paddingTop) || 0
      const paddingBottom = parseFloat(styles.paddingBottom) || 0
      const availableHeight = el.clientHeight - paddingTop - paddingBottom
      setMaxFontSize(availableHeight / (LINE_COUNT * LINE_HEIGHT))
      heroHeightRef.current = el.offsetHeight
    }

    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [])

  // Re-derive the origin's vertical fraction whenever the "Startup" line's
  // size settles (initial fit, a resize, or a height-budget-driven re-fit).
  useLayoutEffect(() => {
    const el = heroFullRef.current
    const line = el?.querySelector('.hero__cutout-line')
    if (!el || !line) return

    const heroRect = el.getBoundingClientRect()
    const lineRect = line.getBoundingClientRect()
    if (heroRect.height <= 0) return
    const fraction =
      (lineRect.top + lineRect.height / 2 - heroRect.top) / heroRect.height
    setOriginYFraction(Math.min(1, Math.max(0, fraction)))
  }, [titleFontSize])

  // Keeps the background pattern visually stationary (a fixed backdrop)
  // while the transform scales the letter shapes around it: the tile size
  // is divided by the current scale (so it paints back out at its normal
  // size once the transform blows it up), and each line's background is
  // repositioned so the same origin point stays anchored, both in its own
  // local coordinates and relative to the shared zoom origin.
  useEffect(() => {
    const heroEl = heroFullRef.current
    if (!heroEl) return
    const lines = heroEl.querySelectorAll('.hero__cutout-line')

    if (zoom.scale === 1) {
      lines.forEach((line) => {
        line.style.animation = ''
        line.style.removeProperty('--bg-pos-x')
        line.style.removeProperty('--bg-pos-y')
      })
      return
    }

    const heroRect = heroEl.getBoundingClientRect()
    const originXpx = heroEl.offsetWidth * ORIGIN_X_FRACTION
    const originYpx = heroEl.offsetHeight * originYFraction

    lines.forEach((line) => {
      const lineRect = line.getBoundingClientRect()
      const localOffsetX = (lineRect.left - heroRect.left) / zoom.scale
      const localOffsetY = (lineRect.top - heroRect.top) / zoom.scale
      line.style.animation = 'none'
      line.style.setProperty('--bg-pos-x', `${originXpx - localOffsetX}px`)
      line.style.setProperty('--bg-pos-y', `${originYpx - localOffsetY}px`)
    })
  }, [zoom.scale, originYFraction])

  useEffect(() => {
    if (reduceMotion) return
    const stage = zoomStageRef.current
    if (!stage) return

    let ticking = false

    const update = () => {
      ticking = false
      const headerH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--header-h',
          ),
        ) || 0
      const heroHeight = heroHeightRef.current
      const rect = stage.getBoundingClientRect()
      const scrollableDistance = stage.offsetHeight - heroHeight
      if (scrollableDistance <= 0) return

      // Sub-pixel rounding between the CSS `top: var(--header-h)` value and
      // the rendered rect means rawGap is never quite exactly 0 at rest, so
      // treat anything within a pixel of true rest as unscrolled — otherwise
      // zoom.scale never lands on exactly 1 and the idle marquee never runs.
      const rawGap = headerH - rect.top
      const progress =
        rawGap <= 1 ? 0 : Math.min(1, Math.max(0, rawGap / scrollableDistance))
      const scale = 1 + progress * (MAX_ZOOM_SCALE - 1)
      const mode =
        rect.top <= headerH - scrollableDistance ? 'absolute' : 'fixed'
      setZoom({ scale, mode })
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [reduceMotion])

  const heroStyle = reduceMotion
    ? undefined
    : {
        transform: zoom.scale !== 1 ? `scale(${zoom.scale})` : undefined,
        transformOrigin: `${ORIGIN_X_FRACTION * 100}% ${originYFraction * 100}%`,
        '--zoom-scale': zoom.scale,
        ...(zoom.mode === 'fixed'
          ? { position: 'fixed', top: 'var(--header-h)', left: 0, right: 0 }
          : { position: 'absolute', bottom: 0, left: 0, right: 0 }),
      }

  return (
    <>
      <div
        className="hero-zoom-stage"
        ref={zoomStageRef}
        style={
          reduceMotion
            ? undefined
            : {
                height: `calc(${ZOOM_SCROLL_VH}vh + 100dvh - var(--header-h))`,
              }
        }
      >
        <section
          className="hero hero--full"
          ref={heroFullRef}
          style={heroStyle}
        >
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
      </div>

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

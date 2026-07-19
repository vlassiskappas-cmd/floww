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
// Final scale reached at the end of the zoom, giving the visual sense of
// diving into the "R". How close this actually lands to pure lime varies
// by viewport (font metrics differ at every size), so the reveal overlay
// below is what guarantees a clean end state, not this number.
const MAX_ZOOM_SCALE = 18
// Roughly the position of the "R" in "STARTUP", as a percentage of the
// hero section's own box — used as the scale transform's fixed origin.
const ZOOM_ORIGIN = '46% 34%'
// The zoom's crossfade reveal: a plain, unscaled copy of the pattern fades
// in over this stretch of progress, so that regardless of exactly where
// the geometric zoom lands, the scroll always ends on a clean, readable
// "lime background with the pattern" rather than an extreme close-up.
const REVEAL_START = 0.55

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Hero() {
  const [titleFontSize, setTitleFontSize] = useState(null)
  const [maxFontSize, setMaxFontSize] = useState(null)
  const [reduceMotion] = useState(prefersReducedMotion)
  const [zoom, setZoom] = useState({ scale: 1, mode: 'fixed', reveal: 0 })
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

      const progress = Math.min(
        1,
        Math.max(0, (headerH - rect.top) / scrollableDistance),
      )
      const scale = 1 + progress * (MAX_ZOOM_SCALE - 1)
      const reveal = Math.min(
        1,
        Math.max(0, (progress - REVEAL_START) / (1 - REVEAL_START)),
      )
      const mode =
        rect.top <= headerH - scrollableDistance ? 'absolute' : 'fixed'
      setZoom({ scale, mode, reveal })
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

  const positionStyle =
    zoom.mode === 'fixed'
      ? { position: 'fixed', top: 'var(--header-h)', left: 0, right: 0 }
      : { position: 'absolute', bottom: 0, left: 0, right: 0 }

  const heroStyle = reduceMotion
    ? undefined
    : {
        transform: zoom.scale !== 1 ? `scale(${zoom.scale})` : undefined,
        transformOrigin: ZOOM_ORIGIN,
        ...positionStyle,
      }

  const revealStyle = reduceMotion
    ? undefined
    : {
        opacity: zoom.reveal,
        pointerEvents: 'none',
        ...positionStyle,
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

        {!reduceMotion && (
          <div
            className="hero-zoom-reveal"
            aria-hidden="true"
            style={revealStyle}
          />
        )}
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

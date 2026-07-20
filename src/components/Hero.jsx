import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Matches the line-height budget the mask text is laid out against below.
const LINE_HEIGHT = 0.88
const LINE_COUNT = 2
const LINE1_TEXT = 'STARTUP'
const LINE2_TEXT = 'FLOW'
// Reference size used to measure each line's natural width before scaling
// it to fit — arbitrary, cancels out in the ratio.
const MEASURE_FONT_SIZE = 100
// Fraction of a line's box height at which to place the SVG text baseline,
// tuned empirically (SVG text is positioned by baseline, not a centered
// box) so the glyphs land where the old flexbox-centered text used to.
const BASELINE_FRACTION = 0.72

// How much extra scroll distance (in viewport heights) drives the pinned
// zoom before normal scrolling resumes.
const ZOOM_SCROLL_VH = 120
// Ceiling for how far the mask's own text geometry is ever grown. SVG text
// rendering at extreme font-sizes is unreliable in Chromium — well past
// this the glyph outlines start rasterizing incorrectly (the "hole"
// visibly shrinks back down, or the whole frame goes solid, as size keeps
// increasing), independent of whether the size comes from a `font-size`
// this large or from a CSS `transform: scale()` on a masked element at an
// equivalent effective size. This value is comfortably inside the range
// verified artifact-free.
const SAFE_MASK_SCALE = 20
// Fraction of the scroll-driven progress spent growing the mask up to
// SAFE_MASK_SCALE. The remainder fades the frame's opacity to 0 instead of
// growing the mask further, so the pinned zoom still ends on a clean, fully
// transparent frame (pure pattern, no residual black) without ever pushing
// the mask past its safe range.
const MASK_GROWTH_PROGRESS = 0.6
// Horizontally centered, always — and, since both lines are already
// anchored at the frame's horizontal center, scaling around that same x
// never moves them, only their font-size grows.

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Finds the vertical center (in the mask's local coordinate space) of the
// tallest run of actual inked pixels beneath the line's horizontal center,
// by rasterizing the line to a throwaway canvas with the same font, size
// and baseline. Returns null if nothing measurable was drawn.
function findInkCenterY(width, fontSize, baselineY, blockTop, lineBoxHeight, textEl) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.ceil(lineBoxHeight))
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const computed = getComputedStyle(textEl)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = `${computed.fontWeight} ${fontSize}px ${computed.fontFamily}`
  ctx.textAlign = 'center'
  ctx.fillStyle = '#000'
  ctx.fillText(textEl.textContent, width / 2, baselineY - blockTop)

  const x = Math.min(canvas.width - 1, Math.max(0, Math.round(width / 2)))
  const { data } = ctx.getImageData(x, 0, 1, canvas.height)

  let bestRun = null
  let current = null
  for (let y = 0; y < canvas.height; y++) {
    const isInk = data[y * 4] < 128
    if (isInk) {
      current = current ?? { start: y, end: y }
      current.end = y
    } else if (current) {
      if (!bestRun || current.end - current.start > bestRun.end - bestRun.start) {
        bestRun = current
      }
      current = null
    }
  }
  if (current && (!bestRun || current.end - current.start > bestRun.end - bestRun.start)) {
    bestRun = current
  }
  if (!bestRun) return null

  return blockTop + (bestRun.start + bestRun.end) / 2
}

export default function Hero() {
  const [reduceMotion] = useState(prefersReducedMotion)
  const [mode, setMode] = useState('fixed')

  const heroFrameRef = useRef(null)
  const zoomStageRef = useRef(null)
  const maskRef = useRef(null)
  const maskRectRef = useRef(null)
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)
  const heroHeightRef = useRef(0)

  // Base (scale = 1) mask geometry, captured by the layout effect below and
  // read every scroll frame to grow the hole around a fixed origin. Kept as
  // refs rather than state since they're read imperatively, not rendered.
  const baseFontSizeRef = useRef(0)
  const baseLine1YRef = useRef(0)
  const baseLine2YRef = useRef(0)
  const originYRef = useRef(0)

  // Lay out the mask: size it to the frame's own box, fit "STARTUP" to
  // fill the available width (capped by a height budget for two lines),
  // apply that size to "FLOW" too, and position both lines' baselines so
  // the pair reads as vertically centered the way the old flex layout did.
  //
  // The zoom itself is driven by directly growing this mask geometry
  // (font-size and y position) around a fixed origin on every scroll
  // frame, rather than by putting a CSS `transform: scale()` on the
  // masked element — Chromium's mask+transform compositing breaks down at
  // the scale factors this effect needs (it starts rendering the frame as
  // solid black, hiding the pattern, well before reaching a useful zoom
  // level). Scaling the geometry that defines the hole sidesteps that,
  // and is also cheaper: most scroll frames now only write a couple of
  // SVG attributes, no CSS transform recalculation or React re-render.
  useLayoutEffect(() => {
    const el = heroFrameRef.current
    const mask = maskRef.current
    const rectEl = maskRectRef.current
    const line1 = line1Ref.current
    const line2 = line2Ref.current
    if (!el || !mask || !rectEl || !line1 || !line2) return

    const recompute = () => {
      const styles = getComputedStyle(el)
      const paddingTop = parseFloat(styles.paddingTop) || 0
      const paddingBottom = parseFloat(styles.paddingBottom) || 0
      const width = el.clientWidth
      const height = el.clientHeight
      heroHeightRef.current = el.offsetHeight
      if (width <= 0 || height <= 0) return

      mask.setAttribute('width', width)
      mask.setAttribute('height', height)
      rectEl.setAttribute('width', width)
      rectEl.setAttribute('height', height)

      const availableHeight = height - paddingTop - paddingBottom
      const maxFontSize = availableHeight / (LINE_COUNT * LINE_HEIGHT)

      line1.setAttribute('font-size', MEASURE_FONT_SIZE)
      const naturalWidth = line1.getComputedTextLength()
      if (naturalWidth <= 0) return
      const fontSize = Math.min(
        (width / naturalWidth) * MEASURE_FONT_SIZE,
        maxFontSize,
      )

      line1.setAttribute('font-size', fontSize)
      line2.setAttribute('font-size', fontSize)
      line1.setAttribute('x', width / 2)
      line2.setAttribute('x', width / 2)

      const lineBoxHeight = fontSize * LINE_HEIGHT
      const blockTop =
        paddingTop + (availableHeight - lineBoxHeight * LINE_COUNT) / 2
      const line1Y = blockTop + lineBoxHeight * BASELINE_FRACTION
      const line2Y = blockTop + lineBoxHeight + lineBoxHeight * BASELINE_FRACTION
      line1.setAttribute('y', line1Y)
      line2.setAttribute('y', line2Y)

      baseFontSizeRef.current = fontSize
      baseLine1YRef.current = line1Y
      baseLine2YRef.current = line2Y
      // Vertical zoom origin: must land solidly inside a letter's actual
      // ink, at the frame's horizontal center — any offset from real ink
      // gets amplified by up to SAFE_MASK_SCALE on screen, so even a small
      // miss pivots the zoom outside every letter entirely. SVG's own
      // getBBox()/getExtentOfChar() return font-metrics boxes (ascent to
      // descent), not tight ink bounds, so they can't answer this —
      // instead rasterize "STARTUP" to a throwaway canvas with the exact
      // same font/size/baseline and read back real pixels to find where
      // the center column is actually inked.
      originYRef.current =
        findInkCenterY(width, fontSize, line1Y, blockTop, lineBoxHeight, line1) ??
        blockTop + lineBoxHeight / 2
    }

    recompute()
    const resizeObserver = new ResizeObserver(recompute)
    resizeObserver.observe(el)
    let cancelled = false
    document.fonts?.ready?.then(() => {
      if (!cancelled) recompute()
    })
    return () => {
      cancelled = true
      resizeObserver.disconnect()
    }
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

      // Sub-pixel rounding between the CSS `top: var(--header-h)` value
      // and the rendered rect means rawGap is never quite exactly 0 at
      // rest, so treat anything within a pixel of true rest as
      // unscrolled — otherwise scale never lands on exactly 1.
      const rawGap = headerH - rect.top
      const progress =
        rawGap <= 1
          ? 0
          : Math.min(1, Math.max(0, rawGap / scrollableDistance))
      const scale =
        progress <= MASK_GROWTH_PROGRESS
          ? 1 + (progress / MASK_GROWTH_PROGRESS) * (SAFE_MASK_SCALE - 1)
          : SAFE_MASK_SCALE
      const opacity =
        progress <= MASK_GROWTH_PROGRESS
          ? 1
          : 1 - (progress - MASK_GROWTH_PROGRESS) / (1 - MASK_GROWTH_PROGRESS)
      const nextMode =
        rect.top <= headerH - scrollableDistance ? 'absolute' : 'fixed'

      const line1 = line1Ref.current
      const line2 = line2Ref.current
      if (line1 && line2) {
        const originY = originYRef.current
        line1.setAttribute('font-size', baseFontSizeRef.current * scale)
        line2.setAttribute('font-size', baseFontSizeRef.current * scale)
        line1.setAttribute(
          'y',
          originY + (baseLine1YRef.current - originY) * scale,
        )
        line2.setAttribute(
          'y',
          originY + (baseLine2YRef.current - originY) * scale,
        )
      }
      if (heroFrameRef.current) {
        heroFrameRef.current.style.opacity = opacity
      }

      setMode((prev) => (prev === nextMode ? prev : nextMode))
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

  // The static pattern and the frame need to occupy the exact same
  // on-screen box at all times: pinned (fixed) while the extra scroll
  // runway drives the zoom, then frozen (absolute, at the stage bottom)
  // once it completes so normal scrolling can carry them away. With no
  // zoom (reduced motion), the frame stays in normal flow — it's the only
  // in-flow content, so the stage's height comes from it — and the
  // pattern is absolutely positioned to overlay the same box behind it.
  const patternStyle = reduceMotion
    ? { position: 'absolute', top: 0, left: 0, right: 0 }
    : mode === 'fixed'
      ? { position: 'fixed', top: 'var(--header-h)', left: 0, right: 0 }
      : { position: 'absolute', bottom: 0, left: 0, right: 0 }
  const frameStyle = reduceMotion ? undefined : patternStyle

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
        <div
          className="hero hero--full hero__pattern"
          style={patternStyle}
          aria-hidden="true"
        />

        <section
          className="hero hero--full hero__frame"
          ref={heroFrameRef}
          style={frameStyle}
        >
          <h1 className="sr-only">StartupFlow</h1>

          <svg className="hero__mask-defs" aria-hidden="true" focusable="false">
            <mask ref={maskRef} id="hero-cutout-mask" maskUnits="userSpaceOnUse">
              <rect ref={maskRectRef} x="0" y="0" fill="#fff" />
              <text
                ref={line1Ref}
                className="hero__cutout-glyph"
                textAnchor="middle"
                fill="#000"
              >
                {LINE1_TEXT}
              </text>
              <text
                ref={line2Ref}
                className="hero__cutout-glyph"
                textAnchor="middle"
                fill="#000"
              >
                {LINE2_TEXT}
              </text>
            </mask>
          </svg>

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

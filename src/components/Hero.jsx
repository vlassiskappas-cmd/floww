export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__wide">
        <p className="eyebrow">— Startup studio</p>

        <h1 className="hero__title hero__title--cutout">
          <span className="hero__cutout-line">Startup</span>
          <span className="hero__cutout-line">Flow</span>
        </h1>
      </div>

      <div className="hero__inner">
        <p className="hero__subtitle">
          StartupFlow is the startup-focused division of Frame Creative
          Group — identity, launch websites and pitch collateral, built by a
          senior team that ships fast.
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

      <a href="#overview" className="scroll-indicator" aria-label="Scroll down">
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
  )
}

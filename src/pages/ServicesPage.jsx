import Services from '../components/Services.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function ServicesPage() {
  return (
    <>
      <section className="page-header">
        <div className="section-inner">
          <p className="eyebrow">— Services</p>
          <h1 className="page-header__title">
            What we do
            <br />
            for founders.
          </h1>
          <p className="page-header__subtitle">
            Four ways we help early-stage companies look — and move — like
            they’ve already made it.
          </p>
        </div>
      </section>
      <Services detailed showCta={false} showHeading={false} />
      <CtaBanner />
    </>
  )
}

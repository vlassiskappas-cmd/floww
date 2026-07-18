import About from '../components/About.jsx'
import Launches from '../components/Launches.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function AboutPage() {
  return (
    <>
      <section className="page-header">
        <div className="section-inner">
          <p className="eyebrow">— About</p>
          <h1 className="page-header__title">
            Part of Frame
            <br />
            Creative Group.
          </h1>
          <p className="page-header__subtitle">
            StartupFlow is the startup-focused studio inside Frame Creative
            Group, a brand agency that has worked with founders,
            scale-ups and enterprise teams for over a decade.
          </p>
        </div>
      </section>
      <About full />
      <Launches />
      <CtaBanner />
    </>
  )
}

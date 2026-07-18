import { Link } from 'react-router-dom'
import { services } from '../data/content.js'

export default function Services({
  detailed = false,
  showCta = true,
  showHeading = true,
}) {
  return (
    <section className="services" id="overview">
      <div className="section-inner">
        {showHeading && (
          <>
            <p className="eyebrow">— What we do</p>
            <h2 className="section-title">
              Everything a founder
              <br />
              needs to launch.
            </h2>
          </>
        )}

        <div className="services__list">
          {services.map((service) => (
            <article className="service" key={service.number}>
              <span className="service__number">{service.number}</span>
              <div className="service__body">
                <h3 className="service__title">{service.title}</h3>
                <p className="service__desc">
                  {detailed ? service.detail : service.summary}
                </p>
              </div>
            </article>
          ))}
        </div>

        {showCta && (
          <div className="services__cta">
            <Link to="/services" className="btn btn--ghost">
              View all services →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

import { launches } from '../data/content.js'

export default function Launches() {
  return (
    <section className="launches">
      <div className="section-inner">
        <p className="eyebrow">— Selected launches</p>
        <h2 className="section-title">
          Startups
          <br />
          we’ve shaped.
        </h2>

        <div className="launches__grid">
          {launches.map((item) => (
            <article className="launch-card" key={item.name}>
              <div className="launch-card__preview" aria-hidden="true">
                <span className="launch-card__blob" />
              </div>
              <h3 className="launch-card__name">{item.name}</h3>
              <p className="launch-card__category">{item.category}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

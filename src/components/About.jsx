import { stats } from '../data/content.js'

export default function About({ full = false }) {
  return (
    <section className="about">
      <div className="section-inner">
        <p className="eyebrow">— The studio</p>

        <p className="about__lead">
          <strong>
            StartupFlow is the startup-focused division of Frame Creative
            Group.
          </strong>{' '}
          A small, senior team of brand designers and strategists working
          exclusively with founders — from pre-seed napkin sketches to
          Series-A rebrands. No handoffs. No juniors. No fluff.
        </p>

        {full && (
          <p className="about__lead about__lead--secondary">
            We exist because founders don’t need another agency with a six
            week onboarding process and a rotating cast of juniors. They need
            a small team that already knows how to talk to investors, ship a
            website in a sprint, and make a brand feel bigger than its
            headcount — because that team has done it for Frame Creative
            Group’s roster for years. StartupFlow is that team, focused
            entirely on early-stage companies.
          </p>
        )}

        <div className="stats">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <p className="stat__value">{stat.value}</p>
              <p className="stat__label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

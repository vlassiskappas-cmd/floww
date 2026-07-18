import ContactForm from '../components/ContactForm.jsx'

export default function ContactPage() {
  return (
    <section className="contact-page">
      <div className="section-inner contact-page__inner">
        <div className="contact-page__intro">
          <p className="eyebrow">— Start something</p>
          <h1 className="page-header__title">
            Let’s build
            <br />
            your brand.
          </h1>
          <p className="page-header__subtitle">
            Pre-seed to Series A. Tell us about the company you&apos;re
            building and we&apos;ll get back to you within a couple of days.
          </p>

          <a href="mailto:hello@startupflow.co" className="contact-page__email">
            hello@startupflow.co
          </a>
        </div>

        <ContactForm />
      </div>
    </section>
  )
}

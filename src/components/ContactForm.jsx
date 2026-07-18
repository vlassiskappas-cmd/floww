import { useState } from 'react'

const initialForm = { name: '', email: '', company: '', message: '' }

export default function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    setForm(initialForm)
  }

  if (submitted) {
    return (
      <div className="contact-form__success">
        <p className="eyebrow">— Message sent</p>
        <h3>Thanks — we&apos;ll be in touch shortly.</h3>
        <p>
          In the meantime, feel free to reach us directly at{' '}
          <a href="mailto:hello@startupflow.co">hello@startupflow.co</a>.
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Founder"
        />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="jane@company.com"
        />
      </div>

      <div className="field">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          value={form.company}
          onChange={handleChange}
          placeholder="What are you building?"
        />
      </div>

      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your stage, timeline, and what you need."
        />
      </div>

      <button type="submit" className="btn btn--pill">
        Send message <span className="btn__dot" aria-hidden="true" />
      </button>
    </form>
  )
}

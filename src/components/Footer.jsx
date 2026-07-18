import { Link } from 'react-router-dom'
import { socialLinks } from '../data/content.js'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="logo logo--footer">
            <span className="logo__mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 3V13M16 19V29M3 16H13M19 16H29M6.6 6.6L12.6 12.6M19.4 19.4L25.4 25.4M25.4 6.6L19.4 12.6M12.6 19.4L6.6 25.4"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="logo__word">flow</span>
          </Link>
          <p className="footer__tagline">
            © {year} StartupFlow — a division of Frame Creative Group.
          </p>
        </div>

        <div className="footer__links">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="footer__link"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

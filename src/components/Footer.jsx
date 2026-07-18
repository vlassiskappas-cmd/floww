import { Link } from 'react-router-dom'
import { socialLinks } from '../data/content.js'
import LogoMark from './LogoMark.jsx'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="logo logo--footer">
            <span className="logo__mark" aria-hidden="true">
              <LogoMark />
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

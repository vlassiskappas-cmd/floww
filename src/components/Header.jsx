import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import LogoMark from './LogoMark.jsx'

const navItems = [
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo__mark" aria-hidden="true">
            <LogoMark />
          </span>
          <span className="logo__word">flow</span>
        </Link>

        <nav className={`nav ${open ? 'nav--open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav__link ${isActive ? 'nav__link--active' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <Link to="/contact" className="btn btn--pill">
            Start a project <span className="btn__dot" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={`menu-toggle ${open ? 'menu-toggle--open' : ''}`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}

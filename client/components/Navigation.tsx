'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bnb-theme');
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && sys)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle('dark');
    const isNowDark = root.classList.contains('dark');
    setIsDark(isNowDark);
    localStorage.setItem('bnb-theme', isNowDark ? 'dark' : 'light');
  };

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { href: '/categories/kenya', label: 'Kenya' },
    { href: '/categories/devops', label: 'DevOps' },
    { href: '/categories/cybersecurity', label: 'Cybersecurity' },
    { href: '/categories/startups', label: 'Startups' },
    { href: '/categories/ai-ml', label: 'AI & ML' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
      <nav ref={menuRef} style={{ position: 'relative' }}>
        {/* Hamburger button — hidden on desktop via CSS */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            pointerEvents: 'none',
          }}>
            <span style={{
              display: 'block', width: 20, height: 2,
              background: '#F6F4F0',
              borderRadius: 2,
              transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
              transition: 'transform 0.2s',
            }} />
            <span style={{
              display: 'block', width: 20, height: 2,
              background: '#F6F4F0',
              borderRadius: 2,
              opacity: menuOpen ? 0 : 1,
              transition: 'opacity 0.2s',
            }} />
            <span style={{
              display: 'block', width: 20, height: 2,
              background: '#F6F4F0',
              borderRadius: 2,
              transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
              transition: 'transform 0.2s',
            }} />
          </span>
        </button>

        <Link href="/" className="nav-logo">
          <span className="live-dot"></span>Bash n Build
        </Link>

        {/* Desktop nav links */}
        <ul className="nav-links">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <button
            className="theme-btn"
            id="themeToggle"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <div className="tb-icons">
              <span>☀</span><span>☾</span>
            </div>
            <div className="tb-thumb"></div>
          </button>
          <Link href="/subscribe" className="nav-cta">Subscribe</Link>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="nav-mobile-menu">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-mobile-link"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Global styles for the hamburger + mobile menu */}
      <style>{`
        .nav-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
        }
        .nav-mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(26,67,49,0.97);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 2.5px solid var(--gold);
          z-index: 199;
          display: flex;
          flex-direction: column;
          padding: 0.5rem 0;
        }
        .nav-mobile-link {
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(246,244,240,0.85);
          padding: 0.75rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: background 0.15s, color 0.15s;
        }
        .nav-mobile-link:last-child {
          border-bottom: none;
        }
        .nav-mobile-link:hover {
          background: rgba(255,255,255,0.06);
          color: var(--gold);
        }
        @media (max-width: 768px) {
          .nav-hamburger {
            display: flex !important;
            order: -1;
          }
          .nav-logo {
            flex: 1;
            justify-content: center;
          }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}

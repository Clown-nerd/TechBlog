'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    const saved = localStorage.getItem('bnb-theme');
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && sys)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
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
    <nav style={{ position: 'relative' }}>
      <Link href="/" className="nav-logo">
        <span className="live-dot"></span>Bash n Build
      </Link>

      {/* Desktop nav links */}
      <ul className="nav-links">
        {navLinks.map(({ href, label }) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        {/* Hamburger button — hidden on desktop via CSS */}
        <button
          className="hamburger-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: '#F6F4F0',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'none', /* overridden to flex by .hamburger-btn CSS on mobile */
            alignItems: 'center',
            padding: '0.25rem',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Theme Toggle Button */}
        <button
          className="theme-btn"
          id="themeToggle"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          <div className="tb-icons">
            <span>☀</span><span>☾</span>
          </div>
          {/* We rely on the CSS selector for html.dark .tb-thumb targeting the div within .theme-btn if present,
              Wait, the CSS for tb-thumb moving right is: `html.dark .tb-thumb { left:26px; }`. 
              So we just render the DOM structure required. */}
          <div className="tb-thumb"></div>
        </button>

        <Link href="/subscribe" className="nav-cta">Subscribe</Link>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mobile-nav-menu">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={closeMenu}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

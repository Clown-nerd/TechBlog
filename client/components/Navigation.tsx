'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [isDark, setIsDark] = useState(false);

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

  return (
    <nav>
      <Link href="/" className="nav-logo">
        <span className="live-dot"></span>Bash n Build
      </Link>
      <ul className="nav-links">
        <li><Link href="/categories/kenya">Kenya</Link></li>
        <li><Link href="/categories/devops">DevOps</Link></li>
        <li><Link href="/categories/cybersecurity">Cybersecurity</Link></li>
        <li><Link href="/categories/startups">Startups</Link></li>
        <li><Link href="/categories/ai-ml">AI &amp; ML</Link></li>
        <li><Link href="/about">About</Link></li>
      </ul>
      <div className="nav-right">
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
    </nav>
  );
}

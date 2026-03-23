import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-brand">Bash n Build</div>
          <p className="footer-desc">
            Kenya's home for technical depth, startup intelligence, and the stories shaping the
            Silicon Savannah.
          </p>
        </div>
        <div>
          <div className="footer-col-title">Content</div>
          <ul className="footer-links">
            <li><Link href="/categories/devops">DevOps &amp; Cloud</Link></li>
            <li><Link href="/categories/cybersecurity">Cybersecurity</Link></li>
            <li><Link href="/categories/ai-ml">AI &amp; ML</Link></li>
            <li><Link href="/categories/fintech">Fintech</Link></li>
            <li><Link href="/categories/startups">Startups</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Platform</div>
          <ul className="footer-links">
            <li><Link href="#">Write for Us</Link></li>
            <li><Link href="/subscribe">Newsletter</Link></li>
            <li><Link href="#">Job Board</Link></li>
            <li><Link href="#">Events</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Company</div>
          <ul className="footer-links">
            <li><Link href="/about">About</Link></li>
            <li><Link href="#">Advertise</Link></li>
            <li><Link href="#">Privacy</Link></li>
            <li><Link href="#">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Bash n Build. Built in Nairobi 🇰🇪</span>
        <div className="footer-socials">
          <Link href="#">Twitter / X</Link>
          <Link href="#">LinkedIn</Link>
          <Link href="#">GitHub</Link>
          <Link href="#">WhatsApp</Link>
        </div>
      </div>
    </footer>
  );
}

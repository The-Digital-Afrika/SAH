import Image from "next/image";
import Link from "next/link";
import styles from "./FooterSocial.module.css";

export default function Footer({ flush = false }: { flush?: boolean }) {
  return (
    <footer className="home-footer" style={flush ? { marginTop: 0 } : undefined}>
      <div className="footer-columns">
        <section className="footer-brand-column">
          <Link className="footer-logo-link" href="/" aria-label="Home & School home">
            <Image
              className="footer-logo"
              src="/images/home-school-flourish-logo.png"
              alt="Home & School"
              width={2169}
              height={725}
              sizes="260px"
            />
          </Link>
          <h2>Our Office</h2>
          <p>
            Tshimologong Digital Precinct, 41 Juta Street,
            <br />
            Braamfontein, Johannesburg, South Africa
          </p>
        </section>

        <section>
          <h2>Useful Links</h2>
          <Link href="#">Advertise</Link>
          <Link href="/magazines">Magazines</Link>
          <Link href="/directory">About Us</Link>
          <Link href="/directory">Contact Us</Link>
          <Link href="#">Privacy Policy for Home&amp;School</Link>
          <Link href="/subscribe">Subscribe</Link>
        </section>

        <section>
          <h2>Follow Us</h2>
          <div className={`social-links ${styles.icons}`}>
            <Link href="https://www.facebook.com/share/1Jdhit2jmQ/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" data-social="facebook" aria-label="Facebook (opens in a new tab)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false"><path d="M14 8.5V6.7c0-.9.2-1.4 1.4-1.4H17V2.2C16.2 2.1 15.4 2 14.6 2c-2.6 0-4.3 1.6-4.3 4.4v2.1H7.4V12h2.9v10h3.6V12h2.9l.5-3.5H14z" /></svg>
            </Link>
            <Link href="https://www.instagram.com/sahomeschoolingmag?obrf=Zm0zdHpqbzBsN3lk" target="_blank" rel="noopener noreferrer" data-social="instagram" aria-label="Instagram (opens in a new tab)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </Link>
            <Link href="https://www.linkedin.com/company/sa-homeschooling/home/" target="_blank" rel="noopener noreferrer" data-social="linkedin" aria-label="LinkedIn (opens in a new tab)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false"><path d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 9h4v12H3V9zm6 0h3.8v1.6h.1c.5-.9 1.8-1.9 3.7-1.9 4 0 4.4 2.6 4.4 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9V9z" /></svg>
            </Link>
            <Link href="https://x.com/sah_andbeyond?s=11" target="_blank" rel="noopener noreferrer" data-social="x" aria-label="X (opens in a new tab)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false"><path d="M13.7 10.6 21.2 2h-1.8l-6.5 7.4L7.7 2H2l7.9 11.2L2 22h1.8l6.9-7.8 5.5 7.8H22l-8.3-11.4zm-2.4 2.7-.8-1.1L4.1 3.3h2.8l5.1 7.1.8 1.1 6.7 9.3h-2.8l-5.4-7.5z" /></svg>
            </Link>
          </div>
        </section>
      </div>

      <div className="footer-bottom">
        <span>&copy; 2026 The Digital Afrikan</span>
        <Link href="#">Privacy Policy for Home&amp;School</Link>
      </div>
    </footer>
  );
}


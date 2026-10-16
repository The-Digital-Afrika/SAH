import Image from "next/image";
import Link from "next/link";

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
          <Link href="#">Privacy Policy for SA Home&amp;School</Link>
          <Link href="/subscribe">Subscribe</Link>
        </section>

        <section>
          <h2>Follow Us</h2>
          <div className="social-links">
            <Link href="#" aria-label="Facebook">
              <span aria-hidden="true">f</span>
            </Link>
            <Link href="#" aria-label="Instagram">
              <span aria-hidden="true">ig</span>
            </Link>
            <Link href="#" aria-label="LinkedIn">
              <span aria-hidden="true">in</span>
            </Link>
            <Link href="#" aria-label="X">
              <span aria-hidden="true">x</span>
            </Link>
          </div>
        </section>
      </div>

      <div className="footer-bottom">
        <span>&copy; 2026 The Digital Afrikan</span>
        <Link href="#">Privacy Policy for SA Home&amp;School</Link>
      </div>
    </footer>
  );
}


import React from "react";
import { FaInstagram, FaTiktok, FaFacebook } from "react-icons/fa";
import { openCookiePanel } from "./CookieConsent";

function Footer() {
  return (
    <footer>
      <div className="footer-left">
        <p>&copy; 2025 SorokoKorki Wszelkie prawa zastrzeżone.</p>
        <p>
          <a href="mailto:kontakt@sorokokorki.com.pl">
            kontakt@sorokokorki.com.pl
          </a>
        </p>
        <p>
          <a href="/polityka-prywatnosci">Polityka prywatności</a>
        </p>
        <p>
          <button className="linklike" onClick={openCookiePanel}>Ustawienia cookies</button>
        </p>
      </div>

      <div className="footer-right">
        {/* <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram />
        </a> */}
        <a
          href="https://www.tiktok.com/@sorokokorki.com.pl?_t=ZN-8ycptU5Tqx0"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTiktok />
        </a>
        {/* <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook />
        </a> */}
      </div>
    </footer>
  );
}

export default Footer;

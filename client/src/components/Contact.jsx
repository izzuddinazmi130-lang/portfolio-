import { FaGithub, FaLinkedin, FaEnvelope, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { handleLinkClick } from "../navigate.js";

export default function Contact() {
  return (
    <footer id="contact" className="contact-footer">
      <div className="contact-marquee" aria-hidden="true">
        <div className="contact-marquee-track">
          <span className="contact-marquee-group">MUHAMMAD IZZUDDIN&nbsp;&nbsp;•&nbsp;&nbsp;</span>
          <span className="contact-marquee-group" aria-hidden="true">MUHAMMAD IZZUDDIN&nbsp;&nbsp;•&nbsp;&nbsp;</span>
        </div>
      </div>
      <div className="foot-grid">
        <div>
          <div className="contact-cta">
            <span className="contact-cta-kicker">Have a system in mind?</span>
            <h2>Let&apos;s make it useful.</h2>
            <p>Open to full-stack programmer and web developer roles. Tell me what you&apos;re building.</p>
            <a className="contact-cta-button" href="/contact">Start a conversation <span aria-hidden="true">-&gt;</span></a>
          </div>
        </div>
        <div className="contact-list">
          <a href="mailto:izzuddinazmi130@gmail.com">izzuddinazmi130@gmail.com</a>
          <div className="social-row">
            <a href="mailto:izzuddinazmi130@gmail.com" aria-label="Email" title="Email">
              <FaEnvelope />
            </a>
            <a href="https://wa.me/60198158556" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
              <FaWhatsapp />
            </a>
            <a href="https://github.com/izzuddinazmi130-lang" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
              <FaGithub />
            </a>
            <a href="https://www.linkedin.com/in/muhammad-izzuddin-bin-azmi-9513ab2a0/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>
      <div className="foot-legal">
        <a href="https://www.instagram.com/izz_azz" target="_blank" rel="noopener noreferrer" title="Instagram">
          <FaInstagram aria-hidden="true" /> Instagram
        </a>
        <a href="/cookies" onClick={(e) => handleLinkClick(e, "/cookies")}>Cookie policy</a>
        <a href="/privacy" onClick={(e) => handleLinkClick(e, "/privacy")}>Privacy policy</a>
      </div>
      <p className="foot-copy">All Rights Reserved Muhammad Izzuddin C{new Date().getFullYear()} &copy;</p>
    </footer>
  );
}
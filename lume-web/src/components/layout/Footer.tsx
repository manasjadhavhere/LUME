import React from 'react';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        {/* Top Section */}
        <div className="site-footer__top">
          {/* Brand Column */}
          <div className="site-footer__column site-footer__column--brand">
            <div className="site-footer__logo">
              <Sparkles size={32} />
              <span className="site-footer__logo-text">LUME</span>
            </div>
            <p className="site-footer__tagline">
              Your canvas. Our masterpiece.
            </p>
            <p className="site-footer__description">
              Discover and book the finest beauty artists for your perfect look.
            </p>
            
            {/* Social Links */}
            <div className="site-footer__social">
              <a href="#" className="site-footer__social-link" aria-label="Instagram">IG</a>
              <a href="#" className="site-footer__social-link" aria-label="Facebook">FB</a>
              <a href="#" className="site-footer__social-link" aria-label="Twitter">X</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="site-footer__column">
            <h3 className="site-footer__heading">Quick Links</h3>
            <ul className="site-footer__links">
              <li><a href="/home">Home</a></li>
              <li><a href="/discover">Discover Artists</a></li>
              <li><a href="/saved">Saved Artists</a></li>
              <li><a href="/profile">My Profile</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="site-footer__column">
            <h3 className="site-footer__heading">Services</h3>
            <ul className="site-footer__links">
              <li><a href="/discover?category=Bridal">Bridal Makeup</a></li>
              <li><a href="/discover?category=Editorial">Editorial Looks</a></li>
              <li><a href="/discover?category=Evening">Evening Glam</a></li>
              <li><a href="/discover?category=Natural">Natural Beauty</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="site-footer__column">
            <h3 className="site-footer__heading">Contact Us</h3>
            <ul className="site-footer__contact">
              <li>
                <Mail size={16} />
                <a href="mailto:hello@lume.beauty">hello@lume.beauty</a>
              </li>
              <li>
                <Phone size={16} />
                <a href="tel:+911234567890">+91 123 456 7890</a>
              </li>
              <li>
                <MapPin size={16} />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="site-footer__bottom">
          <div className="site-footer__bottom-content">
            <p className="site-footer__copyright">
              © {currentYear} Lume. All rights reserved.
            </p>
            <div className="site-footer__legal">
              <a href="#privacy">Privacy Policy</a>
              <span className="site-footer__separator">•</span>
              <a href="#terms">Terms of Service</a>
              <span className="site-footer__separator">•</span>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

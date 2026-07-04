import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="lume-footer">
      <div className="lume-footer__top">
        <div className="lume-footer__container">

          {/* Brand */}
          <div className="lume-footer__brand">
            <button className="lume-footer__logo" onClick={() => navigate('/')} aria-label="Lume Home">
              <Sparkles size={20} />
              <span>LUME</span>
            </button>
            <p className="lume-footer__tagline">Your canvas. Our masterpiece.</p>
            <p className="lume-footer__desc">
              India's finest beauty artists, one booking away.
            </p>
            <div className="lume-footer__social">
              {['IG', 'TW', 'YT'].map((label) => (
                <a key={label} href="#" className="lume-footer__social-btn" aria-label={label}>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lume-footer__col">
            <h4 className="lume-footer__heading">Explore</h4>
            <nav>
              {[
                { label: 'Home', path: '/' },
                { label: 'Discover Artists', path: '/discover' },
                { label: 'Saved', path: '/saved' },
                { label: 'My Profile', path: '/profile' },
              ].map(({ label, path }) => (
                <button key={label} className="lume-footer__link" onClick={() => navigate(path)}>
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="lume-footer__col">
            <h4 className="lume-footer__heading">Services</h4>
            <nav>
              {['Bridal Makeup', 'Editorial Looks', 'Evening Glam', 'Natural Beauty', 'Fantasy & Bold'].map(s => (
                <button key={s} className="lume-footer__link" onClick={() => navigate('/discover')}>
                  {s}
                </button>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="lume-footer__col">
            <h4 className="lume-footer__heading">Get in Touch</h4>
            <div className="lume-footer__contact">
              <a href="mailto:hello@lume.beauty" className="lume-footer__contact-item">
                <Mail size={14} /> hello@lume.beauty
              </a>
              <a href="tel:+911234567890" className="lume-footer__contact-item">
                <Phone size={14} /> +91 123 456 7890
              </a>
              <span className="lume-footer__contact-item">
                <MapPin size={14} /> Mumbai, India
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lume-footer__bottom">
        <div className="lume-footer__container lume-footer__bottom-inner">
          <p>© {year} Lume. All rights reserved.</p>
          <div className="lume-footer__legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

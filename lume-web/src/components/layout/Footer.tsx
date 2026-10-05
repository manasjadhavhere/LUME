import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="lume-footer">
      <div className="lume-footer__watermark">LUME</div>
      
      <div className="lume-footer__container">
        
        {/* Top Grid Section */}
        <div className="lume-footer__grid">
          {/* Brand */}
          <div className="lume-footer__brand-col">
            <button className="lume-footer__logo" onClick={() => navigate('/')} aria-label="Lume Home">
              <img src="/logo.png" alt="Lume Logo" />
            </button>
            <h3 className="lume-footer__tagline">Your canvas. Our masterpiece.</h3>
            <p className="lume-footer__desc">
              India's premier beauty platform connecting visionaries with award-winning makeup artists for your most defining moments.
            </p>
            
            <div className="lume-footer__social">
              <a href="#" className="lume-footer__social-link" aria-label="Instagram">
                <ExternalLink size={18} strokeWidth={1.5} />
              </a>
              <a href="#" className="lume-footer__social-link" aria-label="Twitter">
                <ExternalLink size={18} strokeWidth={1.5} />
              </a>
              <a href="#" className="lume-footer__social-link" aria-label="YouTube">
                <ExternalLink size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Links Nav */}
          <div className="lume-footer__nav-col">
            <h4 className="lume-footer__heading">Platform</h4>
            <nav>
              {[
                { label: 'Home', path: '/' },
                { label: 'Discover Artists', path: '/discover' },
                { label: 'Saved Profiles', path: '/saved' },
                { label: 'My Account', path: '/profile' },
              ].map(({ label, path }) => (
                <button key={label} className="lume-footer__link" onClick={() => navigate(path)}>
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="lume-footer__nav-col">
            <h4 className="lume-footer__heading">Specialties</h4>
            <nav>
              {['Bridal Makeup', 'Editorial & Fashion', 'Evening Glamour', 'Natural & Flawless', 'Fantasy & SFX'].map(s => (
                <button key={s} className="lume-footer__link" onClick={() => navigate('/discover')}>
                  {s}
                </button>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="lume-footer__nav-col">
            <h4 className="lume-footer__heading">Contact Us</h4>
            <div className="lume-footer__contact-info">
              <a href="mailto:hello@lume.beauty" className="lume-footer__contact-item">
                <Mail size={18} strokeWidth={1.5} />
                <span>hello@lume.beauty</span>
              </a>
              <a href="tel:+911234567890" className="lume-footer__contact-item">
                <Phone size={18} strokeWidth={1.5} />
                <span>+91 123 456 7890</span>
              </a>
              <span className="lume-footer__contact-item">
                <MapPin size={18} strokeWidth={1.5} />
                <span>Mumbai, India<br/>400001</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Newsletter Section */}
      <div className="lume-footer__newsletter-wrapper">
        <div className="lume-footer__container">
          <div className="lume-footer__newsletter">
            <div className="lume-footer__newsletter-content">
              <h3 className="lume-footer__newsletter-title">Join The Insider List</h3>
              <p className="lume-footer__newsletter-desc">Receive exclusive beauty insights and priority booking access.</p>
            </div>
            <form className="lume-footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" className="lume-footer__newsletter-input" />
              <button type="submit" className="lume-footer__newsletter-btn">
                Subscribe <ArrowRight size={18} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="lume-footer__container">
        <div className="lume-footer__bottom">
          <p className="lume-footer__copyright">© {year} Lume Beauty. All rights reserved.</p>
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, Check } from 'lucide-react';
import './Footer.css';

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"></polygon>
  </svg>
);

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 4500);
  };

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
              <a href="https://www.instagram.com/_hello_lume_app/" target="_blank" rel="noopener noreferrer" className="lume-footer__social-link" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="lume-footer__social-link" aria-label="YouTube">
                <YoutubeIcon size={18} />
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
                <button key={s} className="lume-footer__link" onClick={() => navigate(`/discover?search=${encodeURIComponent(s)}`)}>
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
            {subscribed ? (
              <div className="lume-footer__subscribed-msg" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose-pink)', fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontStyle: 'italic' }}>
                <Check size={18} /> Welcome to the Lume Insider Circle.
              </div>
            ) : (
              <form className="lume-footer__newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="lume-footer__newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="lume-footer__newsletter-btn">
                  Subscribe <ArrowRight size={18} strokeWidth={1.5} />
                </button>
              </form>
            )}
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

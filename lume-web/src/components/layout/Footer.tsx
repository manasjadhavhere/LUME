import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import Instagram from '../ui/InstagramIcon';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="lume-footer">
      <div className="lume-footer__container">
        <div className="lume-footer__grid">
          <div className="lume-footer__brand">
            <Link to="/" className="lume-brand" aria-label="Lume home"><span className="lume-brand__mark"><img src="/logo.png" alt="Lume logo" /></span><span className="lume-brand__name">LUME</span></Link>
            <p className="lume-footer__tagline">Your canvas. Our masterpiece.</p>
            <p className="lume-footer__description">Thoughtfully connecting you with professional makeup artists for every version of you.</p>
            <a className="lume-footer__instagram" href="https://www.instagram.com/_hello_lume_app/" target="_blank" rel="noopener noreferrer"><Instagram size={17} /> Follow the inspiration <ArrowUpRight size={14} /></a>
          </div>
          <nav aria-label="Explore Lume"><h3>Explore Lume</h3><Link to="/about">Our story</Link><Link to="/discover">Find an artist</Link><Link to="/saved">Saved artists</Link><Link to="/profile">My account</Link><Link to="/register?role=ARTIST">Join as an artist <ArrowUpRight size={13} /></Link></nav>
          <nav aria-label="Beauty occasions"><h3>Your occasion</h3>{[{ label: 'Bridal beauty', category: 'Bridal' }, { label: 'Editorial & fashion', category: 'Editorial' }, { label: 'Evening glamour', category: 'Glamour' }, { label: 'Naturally you', category: 'Natural' }].map(item => <Link key={item.category} to={`/discover?category=${item.category}`}>{item.label}</Link>)}</nav>
          <div className="lume-footer__contact"><h3>Say hello</h3><a href="mailto:hello@lume.beauty"><Mail size={16} /> hello@lume.beauty</a><span><MapPin size={16} /> Mumbai, India</span><p>A beautiful experience<br />starts with a conversation.</p></div>
        </div>
        <div className="lume-footer__bottom"><span>© {new Date().getFullYear()} Lume Beauty. All rights reserved.</span><span>Made for your defining moments.</span><a href="#" onClick={event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }}>Back to top <ArrowUpRight size={14} /></a></div>
      </div>
    </footer>
  );
}

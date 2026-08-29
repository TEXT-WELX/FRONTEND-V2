import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="welx-footer">
      <div className="welx-footer-glow" aria-hidden="true" />
      <div className="welx-footer-grid">
        <div className="welx-footer-about"><Link to="/">Wel.X</Link><p>Practical learning for curious people, modern professionals, and ambitious organizations.</p><div><a href="#" aria-label="Facebook"><Facebook /></a><a href="#" aria-label="Twitter"><Twitter /></a><a href="#" aria-label="Instagram"><Instagram /></a></div></div>
        <nav><h3>Platform</h3><Link to="/courses">Courses</Link><Link to="/playground">Sandbox</Link><Link to="/simulation">Simulation</Link><Link to="/events">Events</Link></nav>
        <nav><h3>Company</h3><Link to="/#journey">Why WELX</Link><Link to="/contact">Contact</Link><Link to="/login">Log in</Link><Link to="/signup">Sign up</Link></nav>
        <div className="welx-footer-contact"><h3>Contact Info</h3><a href="mailto:welx@wellingtoncampus.co"><Mail />welx@wellingtoncampus.co</a><a href="https://wa.me/971542523922" target="_blank" rel="noreferrer"><Phone />+971 54 252 3922</a><p><MapPin />Wellington Campus, Dubai CommerCity<br />Building B1, Floor 1, Office 111</p></div>
      </div>
      <div className="welx-footer-bottom"><span>© {new Date().getFullYear()} WELX Learning</span><b>Learn · Practice · Become.</b></div>
    </footer>
  );
}

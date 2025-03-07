import React from 'react';
import { Link } from 'react-router';

interface FooterProps {
  currentPage?: 'home' | 'chart';
}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="footer">
      <div className="footer-unified">
        <div className="footer-sections">
          <div className="footer-section">
            <h3>About Morse Code</h3>
            <p>Morse code is a method of transmitting text as a series of on-off tones, lights, or clicks that can be understood by a skilled listener without specialized equipment.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Game</Link></li>
              <li><Link to="/chart">Reference Chart</Link></li>
              <li><Link to="https://www.mastercw.com">Learn Morse Code</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Resources</h3>
            <p>Created with <a href="https://www.mastercw.com/cw.js/">CW.js</a>. For a complete Morse Code training solution visit <a href="https://www.mastercw.com">Master CW</a>.</p>
            <p>&copy; {new Date().getFullYear()} Morse Hero</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

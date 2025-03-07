import React from 'react';
import { Link } from 'react-router';

interface FooterProps {
  currentPage?: 'home' | 'chart';
}

const Footer: React.FC<FooterProps> = ({ currentPage = 'home' }) => {
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
              {currentPage === 'chart' && (
                <li><Link to="/">Morse Hero Game</Link></li>
              )}
              {currentPage === 'home' && (
                <li><Link to="/chart">Morse Code Chart</Link></li>
              )}
              <li><a href="https://en.wikipedia.org/wiki/Morse_code" target="_blank" rel="noopener noreferrer">Learn More</a></li>
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

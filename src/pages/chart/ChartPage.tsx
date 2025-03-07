import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import cw from 'cw';
import '../../styles.css';
import Footer from '../../components/Footer';

declare global {
  interface Window {
    cw: any;
  }
}

const ChartPage = () => {
  const actxRef = useRef<any>(null);

  // Initialize audio context
  const initAudio = () => {
    if (actxRef.current) return; // Already initialized

    try {
      actxRef.current = cw.initAudioContext({ tone: 600 });
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  };

  // Play Morse code for a character
  const playCharacter = (character: string) => {
    // Initialize audio on first user interaction
    if (!actxRef.current) {
      initAudio();
    }

    if (actxRef.current) {
      // Remove 'playing' class from all items
      document.querySelectorAll('.morse-item').forEach(item => {
        item.classList.remove('playing');
      });

      // Add 'playing' class to the clicked item
      const clickedItem = document.querySelector(`.morse-item[data-char="${character}"]`);
      if (clickedItem) {
        clickedItem.classList.add('playing');
      }

      cw.play(character, {
        wpm: 20,
        actx: actxRef.current
      });

      // Remove the 'playing' class after the audio finishes
      setTimeout(() => {
        if (clickedItem) {
          clickedItem.classList.remove('playing');
        }
      }, 2000);
    }
  };

  // Add click event listeners to all morse items
  useEffect(() => {
    const handleMorseItemClick = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const character = target.getAttribute('data-char');
      if (character) {
        playCharacter(character);
      }
    };

    const morseItems = document.querySelectorAll('.morse-item');
    morseItems.forEach(item => {
      item.addEventListener('click', handleMorseItemClick);
    });

    return () => {
      morseItems.forEach(item => {
        item.removeEventListener('click', handleMorseItemClick);
      });
    };
  }, []);

  return (
    <div className="container">
      <h1 className="title-link">
        <Link to="/" style={{ color: 'inherit', textDecoration: 'inherit' }}>Morse Hero</Link>
      </h1>

      <div className="page-intro">
        <h2>Morse Code Reference Chart</h2>
        <p>Click on any character to hear its Morse code sound. Practice recognizing these patterns to improve your Morse code skills.</p>
      </div>

      <div className="morse-info-card">
        <h3>Understanding Morse Code</h3>
        <p>Morse code uses dots (·) and dashes (−) to represent letters, numbers, and special characters. A dash is three times as long as a dot. The space between parts of the same letter is one dot length, between letters is three dot lengths, and between words is seven dot lengths.</p>
        <div className="morse-tips">
          <h4>Memorization Tips</h4>
          <ul>
            <li>E (·) and T (−) are the most common letters in English and have the shortest codes</li>
            <li>Letters with similar sounds often have related patterns (e.g., S and O: S = ··· and O = −−−)</li>
            <li>Practice regularly with common words to build muscle memory</li>
          </ul>
        </div>
      </div>

      <div className="chart-section">
        <h2>Letters</h2>
        <div className="morse-grid">
          {[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(char => (
            <div key={char} className="morse-item" data-char={char}>
              <div className="character">{char}</div>
              <div className="morse">{getMorseCode(char)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-section">
        <h2>Numbers</h2>
        <div className="morse-grid">
          {[...'0123456789'].map(char => (
            <div key={char} className="morse-item" data-char={char}>
              <div className="character">{char}</div>
              <div className="morse">{getMorseCode(char)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-section">
        <h2>Special Characters</h2>
        <div className="morse-grid">
          {[...'.=,?/'].map(char => (
            <div key={char} className="morse-item" data-char={char}>
              <div className="character">{char}</div>
              <div className="morse">{getMorseCode(char)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="morse-history">
        <h3>History of Morse Code</h3>
        <div className="history-content">
          <p>Morse code was developed in the 1830s by Samuel Morse and Alfred Vail for use with the telegraph. It revolutionized long-distance communication and remained the standard for telegraph communication for over 160 years.</p>
          <p>The original Morse code was slightly different from what we use today. The International Morse Code, which is the standard now, was created in 1865 to accommodate languages other than English.</p>
          <p>Though largely replaced by newer technologies, Morse code remains important in aviation, amateur radio, and emergencies where other communication systems might fail.</p>
        </div>
      </div>

      <div className="back-link">
        <Link to="/">Back to Game</Link>
      </div>

      <Footer />
    </div>
  );
};

// Helper function to get morse code representation
const getMorseCode = (char: string) => {
  const morseMap: { [key: string]: string } = {
    'A': '·−', 'B': '−···', 'C': '−·−·', 'D': '−··', 'E': '·',
    'F': '··−·', 'G': '−−·', 'H': '····', 'I': '··', 'J': '·−−−',
    'K': '−·−', 'L': '·−··', 'M': '−−', 'N': '−·', 'O': '−−−',
    'P': '·−−·', 'Q': '−−·−', 'R': '·−·', 'S': '···', 'T': '−',
    'U': '··−', 'V': '···−', 'W': '·−−', 'X': '−··−', 'Y': '−·−−',
    'Z': '−−··', '0': '−−−−−', '1': '·−−−−', '2': '··−−−', '3': '···−−',
    '4': '····−', '5': '·····', '6': '−····', '7': '−−···', '8': '−−−··',
    '9': '−−−−·', '.': '·−·−·−', ',': '−−··−−', '?': '··−−··', '/': '−··−·', '=': '−···−'
  };

  return morseMap[char] || '';
};

export default ChartPage;

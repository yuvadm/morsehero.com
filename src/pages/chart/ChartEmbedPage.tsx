import { useEffect, useRef } from 'react';
import cw from 'cw';
import '../../styles.css';

declare global {
  interface Window {
    cw: any;
  }
}

const ChartEmbedPage = () => {
  const actxRef = useRef<any>(null);

  // Add meta tag for WebView compatibility and set page title
  useEffect(() => {
    // Set viewport for better mobile display
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    document.head.appendChild(viewportMeta);

    // Set page title
    document.title = 'Morse Code Chart | Embed';

    return () => {
      // Remove viewport meta tag when component unmounts
      const metaTag = document.querySelector('meta[name="viewport"]');
      if (metaTag && metaTag.parentNode) {
        metaTag.parentNode.removeChild(metaTag);
      }
    };
  }, []);

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
    <div className="embed-container">
      <h1 className="embed-title">Morse Code Reference</h1>

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
          {[...'1234567890'].map(char => (
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

export default ChartEmbedPage;

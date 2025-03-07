import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import cw from 'cw';
import '../styles.css';

declare global {
  interface Window {
    cw: any;
  }
}

const HomePage = () => {
  // Game variables
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [currentChar, setCurrentChar] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [wpm, setWpm] = useState(20);
  const [showHints, setShowHints] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const actxRef = useRef<any>(null);
  const optionButtonsRef = useRef<Array<HTMLButtonElement | null>>([null, null, null, null]);

  // Define available characters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '.,?/=';
  const allChars = letters + numbers + specialChars;

  // Initialize the game when started - this happens on user interaction (button click)
  const startGame = () => {
    try {
      // Initialize audio context on user interaction
      actxRef.current = cw.initAudioContext({ tone: 600 });
      setGameStarted(true);
      newRound();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      alert('Failed to initialize audio. Please try again.');
    }
  };

  // Generate a new round
  const newRound = () => {
    // Reset button states
    optionButtonsRef.current.forEach(button => {
      if (button) {
        button.disabled = false;
        button.classList.remove('correct', 'incorrect', 'key-pressed');
      }
    });

    // Generate a random character
    const randomIndex = Math.floor(Math.random() * allChars.length);
    const newChar = allChars[randomIndex];
    setCurrentChar(newChar);

    // Generate options (one correct, three random)
    let newOptions = [newChar];

    // Add three random unique characters
    while (newOptions.length < 4) {
      const randomChar = allChars[Math.floor(Math.random() * allChars.length)];
      if (!newOptions.includes(randomChar)) {
        newOptions.push(randomChar);
      }
    }

    // Shuffle options
    newOptions = shuffleArray(newOptions);
    setOptions(newOptions);

    // Play the Morse code for the character
    playMorseCode(newChar);
  };

  // Play Morse code for a character
  const playMorseCode = (char: string) => {
    if (actxRef.current) {
      cw.play(char, {
        wpm: wpm,
        actx: actxRef.current
      });
    }
  };

  // Check if the answer is correct
  const checkAnswer = (selectedChar: string) => {
    if (selectedChar === currentChar) {
      // Correct answer
      setScore(prevScore => prevScore + 1);

      // Add to score tracker
      const scoreTracker = document.getElementById('scoreTracker');
      if (scoreTracker) {
        const marker = document.createElement('div');
        marker.className = 'score-marker correct';
        scoreTracker.appendChild(marker);
      }

      // Disable all buttons
      optionButtonsRef.current.forEach(button => {
        if (button) button.disabled = true;
      });

      // Highlight the correct button
      const correctButtonIndex = options.indexOf(currentChar);
      if (correctButtonIndex !== -1 && optionButtonsRef.current[correctButtonIndex]) {
        const button = optionButtonsRef.current[correctButtonIndex];
        if (button) button.classList.add('correct');
      }

      // Move to next round after delay
      setTimeout(newRound, 1500);
    } else {
      // Incorrect answer

      // Add to score tracker
      const scoreTracker = document.getElementById('scoreTracker');
      if (scoreTracker) {
        const marker = document.createElement('div');
        marker.className = 'score-marker incorrect';
        scoreTracker.appendChild(marker);
      }

      // Disable all buttons
      optionButtonsRef.current.forEach(button => {
        if (button) button.disabled = true;
      });

      // Highlight the incorrect button and show the correct one
      const selectedButtonIndex = options.indexOf(selectedChar);
      if (selectedButtonIndex !== -1 && optionButtonsRef.current[selectedButtonIndex]) {
        const button = optionButtonsRef.current[selectedButtonIndex];
        if (button) button.classList.add('incorrect');
      }

      const correctButtonIndex = options.indexOf(currentChar);
      if (correctButtonIndex !== -1 && optionButtonsRef.current[correctButtonIndex]) {
        const button = optionButtonsRef.current[correctButtonIndex];
        if (button) button.classList.add('correct');
      }

      // Move to next round after delay
      setTimeout(newRound, 2000);
    }

    setTotalPlayed(prevTotal => prevTotal + 1);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameStarted) return;

      const key = event.key.toUpperCase();

      // Find if any button has this character
      const index = options.findIndex(option => option === key);
      if (index !== -1) {
        const button = optionButtonsRef.current[index];
        if (button && !button.disabled) {
          button.classList.add('key-pressed');
          setTimeout(() => {
            button.classList.remove('key-pressed');
            checkAnswer(key);
          }, 100);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, options]);

  // Utility function to shuffle an array
  const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Get Morse code representation for a character
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

  // Reset game to initial state
  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setTotalPlayed(0);
    setCurrentChar('');
    setOptions([]);

    // Clear score tracker
    const scoreTracker = document.getElementById('scoreTracker');
    if (scoreTracker) {
      scoreTracker.innerHTML = '';
    }

    // Stop any playing audio
    if (actxRef.current) {
      try {
        actxRef.current.close();
        actxRef.current = null;
      } catch (error) {
        console.error('Error closing audio context:', error);
      }
    }
  };

  return (
    <div className="container">
      <h1 onClick={resetGame} className="title-link">Morse Hero</h1>

      {
        !gameStarted ? (
          <div id="startScreen">
            <div className="hero-content">
              <h2>Master Morse Code Through Play</h2>
              <p>Morse Hero turns learning Morse code into an engaging game. Listen to the signals, identify the characters, and improve your skills with every round.</p>

              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-icon">🎮</div>
                  <h3>Interactive Learning</h3>
                  <p>Learn by doing with our interactive game format</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔊</div>
                  <h3>Audio Recognition</h3>
                  <p>Train your ear to recognize Morse code sounds</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📈</div>
                  <h3>Track Progress</h3>
                  <p>See your improvement with each practice session</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">⚡</div>
                  <h3>Adjustable Speed</h3>
                  <p>Set your own pace as you build your skills</p>
                </div>
              </div>

              <div className="cta-container">
                <button id="startButton" className="start-button" onClick={startGame}>
                  Start Playing
                  <span className="button-morse">· − · − ·</span>
                </button>
                <button className="how-to-play-button" onClick={() => setShowHowToPlay(!showHowToPlay)}>
                  {showHowToPlay ? 'Hide Instructions' : 'How to Play'}
                </button>
              </div>

              {showHowToPlay && (
                <div className="how-to-play">
                  <h3>How to Play Morse Hero</h3>
                  <ol>
                    <li>Listen to the Morse code sound played</li>
                    <li>Select the correct character from the four options</li>
                    <li>Use keyboard keys that match the displayed characters for faster play</li>
                    <li>Enable hints if you need help seeing the Morse patterns</li>
                    <li>Adjust the speed to match your skill level</li>
                  </ol>
                  <div className="morse-fact">
                    <h4>Did You Know?</h4>
                    <p>Morse code was developed by Samuel Morse and Alfred Vail in the 1830s and revolutionized long-distance communication.</p>
                  </div>
                </div>
              )}

              <div className="chart-link">
                <Link to="/chart">View Morse Code Chart</Link>
              </div>
            </div>
          </div>
        ) : (
          <div id="gameArea" style={{ display: 'block' }}>
            <div className="score-container">
              <div className="score-widget">
                <div className="score-info">
                  <div className="score-label">Score:</div>
                  <div className="score-value">
                    <span id="score">{score}</span> / <span id="total">{totalPlayed}</span>
                  </div>
                </div>
                <div className="score-tracker" id="scoreTracker"></div>
              </div>
            </div>

            <div className="game-container">
              <div className="game-instructions">
                <p>Listen to the Morse code and select the correct character</p>
                <button className="replay-button" onClick={() => playMorseCode(currentChar)}>
                  <span className="replay-icon">↻</span> Replay Sound
                </button>
              </div>

              <div className="options">
                {options.map((option, index) => (
                  <button
                    key={index}
                    className="option-button"
                    ref={el => {
                      optionButtonsRef.current[index] = el;
                    }}
                    onClick={() => checkAnswer(option)}
                  >
                    <span className="char-display">{option}</span>
                    {showHints && <span className="morse-hint">{getMorseCode(option)}</span>}
                  </button>
                ))}
              </div>

              <div className="settings">
                <div className="setting-group">
                  <label htmlFor="wpmSelect">Speed:</label>
                  <select
                    id="wpmSelect"
                    value={wpm}
                    onChange={(e) => setWpm(parseInt(e.target.value))}
                  >
                    <option value="10">10 WPM</option>
                    <option value="15">15 WPM</option>
                    <option value="20">20 WPM</option>
                    <option value="25">25 WPM</option>
                    <option value="30">30 WPM</option>
                  </select>
                </div>
                <div className="setting-group hint-setting">
                  <input
                    type="checkbox"
                    id="hintMode"
                    name="hintMode"
                    checked={showHints}
                    onChange={(e) => setShowHints(e.target.checked)}
                  />
                  <label htmlFor="hintMode">Show Hints</label>
                </div>
                <button className="reset-button" onClick={resetGame}>New Game</button>
              </div>

              <div className="keyboard-tip">
                <p>Pro Tip: Use your keyboard to select options faster!</p>
              </div>
            </div>
          </div>
        )
      }

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
                <li><Link to="/chart">Morse Code Chart</Link></li>
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
    </div >
  );
};

export default HomePage;

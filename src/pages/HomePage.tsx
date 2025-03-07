import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import cw from 'cw';
import '../styles.css';
import '../components/OptionButtons.css';
import Footer from '../components/Footer';

declare global {
  interface Window {
    cw: any;
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [_correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [_incorrectAnswers, setIncorrectAnswers] = useState<string[]>([]);

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
    setSelectedOption(null);
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
    const generateOptions = (correctChar: string): string[] => {
      const possibleChars = allChars.split("");
      const filteredChars = possibleChars.filter(char => char !== correctChar);
      const shuffled = [...filteredChars].sort(() => 0.5 - Math.random());
      const options = [correctChar, ...shuffled.slice(0, 3)];
      return options.sort(() => 0.5 - Math.random());
    };

    const newOptions = generateOptions(newChar);
    setOptions(newOptions);

    // Play the Morse code for the character
    playMorseCode(newChar);
  };

  // Play Morse code for a character
  const playMorseCode = (char: string) => {
    if (!char) return;

    try {
      if (!actxRef.current) {
        actxRef.current = cw.initAudioContext({ tone: 600 });
      }

      cw.play(char, {
        wpm: wpm,
        actx: actxRef.current
      });
    } catch (error) {
      console.error('Error playing Morse code:', error);
    }
  };

  // Check if the answer is correct
  const checkAnswer = (selectedChar: string) => {
    setSelectedOption(selectedChar);
    const isCorrect = selectedChar === currentChar;

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);

      // Add to score tracker
      const scoreTracker = document.getElementById('scoreTracker');
      if (scoreTracker) {
        const marker = document.createElement('div');
        marker.className = 'score-marker correct';
        scoreTracker.appendChild(marker);
      }
    } else {
      // Add to score tracker
      const scoreTracker = document.getElementById('scoreTracker');
      if (scoreTracker) {
        const marker = document.createElement('div');
        marker.className = 'score-marker incorrect';
        scoreTracker.appendChild(marker);
      }

      // Highlight the correct answer
      const correctIndex = options.findIndex(option => option === currentChar);
      if (correctIndex !== -1) {
        const correctButton = optionButtonsRef.current[correctIndex];
        if (correctButton) {
          // Add a small delay before showing the correct answer
          setTimeout(() => {
            correctButton.classList.add('correct');
          }, 300);
        }
      }
    }

    setTotalPlayed(prevTotal => prevTotal + 1);

    // Proceed to next round after a delay
    setTimeout(() => {
      newRound();
    }, 1500); // Increased delay to give time to see the correct answer
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
            handleOptionClick(key, index);
          }, 100);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, options]);

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
    setCorrectAnswers([]);
    setIncorrectAnswers([]);

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

  // Handle option button click
  const handleOptionClick = (option: string, index: number) => {
    const button = optionButtonsRef.current[index];
    if (button) {
      // Disable all buttons to prevent multiple selections
      optionButtonsRef.current.forEach(btn => {
        if (btn) btn.disabled = true;
      });

      // Add appropriate class based on correctness
      if (option === currentChar) {
        button.classList.add('correct');
      } else {
        button.classList.add('incorrect');
      }

      // Check the answer
      checkAnswer(option);
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

              <div className="cta-container">
                <button id="startButton" className="start-button" onClick={startGame}>
                  Start Game
                </button>
                <div className="chart-link">
                  <Link to="/chart">View Morse Code Chart</Link>
                </div>
              </div>

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
              </div>

              <div className="options">
                {options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${selectedOption === option
                      ? option === currentChar
                        ? "correct"
                        : "incorrect"
                      : ""
                      }`}
                    ref={el => {
                      optionButtonsRef.current[index] = el;
                    }}
                    onClick={() => handleOptionClick(option, index)}
                    disabled={selectedOption !== null}
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
              </div>

              <div className="keyboard-tip">
                <p>Pro Tip: Use your keyboard to select options faster!</p>
              </div>
            </div>
          </div>
        )
      }

      <Footer />
    </div >
  );
};

export default HomePage;

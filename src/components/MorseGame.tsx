import { useState, useEffect, useRef } from 'react';
import cw from 'cw';
import './OptionButtons.css';

declare global {
  interface Window {
    cw: any;
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

interface MorseGameProps {
  onReset?: () => void;
  embed?: boolean;
}

const MorseGame: React.FC<MorseGameProps> = ({ onReset, embed = false }) => {
  // Game variables
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [currentChar, setCurrentChar] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [wpm, setWpm] = useState(20);
  const [showHints, setShowHints] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(!embed); // Auto-start if not in embed mode

  const actxRef = useRef<any>(null);
  const optionButtonsRef = useRef<Array<HTMLButtonElement | null>>([null, null, null, null]);
  const isInitializedRef = useRef(false);

  // Define available characters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '.,?/=';
  const allChars = letters + numbers + specialChars;

  // Initialize component and start first round
  useEffect(() => {
    if (!isInitializedRef.current) {
      try {
        // Initialize audio context on first render
        actxRef.current = cw.initAudioContext({ tone: 600 });
        isInitializedRef.current = true;

        // Start the first round after audio context is initialized if not in embed mode or if game already started
        if (gameStarted) {
          setTimeout(() => {
            newRound();
          }, 100);
        }
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    }

    // Cleanup function to close audio context when component unmounts
    return () => {
      if (actxRef.current) {
        try {
          // Check if close method exists before calling it
          if (typeof actxRef.current.close === 'function') {
            actxRef.current.close();
          }
          actxRef.current = null;
        } catch (error) {
          console.error('Error cleaning up audio context:', error);
        }
      }
    };
  }, [gameStarted]);

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
  }, [options]);

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

  // Start the game (for embed mode)
  const startGame = () => {
    setGameStarted(true);
    setTimeout(() => {
      newRound();
    }, 100);
  };

  return (
    <div id="gameArea" style={{ display: 'block' }}>
      {embed && !gameStarted ? (
        <div className="start-game-container">
          <button
            className="start-game-button"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
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

            {!embed && (
              <div className="keyboard-tip">
                <p>Pro Tip: Use your keyboard to select options faster!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MorseGame;

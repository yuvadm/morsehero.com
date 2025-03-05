import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import '../base.css';
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
  const [feedback, setFeedback] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [wpm, setWpm] = useState(20);
  const [showHints, setShowHints] = useState(false);
  
  const actxRef = useRef<any>(null);
  const optionButtonsRef = useRef<Array<HTMLButtonElement | null>>([null, null, null, null]);

  // Define available characters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '.,?/=';
  const allChars = letters + numbers + specialChars;

  // Initialize the game when started
  const startGame = () => {
    try {
      if (window.cw) {
        actxRef.current = window.cw.initAudioContext({ tone: 600 });
        setGameStarted(true);
        newRound();
      } else {
        console.error('CW.js not loaded');
        alert('Failed to initialize audio. Please try again.');
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      alert('Failed to initialize audio. Please try again.');
    }
  };

  // Generate a new round
  const newRound = () => {
    // Clear feedback
    setFeedback('');

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
      window.cw.playText({
        text: char,
        wpm: wpm,
        audioContext: actxRef.current
      });
    }
  };

  // Check if the answer is correct
  const checkAnswer = (selectedChar: string) => {
    if (selectedChar === currentChar) {
      // Correct answer
      setFeedback('Correct!');
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
      setFeedback('Incorrect! The correct answer was ' + currentChar);
      
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

  // Load CW.js script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/cw@latest/dist/cw.min.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
    const morseMap: {[key: string]: string} = {
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

  return (
    <div className="container">
      <h1><Link to="/" className="title-link">Morse Hero</Link></h1>

      {!gameStarted ? (
        <div id="startScreen">
          <p>Learn Morse code the fun way!</p>
          <button id="startButton" className="start-button" onClick={startGame}>Start</button>
          <div className="chart-link">
            <Link to="/chart">View Morse Code Chart</Link>
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

            <div className="feedback" id="feedback">{feedback}</div>
          </div>

          <div className="settings">
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
            <div className="hint-setting">
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
        </div>
      )}

      <footer className="footer">
        <p>Need help? View the <Link to="/chart">Morse Code Chart</Link>. </p>
        <p>Created with <a href="https://www.mastercw.com/cw.js/">CW.js</a>. For a complete and professional
          Morse Code training solution visit <a href="https://www.mastercw.com">Master CW</a>.</p>
      </footer>
    </div>
  );
};

export default HomePage;

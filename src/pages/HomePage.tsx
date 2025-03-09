import { useState } from 'react';
import { Link } from 'react-router';
import '../styles.css';
import Footer from '../components/Footer';
import MorseGame from '../components/MorseGame';

const HomePage = () => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize the game when started - this happens on user interaction (button click)
  const startGame = () => {
    setGameStarted(true);
  };

  // Reset game to initial state
  const resetGame = () => {
    setGameStarted(false);
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
          <MorseGame />
        )
      }

      <Footer />
    </div>
  );
};

export default HomePage;

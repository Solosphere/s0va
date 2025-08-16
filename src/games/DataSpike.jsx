import React, { useState, useEffect, useRef } from 'react';
import './DataSpike.css';

export default function DataSpike({ onClose }) {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [overload, setOverload] = useState(0);
  const [spikes, setSpikes] = useState([]);
  const [gameTime, setGameTime] = useState(0);
  const [highScores, setHighScores] = useState([]);
  const [spikeCount, setSpikeCount] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const gameAreaRef = useRef(null);
  const gameLoopRef = useRef(null);
  const spikeSpawnRef = useRef(null);
  const updateSpikesRef = useRef(null);
  const gameStateRef = useRef(gameState);

  // Load high scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('dataSpikeHighScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  const startGame = () => {
    console.log('Starting Data Spike game...');
    setGameState('playing');
    setScore(0);
    setOverload(0);
    setSpikes([]);
    setGameTime(0);
    setSpikeCount(0);
    setDifficulty(1);
    
    // Start game loop
    gameLoopRef.current = setInterval(() => {
      setGameTime(prev => prev + 0.1);
      setDifficulty(prev => Math.min(prev + 0.001, 3)); // Increase difficulty over time
    }, 100);


    
    // Start spawning spikes after a short delay to ensure DOM is ready
    setTimeout(() => {
      console.log('Starting spike spawning...');
      spawnSpike();
    }, 500);
  };

  const spawnSpike = () => {
    console.log('spawnSpike called, gameState:', gameStateRef.current, 'isPaused:', isPausedRef.current);
    // Double-check pause state to prevent any spikes from spawning when paused
    if (gameStateRef.current !== 'playing' || isPausedRef.current) {
      console.log('spawnSpike: game not in playing state or paused, returning');
      return;
    }
    
    // Additional safety check - if we're paused, don't spawn
    if (isPausedRef.current) {
      console.log('spawnSpike: additional pause check failed, returning');
      return;
    }

    const gameArea = gameAreaRef.current;
    console.log('spawnSpike: gameArea ref:', gameArea);
    if (!gameArea) {
      console.log('spawnSpike: gameArea is null, returning');
      return;
    }

    const rect = gameArea.getBoundingClientRect();
    console.log('Game area dimensions:', rect.width, 'x', rect.height);
    console.log('Game area position:', rect.left, rect.top);
    console.log('Game area element:', gameArea);
    
    // Ensure we have valid dimensions
    if (rect.width <= 0 || rect.height <= 0) {
      console.log('Invalid dimensions, retrying...');
      // Retry after a short delay if dimensions aren't ready
      spikeSpawnRef.current = setTimeout(spawnSpike, 100);
      return;
    }

    const newSpike = {
      id: Date.now() + Math.random(),
      x: Math.random() * (rect.width - 60),
      y: Math.random() * (rect.height - 60),
      type: Math.random() > 0.7 ? 'critical' : 'normal',
      createdAt: Date.now()
    };

    console.log('About to add spike to array:', newSpike);
    setSpikes(prev => {
      console.log('Previous spikes array:', prev);
      const newArray = [...prev, newSpike];
      console.log('New spikes array:', newArray);
      return newArray;
    });
    console.log('Spike spawned:', newSpike.type, 'at', newSpike.x, newSpike.y);

    // Schedule next spike spawn
    const spawnDelay = Math.max(500 - (difficulty * 100), 200);
    spikeSpawnRef.current = setTimeout(spawnSpike, spawnDelay);
  };

  const handleSpikeClick = (spikeId) => {
    const spike = spikes.find(s => s.id === spikeId);
    if (!spike) return;

    // Calculate points based on spike type and time
    const timeAlive = Date.now() - spike.createdAt;
    const points = spike.type === 'critical' ? 50 : 25;
    const timeBonus = Math.max(0, 100 - timeAlive);
    const totalPoints = points + Math.floor(timeBonus / 10);

    setScore(prev => prev + totalPoints);
    setSpikeCount(prev => prev + 1);
    setOverload(prev => Math.max(0, prev - 5)); // Reduce overload

    // Remove spike
    setSpikes(prev => prev.filter(s => s.id !== spikeId));
  };

  const updateSpikes = () => {
    // Don't update spikes if game is paused
    if (gameStateRef.current !== 'playing' || isPausedRef.current) {
      console.log('updateSpikes: game paused or not playing, skipping update');
      return;
    }

    setSpikes(prev => {
      const now = Date.now();
      console.log('updateSpikes called, current spikes:', prev.length);
      const updatedSpikes = prev.filter(spike => {
        const timeAlive = now - spike.createdAt;
        if (timeAlive > 3000) { // Spike disappears after 3 seconds
          console.log('Removing spike due to timeout:', spike.id);
          setOverload(prev => Math.min(100, prev + 10)); // Increase overload
          return false;
        }
        return true;
      });
      console.log('updateSpikes result:', updatedSpikes.length, 'spikes remaining');
      return updatedSpikes;
    });
  };

  // Update spikes every 100ms
  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      updateSpikesRef.current = setInterval(updateSpikes, 100);
      return () => {
        if (updateSpikesRef.current) {
          clearInterval(updateSpikesRef.current);
          updateSpikesRef.current = null;
        }
      };
    } else {
      // Clear interval if game is paused or not playing
      if (updateSpikesRef.current) {
        clearInterval(updateSpikesRef.current);
        updateSpikesRef.current = null;
      }
    }
  }, [gameState, isPaused]);

  // Check for game over
  useEffect(() => {
    if (overload >= 100) {
      endGame();
    }
  }, [overload]);

  // Update game state ref whenever gameState changes
  useEffect(() => {
    console.log('Game state changed to:', gameState);
    gameStateRef.current = gameState;
  }, [gameState]);

  // Update isPaused ref for consistency
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (spikeSpawnRef.current) {
        clearTimeout(spikeSpawnRef.current);
      }
      if (updateSpikesRef.current) {
        clearInterval(updateSpikesRef.current);
      }
    };
  }, []);

  // Debug spikes changes
  useEffect(() => {
    console.log('Spikes updated:', spikes.length, 'spikes');
    if (spikes.length > 0) {
      console.log('Latest spike:', spikes[spikes.length - 1]);
    }
  }, [spikes]);

  // Keyboard event listener for pause
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' || event.key === ' ') {
        event.preventDefault();
        if (gameState === 'playing') {
          pauseGame();
        } else if (gameState === 'paused') {
          resumeGame();
        }
      }
    };

    if (gameState === 'playing' || gameState === 'paused') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState]);

  const endGame = () => {
    console.log('Ending game...');
    setGameState('gameOver');
    
    // Clear intervals and refs
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (spikeSpawnRef.current) {
      clearTimeout(spikeSpawnRef.current);
      spikeSpawnRef.current = null;
    }
    if (updateSpikesRef.current) {
      clearInterval(updateSpikesRef.current);
      updateSpikesRef.current = null;
    }

    // Save high score
    const newScore = {
      score,
      time: Math.floor(gameTime),
      spikes: spikeCount,
      date: new Date().toLocaleDateString()
    };

    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Keep top 5

    setHighScores(updatedScores);
    localStorage.setItem('dataSpikeHighScores', JSON.stringify(updatedScores));
  };

  const resetGame = () => {
    console.log('Resetting game...');
    setGameState('menu');
    setScore(0);
    setOverload(0);
    setSpikes([]);
    setGameTime(0);
    setSpikeCount(0);
    setDifficulty(1);
    setIsPaused(false);
    
    // Clear any remaining intervals
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (spikeSpawnRef.current) {
      clearTimeout(spikeSpawnRef.current);
      spikeSpawnRef.current = null;
    }
    if (updateSpikesRef.current) {
      clearInterval(updateSpikesRef.current);
      updateSpikesRef.current = null;
    }
  };

  const pauseGame = () => {
    console.log('Pausing game...');
    setIsPaused(true);
    setGameState('paused');
    
    // Clear all spikes when pausing to prevent overload spike on resume
    setSpikes([]);
    
    // Clear intervals but preserve game state
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (spikeSpawnRef.current) {
      clearTimeout(spikeSpawnRef.current);
      spikeSpawnRef.current = null;
    }
    if (updateSpikesRef.current) {
      clearInterval(updateSpikesRef.current);
      updateSpikesRef.current = null;
    }
  };

  const resumeGame = () => {
    console.log('Resuming game...');
    setIsPaused(false);
    setGameState('playing');
    
    // Restart game loop with preserved state
    gameLoopRef.current = setInterval(() => {
      setGameTime(prev => prev + 0.1);
      setDifficulty(prev => Math.min(prev + 0.001, 3));
    }, 100);
    
    // Restart spike spawning after a longer delay to ensure state is fully updated
    setTimeout(() => {
      if (gameStateRef.current === 'playing' && !isPausedRef.current) {
        console.log('Resuming spike spawning...');
        spawnSpike();
      } else {
        console.log('Not resuming spike spawning - game state not ready');
      }
    }, 200);
    
    // The updateSpikes interval will be restarted by the useEffect
  };

  const renderMenu = () => (
    <div className="data-spike-menu">
      <div className="menu-header">
        <h2 className="glitch-text" data-text="DATA SPIKE">DATA SPIKE</h2>
        <p className="menu-subtitle">Memory Overload Protocol</p>
      </div>
      
      <div className="menu-content">
        <div className="game-description">
          <p>Neutralize emergent data threats to maintain system integrity.</p>
          <p>Click spikes before they corrupt the system.</p>
          <p>Critical spikes (red) are worth more points.</p>
        </div>
        
        <button className="start-btn" onClick={startGame}>
          INITIALIZE PROTOCOL
        </button>
        
        {highScores.length > 0 && (
          <div className="high-scores">
            <h3>TRACE LOGS (High Scores)</h3>
            <div className="scores-list">
              {highScores.map((score, index) => (
                <div key={index} className="score-entry">
                  <span className="score-rank">#{index + 1}</span>
                  <span className="score-value">{score.score}</span>
                  <span className="score-time">{score.time}s</span>
                  <span className="score-spikes">{score.spikes} spikes</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="data-spike-game">
      <div className="game-header">
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">SCORE:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">OVERLOAD:</span>
            <span className={`stat-value ${overload > 80 ? 'critical' : ''}`}>
              {Math.floor(overload)}%
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">TIME:</span>
            <span className="stat-value">{Math.floor(gameTime)}s</span>
          </div>
        </div>
        <button className="pause-btn" onClick={pauseGame} title="Pause Game (ESC)">
          ⏸
        </button>
      </div>

      <div className="game-area" ref={gameAreaRef}>
        {/* Debug info */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', color: '#00ff00', fontSize: '12px', zIndex: 10 }}>
        </div>
        

        
        {spikes.map(spike => (
          <div
            key={spike.id}
            className={`data-spike ${spike.type}`}
            style={{
              left: `${spike.x}px`,
              top: `${spike.y}px`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
            onClick={() => handleSpikeClick(spike.id)}
          >
            <div className="spike-content">
              {spike.type === 'critical' ? '⚠' : '!'}
            </div>
          </div>
        ))}
      </div>

      <div className="overload-bar">
        <div 
          className="overload-fill" 
          style={{ width: `${overload}%` }}
        />
      </div>
    </div>
  );

  const renderPaused = () => (
    <div className="data-spike-paused">
      <div className="paused-header">
        <h2 className="glitch-text" data-text="SYSTEM PAUSED">SYSTEM PAUSED</h2>
        <div className="paused-stats">
          <p>Current Score: {score}</p>
          <p>Overload Level: {Math.floor(overload)}%</p>
          <p>Time Elapsed: {Math.floor(gameTime)}s</p>
          <p>Spikes Neutralized: {spikeCount}</p>
        </div>
      </div>

      <div className="paused-actions">
        <button className="resume-btn" onClick={resumeGame}>
          RESUME PROTOCOL
        </button>
        <button className="menu-btn" onClick={resetGame}>
          RETURN TO MENU
        </button>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="data-spike-gameover">
      <div className="gameover-header">
        <h2 className="glitch-text critical" data-text="SYSTEM FAILURE">SYSTEM FAILURE</h2>
        <div className="flickering-log">
          <p>=== SYSTEM LOG ===</p>
          <p>Session Duration: {Math.floor(gameTime)} seconds</p>
          <p>Spikes Neutralized: {spikeCount}</p>
          <p>Final Score: {score}</p>
          <p>Overload Level: 100%</p>
          <p>Status: CRITICAL FAILURE</p>
          <p>=== END LOG ===</p>
        </div>
      </div>

      <div className="gameover-actions">
        <button className="retry-btn" onClick={resetGame}>
          RESTART PROTOCOL
        </button>
        <button className="menu-btn" onClick={resetGame}>
          RETURN TO MENU
        </button>
      </div>
    </div>
  );

  return (
    <div className="data-spike-container">
      <div className="data-spike-modal">
        <div className="modal-header">
          <h2>DATA SPIKE - Neural Interface Protocol</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {gameState === 'menu' && renderMenu()}
          {gameState === 'playing' && renderGame()}
          {gameState === 'paused' && renderPaused()}
          {gameState === 'gameOver' && renderGameOver()}
        </div>
      </div>
    </div>
  );
} 
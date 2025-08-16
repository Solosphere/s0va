import React, { useState, useEffect, useRef } from 'react';
import './NullEscape.css';

export default function NullEscape({ onClose }) {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver, win
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [drones, setDrones] = useState([]);
  const [map, setMap] = useState([]);
  const [gameTime, setGameTime] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [detectionLevel, setDetectionLevel] = useState(0);
  const [memoryFragments, setMemoryFragments] = useState(0);
  const [highScores, setHighScores] = useState([]);
  const [lastRoute, setLastRoute] = useState([]);
  const [difficulty, setDifficulty] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [explosionPos, setExplosionPos] = useState(null);
  const [fragments, setFragments] = useState([]);
  const [viewportSize, setViewportSize] = useState(20); // Increased viewport size to fill game area
  const [countdown, setCountdown] = useState(0); // Countdown state
  
  const gameAreaRef = useRef(null);
  const gameLoopRef = useRef(null);
  const gameStateRef = useRef(gameState);
  const playerPosRef = useRef({ x: 1, y: 1 });
  const mapRef = useRef(null);
  const fragmentsRef = useRef([]); // Added fragmentsRef to avoid stale closure
  const currentLevelRef = useRef(1);
  const mapSize = 40; // Increased from 20 to 40 for endless feel

  // Load high scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('nullEscapeHighScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  // Update game state ref
  useEffect(() => {
    console.log('Game state changed to:', gameState);
    gameStateRef.current = gameState;
  }, [gameState]);

  // Update player position ref
  useEffect(() => {
    console.log('Player position updated:', playerPos);
    playerPosRef.current = playerPos;
  }, [playerPos]);

  // Update map ref
  useEffect(() => {
    console.log('Map updated:', map?.length, 'x', map?.[0]?.length);
    mapRef.current = map;
  }, [map]);

  // Track fragments state
  useEffect(() => {
    console.log('Fragments state updated:', fragments.length, 'fragments');
    fragmentsRef.current = fragments; // Update fragmentsRef
    
    // Check if all fragments are collected and advance to next level
    if (fragments.length === 0 && gameStateRef.current === 'playing' && currentLevelRef.current > 0) {
      console.log('All fragments collected! Advancing to next level...');
      advanceToNextLevel();
    }
  }, [fragments]);

  // Track current level
  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  const generateMap = () => {
    let newMap;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      attempts++;
      console.log(`Map generation attempt ${attempts}/${maxAttempts}`);
      
      // Generate maze-like map with cellular automata
      newMap = generateMazeLikeMap();
      
      // Ensure player starting position is clear
      newMap[1][1] = '.';
      
      // Ensure starting area has at least 2 exits
      const startArea = [
        [1, 1], [1, 2], [2, 1], [2, 2] // 2x2 starting area
      ];
      
      // Clear the starting area
      startArea.forEach(([x, y]) => {
        if (x < mapSize - 1 && y < mapSize - 1) {
          newMap[y][x] = '.';
        }
      });
      
      // Ensure at least 2 paths out of starting area
      const exits = [];
      if (newMap[1][3] === '.') exits.push([1, 3]);
      if (newMap[3][1] === '.') exits.push([3, 1]);
      if (newMap[2][3] === '.') exits.push([2, 3]);
      if (newMap[3][2] === '.') exits.push([3, 2]);
      
      // If not enough exits, create them
      while (exits.length < 2) {
        const possibleExits = [
          [1, 3], [3, 1], [2, 3], [3, 2]
        ].filter(([x, y]) => !exits.some(([ex, ey]) => ex === x && ey === y));
        
        if (possibleExits.length > 0) {
          const [x, y] = possibleExits[Math.floor(Math.random() * possibleExits.length)];
          newMap[y][x] = '.';
          exits.push([x, y]);
        }
      }
      
    } while (!isMapValid(newMap) && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      console.warn('Failed to generate valid map after', maxAttempts, 'attempts, using fallback');
      return generateFallbackMap();
    }
    
    console.log('Valid map generated after', attempts, 'attempts');
    return newMap;
  };

  const generateMazeLikeMap = () => {
    const map = [];
    
    // Initialize with walls
    for (let y = 0; y < mapSize; y++) {
      const row = [];
      for (let x = 0; x < mapSize; x++) {
        // Border walls
        if (x === 0 || x === mapSize - 1 || y === 0 || y === mapSize - 1) {
          row.push('#');
        }
        // Start with mostly walls (70% chance)
        else if (Math.random() < 0.7) {
          row.push('#');
        }
        // Some open spaces
        else {
          row.push('.');
        }
      }
      map.push(row);
    }
    
    // Apply cellular automata to create maze-like structure
    for (let iteration = 0; iteration < 3; iteration++) {
      const newMap = [];
      for (let y = 0; y < mapSize; y++) {
        const row = [];
        for (let x = 0; x < mapSize; x++) {
          if (x === 0 || x === mapSize - 1 || y === 0 || y === mapSize - 1) {
            row.push('#');
          } else {
            // Count walls in 3x3 neighborhood
            let wallCount = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const ny = y + dy;
                const nx = x + dx;
                if (ny >= 0 && ny < mapSize && nx >= 0 && nx < mapSize && map[ny][nx] === '#') {
                  wallCount++;
                }
              }
            }
            
            // Rules for cellular automata
            if (map[y][x] === '#') {
              // Wall becomes floor if surrounded by few walls
              row.push(wallCount <= 4 ? '.' : '#');
            } else {
              // Floor becomes wall if surrounded by many walls
              row.push(wallCount >= 5 ? '#' : '.');
            }
          }
        }
        newMap.push(row);
      }
      
      // Copy new map back
      for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
          map[y][x] = newMap[y][x];
        }
      }
    }
    
    // Add some strategic corridors
    for (let i = 2; i < mapSize - 2; i += 3) {
      // Horizontal corridors
      for (let x = 2; x < mapSize - 2; x++) {
        if (Math.random() < 0.3) {
          map[i][x] = '.';
        }
      }
      // Vertical corridors
      for (let y = 2; y < mapSize - 2; y++) {
        if (Math.random() < 0.3) {
          map[y][i] = '.';
        }
      }
    }
    
    // Ensure some connectivity by creating paths
    for (let y = 2; y < mapSize - 2; y += 2) {
      for (let x = 2; x < mapSize - 2; x += 2) {
        if (Math.random() < 0.4) {
          // Create small open areas
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny > 0 && ny < mapSize - 1 && nx > 0 && nx < mapSize - 1) {
                map[ny][nx] = '.';
              }
            }
          }
        }
      }
    }
    
    return map;
  };

  const isMapValid = (map) => {
    // Use flood fill to check if player can reach at least 50% of the map
    const visited = new Set();
    const queue = [{ x: 1, y: 1 }];
    const totalAccessibleCells = (mapSize - 2) * (mapSize - 2); // Excluding borders
    const minRequiredCells = Math.floor(totalAccessibleCells * 0.3); // At least 30% accessible
    
    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // Check all 4 directions
      const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }  // left
      ];
      
      for (const { dx, dy } of directions) {
        const newX = x + dx;
        const newY = y + dy;
        
        if (newX > 0 && newX < mapSize - 1 && 
            newY > 0 && newY < mapSize - 1 && 
            map[newY][newX] === '.' && 
            !visited.has(`${newX},${newY}`)) {
          queue.push({ x: newX, y: newY });
        }
      }
    }
    
    const accessibleCells = visited.size;
    
    // Additional check: ensure we have enough accessible positions for spawning
    const accessiblePositions = getAccessiblePositions(map);
    const minSpawnPositions = 10; // Minimum positions needed for drones and fragments
    
    console.log(`Map validation: ${accessibleCells}/${totalAccessibleCells} cells accessible (${Math.round(accessibleCells/totalAccessibleCells*100)}%), ${accessiblePositions.length} spawn positions available`);
    
    return accessibleCells >= minRequiredCells && accessiblePositions.length >= minSpawnPositions;
  };

  const generateFallbackMap = () => {
    // Create a simple, guaranteed valid map
    const fallbackMap = [];
    for (let y = 0; y < mapSize; y++) {
      const row = [];
      for (let x = 0; x < mapSize; x++) {
        // Border walls
        if (x === 0 || x === mapSize - 1 || y === 0 || y === mapSize - 1) {
          row.push('#');
        }
        // Create corridors and open areas
        else if (x % 3 === 0 || y % 3 === 0) {
          row.push('.'); // Corridors
        }
        // Some random obstacles (10% chance)
        else if (Math.random() < 0.1) {
          row.push('#');
        }
        // Empty space
        else {
          row.push('.');
        }
      }
      fallbackMap.push(row);
    }
    
    // Ensure player starting position is clear
    fallbackMap[1][1] = '.';
    console.log('Fallback map generated');
    return fallbackMap;
  };

  const getViewportBounds = (playerPosition) => {
    const halfViewport = Math.floor(viewportSize / 2);
    const startX = Math.max(0, playerPosition.x - halfViewport);
    const endX = Math.min(mapSize - 1, playerPosition.x + halfViewport + 1);
    const startY = Math.max(0, playerPosition.y - halfViewport);
    const endY = Math.min(mapSize - 1, playerPosition.y + halfViewport + 1);
    
    return { startX, endX, startY, endY };
  };

  // Check if a position is accessible from the player's starting position
  const isPositionAccessible = (x, y, currentMap) => {
    if (currentMap[y][x] === '#') return false;
    
    // Use flood fill to check if position is reachable from player start
    const visited = new Set();
    const queue = [{ x: 1, y: 1 }]; // Player starting position
    
    while (queue.length > 0) {
      const { x: currentX, y: currentY } = queue.shift();
      const key = `${currentX},${currentY}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // Check if we reached the target position
      if (currentX === x && currentY === y) {
        return true;
      }
      
      // Check all 4 directions
      const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }  // left
      ];
      
      for (const { dx, dy } of directions) {
        const newX = currentX + dx;
        const newY = currentY + dy;
        
        if (newX >= 0 && newX < mapSize && newY >= 0 && newY < mapSize) {
          if (currentMap[newY] && currentMap[newY][newX] === '.' && !visited.has(`${newX},${newY}`)) {
            queue.push({ x: newX, y: newY });
          }
        }
      }
    }
    
    return false;
  };

  // Get all accessible positions on the map
  const getAccessiblePositions = (currentMap) => {
    const accessiblePositions = [];
    const visited = new Set();
    const queue = [{ x: 1, y: 1 }]; // Player starting position
    
    while (queue.length > 0) {
      const { x: currentX, y: currentY } = queue.shift();
      const key = `${currentX},${currentY}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // Add to accessible positions if it's not the player start
      if (!(currentX === 1 && currentY === 1)) {
        accessiblePositions.push({ x: currentX, y: currentY });
      }
      
      // Check all 4 directions
      const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }  // left
      ];
      
      for (const { dx, dy } of directions) {
        const newX = currentX + dx;
        const newY = currentY + dy;
        
        if (newX >= 0 && newX < mapSize && newY >= 0 && newY < mapSize) {
          if (currentMap[newY] && currentMap[newY][newX] === '.' && !visited.has(`${newX},${newY}`)) {
            queue.push({ x: newX, y: newY });
          }
        }
      }
    }
    
    return accessiblePositions;
  };

  const spawnDrones = (count = 3, currentMap) => {
    const newDrones = [];
    const accessiblePositions = getAccessiblePositions(currentMap);
    
    console.log(`Spawning ${count} drones from ${accessiblePositions.length} accessible positions`);
    
    for (let i = 0; i < count; i++) {
      if (accessiblePositions.length === 0) {
        console.warn('No accessible positions for drone spawning');
        break;
      }
      
      // Pick a random accessible position
      const randomIndex = Math.floor(Math.random() * accessiblePositions.length);
      const { x, y } = accessiblePositions.splice(randomIndex, 1)[0]; // Remove used position
      
      newDrones.push({
        id: i,
        x,
        y,
        direction: Math.floor(Math.random() * 4), // 0: up, 1: right, 2: down, 3: left
        speed: 1.5 + difficulty * 0.8, // Increased base speed and scaling
        detectionRange: 4 + Math.floor(difficulty * 1.5), // Increased detection range
        lastSeenPlayer: null,
        isChasing: false
      });
    }
    return newDrones;
  };

  const spawnFragments = (count = 5, currentMap) => {
    const newFragments = [];
    const accessiblePositions = getAccessiblePositions(currentMap);
    
    console.log(`Spawning ${count} fragments from ${accessiblePositions.length} accessible positions`);
    
    for (let i = 0; i < count; i++) {
      if (accessiblePositions.length === 0) {
        console.warn('No accessible positions for fragment spawning');
        break;
      }
      
      // Pick a random accessible position
      const randomIndex = Math.floor(Math.random() * accessiblePositions.length);
      const { x, y } = accessiblePositions.splice(randomIndex, 1)[0]; // Remove used position
      
      newFragments.push({
        id: `fragment-${i}`,
        x,
        y,
        type: Math.random() > 0.7 ? 'rare' : 'common'
      });
    }
    return newFragments;
  };

  const movePlayer = (dx, dy) => {
    console.log('movePlayer called with:', dx, dy, 'Game state:', gameStateRef.current);
    if (gameStateRef.current !== 'playing') {
      console.log('movePlayer: Game not in playing state');
      return;
    }
    if (!mapRef.current || mapRef.current.length === 0) {
      console.log('movePlayer: Map not ready, map ref:', mapRef.current);
      return; // Safety check
    }
    
    const currentPos = playerPosRef.current;
    const newX = currentPos.x + dx;
    const newY = currentPos.y + dy;
    
    console.log('Current position:', currentPos, 'Attempting to move to:', newX, newY);
    
    // Check bounds and obstacles
    if (newX >= 0 && newX < mapSize && newY >= 0 && newY < mapSize && mapRef.current[newY] && mapRef.current[newY][newX] !== '#') {
      console.log('Move successful, updating position from', currentPos, 'to', { x: newX, y: newY });
      const newPos = { x: newX, y: newY };
      setPlayerPos(newPos);
      playerPosRef.current = newPos; // Update ref immediately
      setLastRoute(prev => [...prev, { x: newX, y: newY, time: gameTime }]);
      
      // Check for fragment collection
      const fragmentAtPosition = fragmentsRef.current.find(f => f.x === newX && f.y === newY);
      console.log('Checking for fragments at position:', newX, newY, 'Available fragments:', fragmentsRef.current.map(f => `(${f.x}, ${f.y})`));
      if (fragmentAtPosition) {
        console.log('Fragment collected:', fragmentAtPosition.type, 'at position:', newX, newY);
        console.log('Current fragments before collection:', fragmentsRef.current.length);
        setFragments(prev => {
          const newFragments = prev.filter(f => f.id !== fragmentAtPosition.id);
          console.log('Fragments after collection:', newFragments.length);
          return newFragments;
        });
        setMemoryFragments(prev => {
          const newCount = prev + (fragmentAtPosition.type === 'rare' ? 3 : 1);
          console.log('Memory fragments updated:', prev, '->', newCount);
          return newCount;
        });
        
        // Show collection effect
        setExplosionPos({ x: newX, y: newY, type: 'collection' });
        setTimeout(() => {
          setExplosionPos(null);
        }, 300);
      }
    } else {
      console.log('Move blocked by bounds or obstacle');
    }
  };

  const moveDrones = () => {
    if (!mapRef.current || mapRef.current.length === 0) return; // Safety check
    
    const currentPlayerPos = playerPosRef.current;
    
    setDrones(prev => prev.map(drone => {
      const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }  // left
      ];
      
      let newDirection = drone.direction;
      let newX = drone.x;
      let newY = drone.y;
      
      // Check if player is in detection range
      const currentPlayerPos = playerPosRef.current;
      const distanceToPlayer = Math.sqrt(
        Math.pow(currentPlayerPos.x - drone.x, 2) + Math.pow(currentPlayerPos.y - drone.y, 2)
      );
      
      if (distanceToPlayer <= drone.detectionRange * 2) {
        // Chase mode - move towards player
        const dx = currentPlayerPos.x - drone.x;
        const dy = currentPlayerPos.y - drone.y;
        
        // Determine best direction to move towards player
        let bestDirection = drone.direction;
        if (Math.abs(dx) > Math.abs(dy)) {
          bestDirection = dx > 0 ? 1 : 3; // right or left
        } else {
          bestDirection = dy > 0 ? 2 : 0; // down or up
        }
        
        // Try to move in the best direction
        const dir = directions[bestDirection];
        const nextX = drone.x + dir.dx;
        const nextY = drone.y + dir.dy;
        
        if (nextX > 0 && nextX < mapSize - 1 && nextY > 0 && nextY < mapSize - 1 && mapRef.current[nextY][nextX] !== '#') {
          newX = nextX;
          newY = nextY;
          newDirection = bestDirection;
        } else {
          // Try alternative directions if best direction is blocked
          for (let i = 0; i < 4; i++) {
            const altDir = directions[i];
            const altX = drone.x + altDir.dx;
            const altY = drone.y + altDir.dy;
            if (altX > 0 && altX < mapSize - 1 && altY > 0 && altY < mapSize - 1 && mapRef.current[altY][altX] !== '#') {
              newX = altX;
              newY = altY;
              newDirection = i;
              break;
            }
          }
        }
      } else {
        // Patrol mode - move in current direction
        const dir = directions[drone.direction];
        const nextX = drone.x + dir.dx;
        const nextY = drone.y + dir.dy;
        
        if (nextX > 0 && nextX < mapSize - 1 && nextY > 0 && nextY < mapSize - 1 && mapRef.current[nextY][nextX] !== '#') {
          newX = nextX;
          newY = nextY;
        } else {
          // Hit wall, change direction randomly
          newDirection = Math.floor(Math.random() * 4);
        }
      }
      
      const updatedDrone = { ...drone, x: newX, y: newY, direction: newDirection };
      
      // Check for collision with player
      if (newX === currentPlayerPos.x && newY === currentPlayerPos.y) {
        console.log('DRONE COLLISION! Player destroyed at position:', currentPlayerPos);
        setExplosionPos({ x: newX, y: newY });
        
        // Remove the colliding drone
        setDrones(prev => prev.filter(d => d.id !== drone.id));
        
        setTimeout(() => {
          endGame();
        }, 800); // Delay to show explosion animation
      }
      
      return updatedDrone;
    }));
  };

  const checkDetection = () => {
    if (!mapRef.current || mapRef.current.length === 0) return; // Safety check
    
    const currentPlayerPos = playerPosRef.current;
    for (const drone of drones) {
      const distance = Math.sqrt(
        Math.pow(currentPlayerPos.x - drone.x, 2) + Math.pow(currentPlayerPos.y - drone.y, 2)
      );
      
      if (distance <= drone.detectionRange) {
        // Check line of sight
        const dx = currentPlayerPos.x - drone.x;
        const dy = currentPlayerPos.y - drone.y;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        
        let hasLineOfSight = true;
        for (let i = 1; i < steps; i++) {
          const checkX = drone.x + Math.round((dx / steps) * i);
          const checkY = drone.y + Math.round((dy / steps) * i);
          if (mapRef.current[checkY][checkX] === '#') {
            hasLineOfSight = false;
            break;
          }
        }
        
        if (hasLineOfSight) {
          setDetectionLevel(prev => Math.min(100, prev + 10));
          if (detectionLevel >= 100) {
            endGame();
          }
        }
      }
    }
  };

  const advanceToNextLevel = () => {
    console.log('Advancing to level:', currentLevelRef.current + 1);
    const nextLevel = currentLevelRef.current + 1;
    setCurrentLevel(nextLevel);
    currentLevelRef.current = nextLevel;
    
    // Calculate progressive difficulty
    const baseDrones = 8;
    const baseFragments = 12;
    const droneIncrease = Math.floor(nextLevel * 1.5); // Increase drones by 1.5 per level
    const fragmentIncrease = Math.floor(nextLevel * 2); // Increase fragments by 2 per level
    
    const newDroneCount = baseDrones + droneIncrease;
    const newFragmentCount = baseFragments + fragmentIncrease;
    
    console.log(`Level ${nextLevel}: ${newDroneCount} drones, ${newFragmentCount} fragments`);
    
    // Generate new map
    const newMap = generateMap();
    setMap(newMap);
    mapRef.current = newMap;
    
    // Reset player position
    const initialPos = { x: 1, y: 1 };
    setPlayerPos(initialPos);
    playerPosRef.current = initialPos;
    
    // Spawn new drones and fragments with increased difficulty
    setDrones(spawnDrones(newDroneCount, newMap));
    const newFragments = spawnFragments(newFragmentCount, newMap);
    setFragments(newFragments);
    fragmentsRef.current = newFragments;
    
    // Update difficulty
    setDifficulty(nextLevel);
    
    // Reset explosion position
    setExplosionPos(null);
    
    // Show level transition effect
    setShowLevelUp(true);
    setExplosionPos({ x: 1, y: 1, type: 'levelUp' });
    setTimeout(() => {
      setExplosionPos(null);
      setShowLevelUp(false);
    }, 2000);
    
    console.log(`Level ${nextLevel} started with ${newDroneCount} drones and ${newFragmentCount} fragments`);
  };

  const startGame = () => {
    console.log('Starting Null Escape game...');
    setCurrentLevel(1);
    currentLevelRef.current = 1;
    
    const newMap = generateMap();
    console.log('Map generated:', newMap.length, 'x', newMap[0]?.length);
    setMap(newMap);
    mapRef.current = newMap; // Set map ref immediately
    const initialPos = { x: 1, y: 1 };
    setPlayerPos(initialPos);
    playerPosRef.current = initialPos; // Set ref immediately
    setDrones(spawnDrones(8, newMap)); // Base drones for level 1
    const initialFragments = spawnFragments(12, newMap); // Base fragments for level 1
    console.log('Initial fragments spawned:', initialFragments);
    console.log('Fragment positions:', initialFragments.map(f => `(${f.x}, ${f.y})`));
    setFragments(initialFragments);
    fragmentsRef.current = initialFragments; // Set fragmentsRef immediately
    setGameTime(0);
    setSurvivalTime(0);
    setDetectionLevel(0);
    setMemoryFragments(0);
    setLastRoute([{ x: 1, y: 1, time: 0 }]);
    setDifficulty(1);
    setExplosionPos(null);
    
    // Start countdown
    setGameState('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Start the game after countdown
          setGameState('playing');
          
          // Start game loop
          gameLoopRef.current = setInterval(() => {
            setGameTime(prev => prev + 0.1);
            setSurvivalTime(prev => prev + 0.1);
            setDetectionLevel(prev => Math.max(0, prev - 0.5)); // Gradual decay
          }, 100);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameState('gameOver');
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    // Save high score
    const newScore = Math.floor(survivalTime);
    const newHighScores = [...highScores, { score: newScore, fragments: memoryFragments, time: Date.now() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setHighScores(newHighScores);
    localStorage.setItem('nullEscapeHighScores', JSON.stringify(newHighScores));
  };

  const resetGame = () => {
    setGameState('menu');
    setExplosionPos(null);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  };

  // Handle keyboard input
  useEffect(() => {
    console.log('Setting up keyboard event listener');
    
    const handleKeyPress = (e) => {
      console.log('Key pressed:', e.key, 'Game state:', gameStateRef.current);
      
      // Test key to verify event listener is working
      if (e.key === 't' || e.key === 'T') {
        console.log('Test key pressed - event listener is working!');
        return;
      }
      
      if (gameStateRef.current !== 'playing') {
        console.log('Game not in playing state, ignoring key press');
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          e.preventDefault();
          console.log('Moving up');
          movePlayer(0, -1);
          break;
        case 's':
        case 'arrowdown':
          e.preventDefault();
          console.log('Moving down');
          movePlayer(0, 1);
          break;
        case 'a':
        case 'arrowleft':
          e.preventDefault();
          console.log('Moving left');
          movePlayer(-1, 0);
          break;
        case 'd':
        case 'arrowright':
          e.preventDefault();
          console.log('Moving right');
          movePlayer(1, 0);
          break;
        default:
          console.log('Unhandled key:', e.key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    console.log('Keyboard event listener added');
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      console.log('Keyboard event listener removed');
    };
  }, []);

  // Game loop for drone movement and detection
  useEffect(() => {
    if (gameState === 'playing') {
      const droneInterval = setInterval(() => {
        moveDrones();
        checkDetection();
      }, 500 / difficulty);
      
      return () => clearInterval(droneInterval);
    }
  }, [gameState, difficulty, map, playerPos]);

  // Check for memory fragment collection
  useEffect(() => {
    if (gameState === 'playing' && survivalTime > 0) {
      const fragmentInterval = Math.floor(survivalTime / 30); // Every 30 seconds
      if (fragmentInterval > memoryFragments) {
        setMemoryFragments(fragmentInterval);
      }
    }
  }, [survivalTime, gameState, memoryFragments]);

  // Increase difficulty over time
  useEffect(() => {
    if (gameState === 'playing') {
      setDifficulty(1 + Math.floor(survivalTime / 60)); // Increase every minute
    }
  }, [survivalTime, gameState]);

  const renderMenu = () => (
    <div className="null-escape-menu">
      <div className="menu-header">
        <h2 className="glitch-text" data-text="NULL_ESCAPE">NULL_ESCAPE</h2>
        <p className="menu-subtitle">Neural Network Infiltration Protocol</p>
      </div>
      
      <div className="game-description">
        <p><strong>Mission:</strong> Navigate the endless digital maze undetected.</p>
        <p><strong>Controls:</strong> WASD or Arrow Keys</p>
        <p><strong>Objective:</strong> Collect all fragments to advance to the next level.</p>
        <p><strong>Progression:</strong> Each level increases enemies and fragments.</p>
        <p><strong>Fragments:</strong> 💿 Common (1 point) | 💎 Rare (3 points)</p>
        <p><strong>Warning:</strong> AI drones patrol the vast network. Stay out of their line of sight.</p>
      </div>
      
      <button className="start-btn" onClick={startGame}>
        INITIATE INFILTRATION
      </button>
      
      <div className="high-scores">
        <h3>Neural Trace Logs</h3>
        <div className="scores-list">
          {highScores.slice(0, 5).map((score, index) => (
            <div key={index} className="score-entry">
              <span className="score-rank">#{index + 1}</span>
              <span className="score-value">{score.score}s</span>
              <span className="score-fragments">{score.fragments} fragments</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="null-escape-game">
      <div className="game-header">
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">SURVIVAL:</span>
            <span className="stat-value">{Math.floor(survivalTime)}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">LEVEL:</span>
            <span className="stat-value">{currentLevel}</span>
          </div>
          <div className="stat">
            <span className="stat-label">FRAGMENTS:</span>
            <span className="stat-value">{memoryFragments}</span>
          </div>
          <div className="stat">
            <span className="stat-label">REMAINING:</span>
            <span className="stat-value">{fragments.length}</span>
          </div>
        </div>
      </div>

      <div className="game-area" ref={gameAreaRef}>
        <div className="ascii-map">
          {map && map.length > 0 ? (() => {
            const currentPlayerPos = playerPosRef.current;
            const viewport = getViewportBounds(currentPlayerPos);
            
            return map.slice(viewport.startY, viewport.endY).map((row, y) => (
              <div key={y + viewport.startY} className="map-row">
                {row.slice(viewport.startX, viewport.endX).map((cell, x) => {
                  const actualX = x + viewport.startX;
                  const actualY = y + viewport.startY;
                  let content = cell;
                  let className = 'map-cell';
                  
                  // Check for explosion effect
                  if (explosionPos && actualX === explosionPos.x && actualY === explosionPos.y) {
                    if (explosionPos.type === 'collection') {
                      content = '✨';
                      className += ' collection-effect';
                    } else if (explosionPos.type === 'levelUp') {
                      content = '🌟';
                      className += ' level-up-effect';
                    } else {
                      content = '💥';
                      className += ' explosion';
                    }
                  } else if (actualX === currentPlayerPos.x && actualY === currentPlayerPos.y) {
                    content = '☠️';
                    className += ' player';
                  } else {
                    // Check if any drone is at this position
                    const drone = drones.find(d => d.x === actualX && d.y === actualY);
                    if (drone) {
                      // Check if drone is chasing player
                      const distanceToPlayer = Math.sqrt(
                        Math.pow(currentPlayerPos.x - drone.x, 2) + Math.pow(currentPlayerPos.y - drone.y, 2)
                      );
                      const isChasing = distanceToPlayer <= drone.detectionRange * 0.5;
                      
                      content = isChasing ? '🔥' : '(O)';
                      className += isChasing ? ' drone-chasing' : ' drone';
                    } else {
                      // Check if any fragment is at this position
                      const fragment = fragments.find(f => f.x === actualX && f.y === actualY);
                      if (fragment) {
                        content = fragment.type === 'rare' ? '💎' : '💿';
                        className += fragment.type === 'rare' ? ' fragment-rare' : ' fragment-common';
                      } else if (cell === '#') {
                        // Wall styling
                        content = '[]';
                        className += ' wall';
                      }
                    }
                  }
                  
                  return (
                    <span key={actualX} className={className}>
                      {content}
                    </span>
                  );
                })}
              </div>
            ));
          })() : (
            <div className="loading-map">Loading map...</div>
          )}
        </div>
        </div>

      <div className="detection-bar">
        <div 
          className="detection-fill" 
          style={{ width: `${detectionLevel}%` }}
        />
      </div>
      
      {/* Level Up Notification */}
      {showLevelUp && (
        <div className="level-up-notification">
          <div className="level-up-content">
            <h3>LEVEL {currentLevel} COMPLETE!</h3>
            <p>Advancing to Level {currentLevel + 1}</p>
            <p>Enemies: +{Math.floor(currentLevel * 1.5)} | Fragments: +{Math.floor(currentLevel * 2)}</p>
          </div>
        </div>
      )}
      
      {/* Mobile Controls */}
      <div className="mobile-controls">
        <div className="control-row">
          <button 
            className="control-btn up-btn" 
            onTouchStart={(e) => { e.preventDefault(); movePlayer(0, -1); }}
            onMouseDown={(e) => { e.preventDefault(); movePlayer(0, -1); }}
          >
            ↑
          </button>
        </div>
        <div className="control-row">
          <button 
            className="control-btn left-btn" 
            onTouchStart={(e) => { e.preventDefault(); movePlayer(-1, 0); }}
            onMouseDown={(e) => { e.preventDefault(); movePlayer(-1, 0); }}
          >
            ←
          </button>
          <button 
            className="control-btn down-btn" 
            onTouchStart={(e) => { e.preventDefault(); movePlayer(0, 1); }}
            onMouseDown={(e) => { e.preventDefault(); movePlayer(0, 1); }}
          >
            ↓
          </button>
          <button 
            className="control-btn right-btn" 
            onTouchStart={(e) => { e.preventDefault(); movePlayer(1, 0); }}
            onMouseDown={(e) => { e.preventDefault(); movePlayer(1, 0); }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );

  const renderCountdown = () => (
    <div className="null-escape-countdown">
      <div className="countdown-display">
        <h2 className="countdown-number">{countdown}</h2>
        <p className="countdown-text">GET READY</p>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="null-escape-gameover">
      <div className="gameover-header">
        <h2 className="glitch-text critical" data-text="DESTROYED">DESTROYED</h2>
        <p className="detection-message">Drone collision detected. Neural trace terminated.</p>
        
        <div className="route-map">
          <h3>Last Known Route:</h3>
          <div className="route-display">
            {lastRoute.slice(-20).map((pos, index) => (
              <div key={index} className="route-point" style={{ left: `${(pos.x / mapSize) * 100}%`, top: `${(pos.y / mapSize) * 100}%` }}>
                •
              </div>
            ))}
          </div>
        </div>
        
        <div className="flickering-log">
          <p>=== NEURAL TRACE LOG ===</p>
          <p>Survival Time: {Math.floor(survivalTime)} seconds</p>
          <p>Memory Fragments Collected: {memoryFragments}</p>
          <p>Fragments Remaining: {fragments.length}</p>
          <p>Detection Level: {Math.floor(detectionLevel)}%</p>
          <p>Status: NEURAL TRACE COMPLETE</p>
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
    <div className="null-escape-container">
      <div className="null-escape-modal">
        <div className="modal-header">
          <h2>NULL_ESCAPE v1.0</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {gameState === 'menu' && renderMenu()}
          {gameState === 'countdown' && renderCountdown()}
          {gameState === 'playing' && renderGame()}
          {gameState === 'gameOver' && renderGameOver()}
        </div>
      </div>
    </div>
  );
} 
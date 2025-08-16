import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProgramsAccess() {
  const [currentText, setCurrentText] = useState('');
  const [currentCommand, setCurrentCommand] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const navigate = useNavigate();
  const terminalContentRef = useRef(null);

  // Jenkins-like auto-scroll function - follows each character
  const scrollToBottom = () => {
    if (terminalContentRef.current) {
      const element = terminalContentRef.current;
      // Immediate scroll to bottom for real-time console feel
      element.scrollTop = element.scrollHeight;
    }
  };

  // Auto-scroll whenever text updates (Jenkins-like behavior)
  useEffect(() => {
    scrollToBottom();
  }, [currentText]);

  const commands = [
    { command: 'user@wound.os ~ % $ ssh root@127.0.0.1', output: 'ACCESSING ROOT TERMINAL...' },
    { command: 'root@wound.os ~ % $ ACCESS_PROGRAMS', output: 'INITIALIZING SECURE CONNECTION...' },
    { command: 'root@wound.os ~ % $ VERIFY_CLEARANCE', output: 'CLEARANCE LEVEL 5 CONFIRMED' },
    { command: 'root@wound.os ~ % $ SCAN_SYSTEMS', output: 'SCANNING AVAILABLE PROGRAMS...' }, 
    { command: 'root@wound.os ~ % $ LIST_PROGRAMS', output: 'RETRIEVING PROGRAM DATABASE...' }
  ];

  const programs = [
    'root@wound.os ~ % $ SYSTEM_01 - Neural Interface Protocol [ACTIVE]',
    'root@wound.os ~ % $ SECURITY_02 - Firewall Penetration Test [ACTIVE]',
    'root@wound.os ~ % $ DATA_03 - Encrypted Data Stream [STANDBY]',
    'root@wound.os ~ % $ PROTOCOL_04 - Quantum Encryption Matrix [LOCKED]',
    'root@wound.os ~ % $ NEURAL_05 - Cognitive Enhancement Suite [LOCKED]',
    'root@wound.os ~ % $ CYBER_06 - Digital Warfare Simulator [DEACTIVATED]',
    'root@wound.os ~ % $ QUANTUM_07 - Entanglement Protocol [DEACTIVATED]',
    'root@wound.os ~ % $ BIO_08 - Genetic Algorithm Engine [DEACTIVATED]'
  ];

  useEffect(() => {
    if (currentCommand < commands.length) {
      typeCommand(commands[currentCommand]);
    } else if (currentCommand === commands.length) {
      typePrograms();
    }
  }, [currentCommand]);

  const typeCommand = (commandObj) => {
    let index = 0;
    const fullText = `${commandObj.command}`;
    
    const typeInterval = setInterval(() => {
      if (index <= fullText.length) {
        setCurrentText(fullText.substring(0, index));
        index++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentText(fullText + '\n' + commandObj.output);
          setTimeout(() => {
            setCurrentCommand(currentCommand + 1);
          }, 1000);
        }, 500);
      }
    }, 100);
  };

  const typePrograms = () => {
    let index = 0;
    const programsText = programs.join('\n');
    
    const typeInterval = setInterval(() => {
      if (index <= programsText.length) {
        setCurrentText(prev => {
          const lines = prev.split('\n');
          lines[lines.length - 1] = programsText.substring(0, index);
          return lines.join('\n');
        });
        index++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentText(prev => prev + '\n\nACCESS GRANTED - SELECT OPTION:');
          setShowButtons(true);
        }, 1000);
      }
    }, 50);
  };

  const handleAccess = () => {
    navigate('/programs/blacksite');
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleExit = () => {
    navigate('/');
  };

  // Terminal control handlers
  const handleClose = () => {
    // Go back to previous page or home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMaximized) setIsMaximized(false);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (isMinimized) setIsMinimized(false);
  };

  // Keyboard event handler for number keys
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!showButtons) return; // Only listen when buttons are visible
      
      if (event.key === '1') {
        event.preventDefault();
        handleAccess();
      } else if (event.key === '2') {
        event.preventDefault();
        handleExit();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showButtons]); // Re-run when showButtons changes

  return (
    <div className="programs-access-container">
      <div className={`access-terminal ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}>
        <div className="terminal-header">
          <div className="terminal-controls">
            <span className="control close" onClick={handleClose} title="Close Terminal"></span>
            <span className="control minimize" onClick={handleMinimize} title="Minimize Terminal"></span>
            <span className="control maximize" onClick={handleMaximize} title="Maximize Terminal"></span>
          </div>
          <div className="terminal-title">SECURE TERMINAL - PROGRAMS ACCESS</div>
        </div>
        
        <div className="terminal-body">
          <div className="terminal-content" ref={terminalContentRef}>
            <pre className="terminal-text">{currentText}</pre>
            {showButtons && (
              <div className="access-buttons">
                <button className="access-btn primary" onClick={handleAccess}>
                  [1] ACCESS BLACKSITE PROGRAMS
                </button>
                <button className="access-btn secondary" onClick={handleExit}>
                  [2] EXIT TO HOME
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="access-warning">
        <div className="warning-icon">⚠️</div>
        <div className="warning-text">
          <h3>RESTRICTED ACCESS</h3>
          <p>This area contains classified programs and systems.</p>
          <p>Unauthorized access is strictly prohibited.</p>
        </div>
      </div>
    </div>
  );
} 
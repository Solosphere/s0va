import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMANDS = [
  { command: 'user@mettaire.os ~ % ssh root@127.0.0.1',    output: 'ACCESSING ROOT TERMINAL...' },
  { command: 'root@mettaire.os ~ # access_programs',       output: 'INITIALIZING SECURE CONNECTION...' },
  { command: 'root@mettaire.os ~ # verify_clearance',      output: 'CLEARANCE LEVEL 5 CONFIRMED' },
  { command: 'root@mettaire.os ~ # scan_systems',          output: 'SCANNING AVAILABLE PROGRAMS...' },
  { command: 'root@mettaire.os ~ # list_programs',         output: 'RETRIEVING PROGRAM DATABASE...' },
];

const PROGRAMS = [
  'SYSTEM_01   - Neural Interface Protocol       [ACTIVE]',
  'SECURITY_02 - Neural Network Infiltration     [ACTIVE]',
  'DATA_03     - Terminal Sprint Protocol        [ACTIVE]',
  'PROTOCOL_04 - Quantum Encryption Matrix       [LOCKED]',
  'NEURAL_05   - Cognitive Enhancement Suite     [LOCKED]',
  'CYBER_06    - Digital Warfare Simulator       [DEACTIVATED]',
  'QUANTUM_07  - Entanglement Protocol           [DEACTIVATED]',
  'BIO_08      - Genetic Algorithm Engine        [DEACTIVATED]',
];

const TYPE_MS = 55;      // per-character delay while a command types out
const AFTER_CMD_MS = 220; // pause between the finished command and its output
const AFTER_OUT_MS = 520; // pause between an output line and the next command

export default function ProgramsAccess() {
  // Terminal scrollback: `lines` is the finalized, immutable history (commands
  // + their outputs, one per array slot). `typing` is the single in-progress
  // line whose characters are streaming in. Rendering these two separately —
  // instead of one big string that we mutate — is what keeps the previous
  // commands stable while the newest one streams.
  const [lines, setLines] = useState([]);
  const [typing, setTyping] = useState('');
  const [showButtons, setShowButtons] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const navigate = useNavigate();
  const terminalContentRef = useRef(null);

  // Route entry: always land at the top. Without this, coming in from a
  // scrolled-down page (Home's featured rail, About's blacksite card) leaves
  // the user parked at the previous page's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Follow the freshest character to the bottom of the pane while the terminal
  // scrolls past its own height.
  useEffect(() => {
    const el = terminalContentRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing]);

  // Drive the sequence — type each command char-by-char, drop it into the
  // scrollback, print its output on the next line, then move on. When commands
  // are exhausted, list programs one line at a time and reveal the CTA.
  useEffect(() => {
    let cancelled = false;
    const timers = new Set();

    const wait = (ms) => new Promise((resolve) => {
      const t = setTimeout(() => { timers.delete(t); resolve(); }, ms);
      timers.add(t);
    });

    const typeLine = (text) => new Promise((resolve) => {
      let i = 0;
      const step = () => {
        if (cancelled) return resolve();
        i += 1;
        setTyping(text.slice(0, i));
        if (i >= text.length) return resolve();
        const t = setTimeout(() => { timers.delete(t); step(); }, TYPE_MS);
        timers.add(t);
      };
      if (!text.length) return resolve();
      setTyping('');
      step();
    });

    const commit = (text) =>
      setLines((prev) => (text === undefined ? prev : [...prev, text]));

    const run = async () => {
      for (const c of COMMANDS) {
        if (cancelled) return;
        await typeLine(c.command);
        if (cancelled) return;
        commit(c.command);
        setTyping('');
        await wait(AFTER_CMD_MS);
        if (cancelled) return;
        commit(c.output);
        await wait(AFTER_OUT_MS);
      }
      for (const p of PROGRAMS) {
        if (cancelled) return;
        await typeLine(`  ${p}`);
        if (cancelled) return;
        commit(`  ${p}`);
        setTyping('');
        await wait(120);
      }
      if (cancelled) return;
      commit('');
      commit('ACCESS GRANTED - SELECT OPTION:');
      setShowButtons(true);
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

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
    <div className="programs-access-container programs-hud">
      <div className="programs-frame" aria-hidden="true">
        <span className="programs-frame-corner programs-frame-corner--tl" />
        <span className="programs-frame-corner programs-frame-corner--tr" />
        <span className="programs-frame-corner programs-frame-corner--bl" />
        <span className="programs-frame-corner programs-frame-corner--br" />
      </div>
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
            <pre className="terminal-text">
              {lines.map((l, i) => (
                <span key={i} className="terminal-row">{l || ' '}{'\n'}</span>
              ))}
              {typing.length > 0 && (
                <span className="terminal-row terminal-row--typing">
                  {typing}
                  <span className="terminal-caret" aria-hidden="true">▍</span>
                </span>
              )}
            </pre>
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
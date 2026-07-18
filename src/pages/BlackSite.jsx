import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataSpike from '../games/DataSpike';
import NullEscape from '../games/NullEscape';
import NodeRunner from '../games/NodeRunner';

export default function BlackSite() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Route entry: always land at the top. React Router keeps whatever scroll
  // position the previous page had, so an entry from a scrolled-down page
  // (Home's featured rail, About's blacksite card, or the /programs terminal)
  // would otherwise drop the user at the bottom of this page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Set data-text attributes for glitch effect
  useEffect(() => {
    const headers = document.querySelectorAll('.blacksite-container h1, .blacksite-container h2, .blacksite-container h3');
    headers.forEach(header => {
      header.setAttribute('data-text', header.textContent);
    });

    // Set data-text attributes for program card elements
    const programIcons = document.querySelectorAll('.program-icon');
    programIcons.forEach(icon => {
      icon.setAttribute('data-text', icon.textContent);
    });

    const programDescriptions = document.querySelectorAll('.program-description');
    programDescriptions.forEach(desc => {
      desc.setAttribute('data-text', desc.textContent);
    });

    const accessButtons = document.querySelectorAll('.access-program-btn');
    accessButtons.forEach(btn => {
      btn.setAttribute('data-text', btn.textContent);
    });

    const lockedButtons = document.querySelectorAll('.locked-program-btn');
    lockedButtons.forEach(btn => {
      btn.setAttribute('data-text', btn.textContent);
    });

    // Set data-text attributes for status and clearance elements
    const statusElements = document.querySelectorAll('.status');
    statusElements.forEach(status => {
      status.setAttribute('data-text', status.textContent);
    });

    const clearanceElements = document.querySelectorAll('.clearance');
    clearanceElements.forEach(clearance => {
      clearance.setAttribute('data-text', clearance.textContent);
    });
  }, []);

  // Sample programs/games - you can expand this. The `icon` field is now a
  // mono program-code chip (SYS.01, SEC.03, …) rendered as HUD text — matches
  // the site-wide SEC.0N chip pattern from the engineering log so the arcade
  // reads as part of the same cockpit, not a stock cyberpunk kit.
  const programs = [
    {
      id: 'system-01',
      name: 'SYSTEM_01',
      description: 'Neural Interface Protocol',
      status: 'ACTIVE',
      clearance: 'LEVEL_5',
      icon: 'SYS.01'
    },
    {
      id: 'system-02',
      name: 'SYSTEM_02',
      description: 'Neural Network Infiltration',
      status: 'ACTIVE',
      clearance: 'LEVEL_5',
      icon: 'SYS.02'
    },
    {
      id: 'data-03',
      name: 'DATA_03',
      description: 'Terminal Sprint Protocol',
      status: 'ACTIVE',
      clearance: 'LEVEL_5',
      icon: 'DAT.03'
    },
    {
      id: 'security-04',
      name: 'SECURITY_04',
      description: 'Firewall Penetration Test',
      status: 'LOCKED',
      clearance: 'LEVEL_4',
      icon: 'SEC.04'
    },
    {
      id: 'protocol-05',
      name: 'PROTOCOL_05',
      description: 'Quantum Encryption Matrix',
      status: 'LOCKED',
      clearance: 'LEVEL_7',
      icon: 'PRT.05'
    }
  ];

  const handleProgramClick = (program) => {
    setSelectedProgram(program);
    // Here you can add logic to launch specific games/programs
    console.log('Launching program:', program.name);
  };

  const handleLaunchGame = (program) => {
    if (program.id === 'system-01') {
      setActiveGame('dataSpike');
    } else if (program.id === 'system-02') {
      setActiveGame('nullEscape');
    } else if (program.id === 'data-03') {
      setActiveGame('nodeRunner');
    }
    setSelectedProgram(null);
  };

  // Terminal control handlers
  const handleClose = () => {
    window.location.href = '/';
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMaximized) setIsMaximized(false);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (isMinimized) setIsMinimized(false);
  };

  return (
    <div className="blacksite-container blacksite-hud">
      {/* Perception-window brackets — pinned to the container corners so the
          BlackSite reads as part of the same HUD family as the engineering
          log. Decorative only. */}
      <div className="blacksite-frame" aria-hidden="true">
        <span className="blacksite-frame-corner blacksite-frame-corner--tl" />
        <span className="blacksite-frame-corner blacksite-frame-corner--tr" />
        <span className="blacksite-frame-corner blacksite-frame-corner--bl" />
        <span className="blacksite-frame-corner blacksite-frame-corner--br" />
      </div>
      <div className="blacksite-header">
        <div className={`access-terminal ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}>
          <div className="terminal-header">
            <div className="terminal-controls">
              <div className="control close" onClick={handleClose} title="Close Terminal"></div>
              <div className="control minimize" onClick={handleMinimize} title="Minimize Terminal"></div>
              <div className="control maximize" onClick={handleMaximize} title="Maximize Terminal"></div>
            </div>
            <div className="terminal-title">BLACKSITE_TERMINAL</div>
          </div>
          <div className="terminal-body">
            <div className="terminal-content">
              <div className="terminal-line">
                <span className="prompt">root@blacksite:~#</span>
                <span className="command"> ./init_secure_connection.sh</span>
              </div>
              <div className="terminal-line">
                <span className="output">[+] Establishing encrypted tunnel... DONE</span>
              </div>
              <div className="terminal-line">
                <span className="output">[+] Bypassing firewall... SUCCESS</span>
              </div>
              <div className="terminal-line">
                <span className="output">[+] Authenticating with neural interface... OK</span>
              </div>
              <div className="terminal-line">
                <span className="prompt">root@blacksite:~#</span>
                <span className="command"> sudo access_blacksite --level=5 --neural=true</span>
              </div>
              <div className="terminal-line">
                <span className="output">[SECURITY] Access granted - Clearance Level 5 confirmed</span>
              </div>
              <div className="terminal-line">
                <span className="output">[SYSTEM] Neural link established - Direct brain interface active</span>
              </div>
              <div className="terminal-line">
                <span className="prompt">root@blacksite:~#</span>
                <span className="command"> ls -la /programs/classified/</span>
              </div>
              <div className="terminal-line">
                <span className="output">[+] Scanning classified program database...</span>
              </div>
              <div className="terminal-line">
                <span className="output">[+] Found 5 classified programs in neural network</span>
              </div>
              <div className="terminal-line">
                <span className="prompt">root@blacksite:~#</span>
                <span className="command"> cat /programs/classified/status.log</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="programs-grid">
        {programs.map((program) => (
          <div
            key={program.id}
            className={`program-card ${program.status.toLowerCase()}`}
            onClick={() => handleProgramClick(program)}
          >
            <div className="program-icon">{program.icon}</div>
            <div className="program-info">
              <h3 className="program-name">{program.name}</h3>
              <p className="program-description">{program.description}</p>
              <div className="program-meta">
                <div className="program-meta-left">
                  <span className={`status ${program.status.toLowerCase()}`}>
                    {program.status}
                  </span>
                  {program.status === 'ACTIVE' ? (
                    <button 
                      className="access-program-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProgramClick(program);
                      }}
                    >
                      ACCESS
                    </button>
                  ) : (
                    <button 
                      className="locked-program-btn"
                      disabled
                    >
                      LOCKED
                    </button>
                  )}
                </div>
                <span className="clearance">{program.clearance}</span>
              </div>
            </div>
            <div className="program-overlay">
              <span className="access-text">ACCESS PROGRAM</span>
            </div>
          </div>
        ))}
      </div>

      {selectedProgram && (
        <div className="program-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedProgram.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedProgram(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{selectedProgram.description}</p>
              <div className="program-details">
                <p><strong>Status:</strong> {selectedProgram.status}</p>
                <p><strong>Clearance Required:</strong> {selectedProgram.clearance}</p>
              </div>
              <div className="launch-section">
                <button className="launch-btn" onClick={() => handleLaunchGame(selectedProgram)}>
                  LAUNCH {selectedProgram.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="blacksite-footer">
        <div className="system-status">
          <span className="status-indicator active"></span>
          <span>SYSTEM STATUS: OPERATIONAL</span>
        </div>
        <div className="access-log">
          <span>LAST ACCESS: {new Date().toLocaleString()}</span>
        </div>
      </div>

              {/* Game Components */}
        {activeGame === 'dataSpike' && (
          <DataSpike onClose={() => setActiveGame(null)} />
        )}
        {activeGame === 'nullEscape' && (
          <NullEscape onClose={() => setActiveGame(null)} />
        )}
        {activeGame === 'nodeRunner' && (
          <NodeRunner onClose={() => setActiveGame(null)} />
        )}
    </div>
  );
} 
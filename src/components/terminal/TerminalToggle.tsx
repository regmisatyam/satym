'use client';

import React from 'react';
import { useTerminalMode } from './TerminalProvider';
import { FiTerminal, FiMonitor } from 'react-icons/fi';

export default function TerminalToggle() {
  const { uiMode, toggleMode } = useTerminalMode();

  return (
    <button
      onClick={toggleMode}
      className="fixed top-4 right-4 z-[9999] flex items-center gap-2 px-3 py-2 rounded-full bg-dark-secondary/90 backdrop-blur-md border border-dark-accent text-dark-text hover:border-highlight-primary hover:text-highlight-primary transition-all duration-300 shadow-lg group"
      aria-label={uiMode === 'browse' ? 'Switch to Terminal Mode' : 'Switch to Browse Mode'}
      title={uiMode === 'browse' ? 'Terminal Mode' : 'Browse Mode'}
    >
      {uiMode === 'browse' ? (
        <>
          <FiTerminal size={16} className="group-hover:text-highlight-primary" />
          <span className="text-xs font-mono hidden sm:inline">Terminal</span>
        </>
      ) : (
        <>
          <FiMonitor size={16} className="group-hover:text-highlight-primary" />
          <span className="text-xs font-mono hidden sm:inline">Browse</span>
        </>
      )}
    </button>
  );
}

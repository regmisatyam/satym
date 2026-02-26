'use client';

import React from 'react';
import { FiMonitor, FiTerminal } from 'react-icons/fi';

interface ModeChooserProps {
  onChoose: (mode: 'browse' | 'terminal') => void;
}

export default function ModeChooser({ onChoose }: ModeChooserProps) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black backdrop-blur-md p-4">
      <div className="bg-dark-secondary/95 border border-dark-accent rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 animate-fade-in">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-highlight-primary to-purple-500 bg-clip-text text-transparent">
            Welcome!
          </h2>
          <p className="text-dark-muted mt-2 text-sm">
            How would you like to explore my portfolio?
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-row gap-4 justify-center items-center">
          {/* Browse / Webview */}
          <button
            onClick={() => onChoose('browse')}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-dark-accent bg-dark-primary hover:border-highlight-primary hover:bg-highlight-primary/10 transition-all duration-300"
          >
            <div className="p-4 rounded-full bg-highlight-primary/20 text-highlight-primary group-hover:scale-110 transition-transform">
              <FiMonitor size={28} />
            </div>
            <span className="font-semibold text-dark-text">Webview</span>
            <span className="text-xs text-dark-muted leading-tight">
              Classic website with visuals &amp; animations
            </span>
          </button>

          {/* Terminal */}
          <button
            onClick={() => onChoose('terminal')}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-dark-accent bg-dark-primary hover:border-green-500 hover:bg-green-500/10 transition-all duration-300"
          >
            <div className="p-4 rounded-full bg-green-500/20 text-green-400 group-hover:scale-110 transition-transform">
              <FiTerminal size={28} />
            </div>
            <span className="font-semibold text-dark-text">Terminal</span>
            <span className="text-xs text-dark-muted leading-tight">
              Command-line interface — type to navigate
            </span>
          </button>
        </div>

        <p className="text-[11px] text-dark-muted">
          You can switch anytime using the button in the top-right corner.
        </p>
      </div>
    </div>
  );
}

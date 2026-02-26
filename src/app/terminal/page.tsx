'use client';

import TerminalShell from '@/components/terminal/TerminalShell';
import Link from 'next/link';
import { FiArrowLeft, FiMonitor } from 'react-icons/fi';

export default function TerminalPage() {
  const handleSwitchToBrowse = () => {
    localStorage.setItem('uiMode', 'browse');
  };

  return (
    <main className="h-screen flex flex-col bg-dark-primary">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-secondary/80 border-b border-dark-accent shrink-0">
        <Link
          href="/"
          onClick={handleSwitchToBrowse}
          className="flex items-center gap-2 text-dark-muted hover:text-highlight-primary transition-colors text-sm"
        >
          <FiArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Site</span>
        </Link>

        <span className="text-sm text-dark-muted font-mono select-none">
          satyam@portfolio
        </span>

        <Link
          href="/"
          onClick={handleSwitchToBrowse}
          className="flex items-center gap-2 text-dark-muted hover:text-highlight-primary transition-colors text-sm"
        >
          <FiMonitor size={16} />
          <span className="hidden sm:inline">Browse Mode</span>
        </Link>
      </div>

      {/* Terminal */}
      <div className="flex-1 p-2 sm:p-4 min-h-0">
        <TerminalShell />
      </div>
    </main>
  );
}

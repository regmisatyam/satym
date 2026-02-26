'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTerminalEngine } from '@/hooks/useTerminalEngine';
import TerminalOutput from './TerminalOutput';
import type { TerminalTheme } from '@/hooks/useTerminalEngine';

const themeClasses: Record<TerminalTheme, { bg: string; text: string; border: string; prompt: string; header: string }> = {
  dark: {
    bg: 'bg-[#0d1117]',
    text: 'text-gray-200',
    border: 'border-gray-700',
    prompt: 'text-green-400',
    header: 'bg-[#161b22]',
  },
  light: {
    bg: 'bg-gray-100',
    text: 'text-gray-900',
    border: 'border-gray-300',
    prompt: 'text-indigo-600',
    header: 'bg-gray-200',
  },
  matrix: {
    bg: 'bg-black',
    text: 'text-green-400',
    border: 'border-green-900',
    prompt: 'text-green-300',
    header: 'bg-green-950',
  },
};

export default function TerminalShell() {
  const {
    lines,
    history,
    historyIndex,
    setHistoryIndex,
    theme,
    execute,
    getPrompt,
    getAutocomplete,
  } = useTerminalEngine();

  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [localHistoryIdx, setLocalHistoryIdx] = useState(-1);

  // Scroll to bottom on new lines
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      execute(input);
      setInput('');
      setLocalHistoryIdx(-1);
    },
    [input, execute]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const result = getAutocomplete(input);
        if (result) {
          setInput(result);
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length === 0) return;
        const newIdx = localHistoryIdx === -1 ? history.length - 1 : Math.max(0, localHistoryIdx - 1);
        setLocalHistoryIdx(newIdx);
        setInput(history[newIdx]);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (localHistoryIdx === -1) return;
        const newIdx = localHistoryIdx + 1;
        if (newIdx >= history.length) {
          setLocalHistoryIdx(-1);
          setInput('');
        } else {
          setLocalHistoryIdx(newIdx);
          setInput(history[newIdx]);
        }
        return;
      }

      if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        execute('clear');
        return;
      }
    },
    [input, history, localHistoryIdx, getAutocomplete, execute]
  );

  const tc = themeClasses[theme];
  const prompt = getPrompt();

  return (
    <div
      className={`flex flex-col h-full w-full ${tc.bg} ${tc.text} font-mono text-sm rounded-lg border ${tc.border} overflow-hidden shadow-2xl`}
      onClick={handleContainerClick}
      role="application"
      aria-label="Terminal emulator"
    >
      {/* Terminal header */}
      <div className={`flex items-center px-4 py-2 ${tc.header} border-b ${tc.border} shrink-0`}>
        <div className="flex gap-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs opacity-60 select-none">satyam@portfolio — terminal</span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0"
        style={{ scrollBehavior: 'smooth' }}
      >
        {lines.map((line) => (
          <div key={line.id} className="space-y-0.5">
            {line.prompt && (
              <div className="flex gap-2 flex-wrap">
                <span className={`${tc.prompt} shrink-0 select-none`}>{line.prompt}</span>
                <span className="text-white">{line.input}</span>
              </div>
            )}
            <div className="pl-0 md:pl-1">
              <TerminalOutput tokens={line.tokens} />
            </div>
          </div>
        ))}

        {/* Active input line */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className={`${tc.prompt} shrink-0 select-none`}>{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent outline-none border-none ${tc.text} caret-green-400 min-w-0`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command input"
          />
        </form>
      </div>
    </div>
  );
}

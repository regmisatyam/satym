'use client';

import React from 'react';
import type { OutputToken } from '@/hooks/useTerminalEngine';

interface TerminalOutputProps {
  tokens: OutputToken[];
}

export default function TerminalOutput({ tokens }: TerminalOutputProps) {
  return (
    <>
      {tokens.map((token, i) => {
        switch (token.type) {
          case 'text':
            return (
              <div key={i} className="whitespace-pre-wrap break-words">
                {token.value || '\u00A0'}
              </div>
            );
          case 'error':
            return (
              <div key={i} className="text-red-400 whitespace-pre-wrap break-words">
                {token.value}
              </div>
            );
          case 'cyan':
            return (
              <div key={i} className="text-cyan-400 font-semibold whitespace-pre-wrap break-words">
                {token.value}
              </div>
            );
          case 'green':
            return (
              <div key={i} className="text-green-400 whitespace-pre-wrap break-words">
                {token.value}
              </div>
            );
          case 'yellow':
            return (
              <div key={i} className="text-yellow-400 font-semibold whitespace-pre-wrap break-words">
                {token.value}
              </div>
            );
          case 'command':
            return (
              <div key={i} className="text-highlight-primary whitespace-pre-wrap break-words">
                {token.value}
              </div>
            );
          case 'link':
            return (
              <a
                key={i}
                href={token.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-highlight-primary hover:text-highlight-secondary underline underline-offset-2 break-all"
              >
                {token.label}
              </a>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

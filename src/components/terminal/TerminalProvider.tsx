'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type UIMode = 'browse' | 'terminal';

interface TerminalContextValue {
  uiMode: UIMode;
  toggleMode: () => void;
  setMode: (mode: UIMode) => void;
}

const TerminalContext = createContext<TerminalContextValue>({
  uiMode: 'browse',
  toggleMode: () => {},
  setMode: () => {},
});

export function useTerminalMode() {
  return useContext(TerminalContext);
}

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [uiMode, setUiMode] = useState<UIMode>('browse');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('uiMode') as UIMode | null;
    if (stored === 'terminal') {
      setUiMode('terminal');
      if (pathname !== '/terminal') {
        router.push('/terminal');
      }
    }
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setMode = useCallback(
    (mode: UIMode) => {
      setUiMode(mode);
      localStorage.setItem('uiMode', mode);
      if (mode === 'terminal') {
        router.push('/terminal');
      } else {
        if (pathname === '/terminal') {
          router.push('/');
        }
      }
    },
    [router, pathname]
  );

  const toggleMode = useCallback(() => {
    setMode(uiMode === 'browse' ? 'terminal' : 'browse');
  }, [uiMode, setMode]);

  // Don't render anything mode-dependent until mounted to avoid hydration mismatch
  if (!mounted) {
    return <TerminalContext.Provider value={{ uiMode: 'browse', toggleMode, setMode }}>{children}</TerminalContext.Provider>;
  }

  return (
    <TerminalContext.Provider value={{ uiMode, toggleMode, setMode }}>
      {children}
    </TerminalContext.Provider>
  );
}

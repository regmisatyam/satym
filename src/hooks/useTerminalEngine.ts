'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import {
  buildFileSystem,
  resolvePath,
  getNodeAtPath,
  listDir,
  getCompletions,
  type FSNode,
} from '@/lib/virtualFs';
import { projectsData } from '@/data/projects';
import { aboutData } from '@/data/about';
import { LINKS } from '@/constants/globalConstants';

// ─── Output token types ───
export type OutputToken =
  | { type: 'text'; value: string }
  | { type: 'link'; label: string; href: string }
  | { type: 'error'; value: string }
  | { type: 'cyan'; value: string }
  | { type: 'green'; value: string }
  | { type: 'yellow'; value: string }
  | { type: 'command'; value: string };

export interface TerminalLine {
  id: number;
  prompt?: string;
  input?: string;
  tokens: OutputToken[];
}

const COMMANDS_HELP: Record<string, string> = {
  help: 'Show available commands',
  ls: 'List directory contents          ls [path]',
  pwd: 'Print working directory',
  cd: 'Change directory                 cd <dir>',
  cat: 'Display file contents            cat <name>',
  open: 'Open a link in new tab           open <target>',
  clear: 'Clear the terminal',
  whoami: 'Display user info',
  theme: 'Change terminal theme            theme <dark|light|matrix>',
  history: 'Show command history',
};

const WELCOME_BANNER: OutputToken[] = [
  { type: 'green', value: '╔══════════════════════════════════════════════╗' },
  { type: 'green', value: '║                                              ║' },
  { type: 'green', value: '║   Welcome to Satyam Regmi\'s Terminal!        ║' },
  { type: 'green', value: '║   Type "help" for available commands.        ║' },
  { type: 'green', value: '║                                              ║' },
  { type: 'green', value: '╚══════════════════════════════════════════════╝' },
  { type: 'text', value: '' },
  { type: 'yellow', value: 'Quick start:' },
  { type: 'text', value: '  help          - list all commands' },
  { type: 'text', value: '  ls            - see what\'s here' },
  { type: 'text', value: '  cd projects   - browse projects' },
  { type: 'text', value: '  cat about     - learn about me' },
  { type: 'text', value: '  open resume   - view my resume' },
  { type: 'text', value: '' },
];

export type TerminalTheme = 'dark' | 'light' | 'matrix';

export function useTerminalEngine() {
  const root = useMemo(() => buildFileSystem(), []);
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, tokens: WELCOME_BANNER },
  ]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [theme, setTheme] = useState<TerminalTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('terminalTheme') as TerminalTheme) || 'dark';
    }
    return 'dark';
  });
  const lineIdRef = useRef(1);

  const getPrompt = useCallback(() => {
    const pathStr = currentPath.length === 0 ? '~' : `~/${currentPath.join('/')}`;
    return `satyam@portfolio:${pathStr}$`;
  }, [currentPath]);

  const addOutput = useCallback(
    (input: string, tokens: OutputToken[]) => {
      const id = lineIdRef.current++;
      setLines((prev) => [
        ...prev,
        {
          id,
          prompt: getPrompt(),
          input,
          tokens,
        },
      ]);
    },
    [getPrompt]
  );

  // ── Command handlers ──

  const handleHelp = useCallback((): OutputToken[] => {
    const tokens: OutputToken[] = [
      { type: 'yellow', value: 'Available Commands:' },
      { type: 'text', value: '─────────────────────────────────────────────' },
    ];
    for (const [cmd, desc] of Object.entries(COMMANDS_HELP)) {
      tokens.push({ type: 'text', value: `  ${cmd.padEnd(12)} ${desc}` });
    }
    tokens.push({ type: 'text', value: '' });
    tokens.push({ type: 'yellow', value: 'Navigation:' });
    tokens.push({ type: 'text', value: '  Use Tab for autocomplete, ↑/↓ for history' });
    return tokens;
  }, []);

  const handleLs = useCallback(
    (args: string[]): OutputToken[] => {
      let targetNode: FSNode | null;
      if (args.length === 0) {
        targetNode = getNodeAtPath(root, currentPath);
      } else {
        const resolved = resolvePath(root, currentPath, args[0]);
        targetNode = resolved.node;
      }

      if (!targetNode) {
        return [{ type: 'error', value: `ls: cannot access '${args[0]}': No such file or directory` }];
      }

      if (targetNode.type === 'file') {
        return [{ type: 'text', value: targetNode.name }];
      }

      const items = listDir(targetNode);
      if (items.length === 0) {
        return [{ type: 'text', value: '(empty)' }];
      }

      const tokens: OutputToken[] = [];
      const cols = Math.min(4, items.length);
      const maxLen = Math.max(...items.map((i) => i.length)) + 2;

      let row = '';
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.endsWith('/')) {
          // Directories get their own token for color
          if (row.trim()) {
            tokens.push({ type: 'text', value: row });
            row = '';
          }
          tokens.push({ type: 'cyan', value: `  ${item}` });
        } else {
          row += `  ${item.padEnd(maxLen)}`;
          if ((i + 1) % cols === 0) {
            tokens.push({ type: 'text', value: row });
            row = '';
          }
        }
      }
      if (row.trim()) tokens.push({ type: 'text', value: row });

      return tokens;
    },
    [root, currentPath]
  );

  const handlePwd = useCallback((): OutputToken[] => {
    const pathStr = currentPath.length === 0 ? '~' : `~/${currentPath.join('/')}`;
    return [{ type: 'text', value: pathStr }];
  }, [currentPath]);

  const handleCd = useCallback(
    (args: string[]): OutputToken[] => {
      if (args.length === 0 || args[0] === '~' || args[0] === '/') {
        setCurrentPath([]);
        return [];
      }

      const target = args[0];
      const resolved = resolvePath(root, currentPath, target);

      if (!resolved.node) {
        return [{ type: 'error', value: `cd: no such file or directory: ${target}` }];
      }

      if (resolved.node.type !== 'directory') {
        return [{ type: 'error', value: `cd: not a directory: ${target}` }];
      }

      setCurrentPath(resolved.path);
      return [];
    },
    [root, currentPath]
  );

  const handleCat = useCallback(
    (args: string[]): OutputToken[] => {
      if (args.length === 0) {
        return [{ type: 'error', value: 'cat: missing operand' }];
      }

      const target = args[0];
      const resolved = resolvePath(root, currentPath, target);

      if (!resolved.node) {
        // Try looking up by project slug globally
        const project = projectsData.find((p) => p.slug === target);
        if (project) {
          const projNode = getNodeAtPath(root, ['projects', project.slug]);
          if (projNode?.content) {
            return [{ type: 'text', value: projNode.content() }];
          }
        }
        return [{ type: 'error', value: `cat: ${target}: No such file or directory` }];
      }

      if (resolved.node.type === 'directory') {
        return [{ type: 'error', value: `cat: ${target}: Is a directory` }];
      }

      if (resolved.node.content) {
        return [{ type: 'text', value: resolved.node.content() }];
      }

      return [{ type: 'text', value: '(empty file)' }];
    },
    [root, currentPath]
  );

  const handleOpen = useCallback(
    (args: string[]): OutputToken[] => {
      if (args.length === 0) {
        return [{ type: 'error', value: 'open: missing target. Try: open resume, open github, open <project>' }];
      }

      const target = args[0].toLowerCase();

      // Special targets
      const specialLinks: Record<string, string> = {
        resume: aboutData.resumeLink,
        github: LINKS.GITHUB,
        linkedin: LINKS.LINKEDIN,
        twitter: LINKS.X,
        x: LINKS.X,
        instagram: LINKS.INSTAGRAM,
        facebook: LINKS.FACEBOOK,
        email: `mailto:${LINKS.EMAIL}`,
        website: LINKS.WEBSITE,
      };

      if (specialLinks[target]) {
        window.open(specialLinks[target], '_blank');
        return [
          { type: 'green', value: `Opening ${target}...` },
          { type: 'link', label: specialLinks[target], href: specialLinks[target] },
        ];
      }

      // "open demo" or "open code" when inside a project directory
      if ((target === 'demo' || target === 'code') && currentPath[0] === 'projects' && currentPath.length === 2) {
        const slug = currentPath[1];
        const project = projectsData.find((p) => p.slug === slug);
        if (project) {
          const url = target === 'demo' ? project.demoLink : project.codeLink;
          if (url && url !== '#') {
            window.open(url, '_blank');
            return [
              { type: 'green', value: `Opening ${project.title} ${target}...` },
              { type: 'link', label: url, href: url },
            ];
          }
          return [{ type: 'error', value: `No ${target} link available for ${project.title}` }];
        }
      }

      // Try as project slug
      const project = projectsData.find((p) => p.slug === target);
      if (project) {
        window.open(project.demoLink, '_blank');
        return [
          { type: 'green', value: `Opening ${project.title}...` },
          { type: 'link', label: project.demoLink, href: project.demoLink },
        ];
      }

      return [{ type: 'error', value: `open: unknown target '${args[0]}'. Try: open resume, open github, open <project-slug>` }];
    },
    [currentPath]
  );

  const handleWhoami = useCallback((): OutputToken[] => {
    return [
      { type: 'green', value: aboutData.name },
      { type: 'text', value: `${aboutData.title} — ${aboutData.tagline}` },
      { type: 'text', value: `${aboutData.location} | ${aboutData.education}` },
    ];
  }, []);

  const handleTheme = useCallback(
    (args: string[]): OutputToken[] => {
      const valid: TerminalTheme[] = ['dark', 'light', 'matrix'];
      if (args.length === 0 || !valid.includes(args[0] as TerminalTheme)) {
        return [
          { type: 'text', value: `Current theme: ${theme}` },
          { type: 'text', value: `Usage: theme <${valid.join('|')}>` },
        ];
      }
      const newTheme = args[0] as TerminalTheme;
      setTheme(newTheme);
      localStorage.setItem('terminalTheme', newTheme);
      return [{ type: 'green', value: `Theme changed to ${newTheme}` }];
    },
    [theme]
  );

  const handleHistory = useCallback((): OutputToken[] => {
    if (history.length === 0) {
      return [{ type: 'text', value: 'No command history yet.' }];
    }
    return history.map((cmd, i) => ({
      type: 'text' as const,
      value: `  ${String(i + 1).padStart(4)}  ${cmd}`,
    }));
  }, [history]);

  // ── Main execute ──

  const execute = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) {
        addOutput('', []);
        return;
      }

      // Add to history
      setHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      let tokens: OutputToken[];

      switch (cmd) {
        case 'help':
          tokens = handleHelp();
          break;
        case 'ls':
          tokens = handleLs(args);
          break;
        case 'pwd':
          tokens = handlePwd();
          break;
        case 'cd':
          tokens = handleCd(args);
          break;
        case 'cat':
          tokens = handleCat(args);
          break;
        case 'open':
          tokens = handleOpen(args);
          break;
        case 'clear':
          setLines([]);
          return;
        case 'whoami':
          tokens = handleWhoami();
          break;
        case 'theme':
          tokens = handleTheme(args);
          break;
        case 'history':
          tokens = handleHistory();
          break;
        default:
          tokens = [
            { type: 'error', value: `command not found: ${cmd}` },
            { type: 'text', value: 'Type "help" for available commands.' },
          ];
      }

      addOutput(trimmed, tokens);
    },
    [addOutput, handleHelp, handleLs, handlePwd, handleCd, handleCat, handleOpen, handleWhoami, handleTheme, handleHistory]
  );

  const clearScreen = useCallback(() => {
    setLines([]);
  }, []);

  // ── Autocomplete ──
  const getAutocomplete = useCallback(
    (input: string): string | null => {
      const parts = input.split(/\s+/);

      // If just command, autocomplete command name
      if (parts.length === 1) {
        const partial = parts[0].toLowerCase();
        const commands = Object.keys(COMMANDS_HELP);
        const match = commands.find((c) => c.startsWith(partial) && c !== partial);
        return match || null;
      }

      // Autocomplete arguments (path completions)
      const cmd = parts[0].toLowerCase();
      if (['cd', 'cat', 'ls', 'open'].includes(cmd)) {
        const partial = parts[parts.length - 1];

        // For open command, provide special targets
        if (cmd === 'open') {
          const openTargets = [
            'resume', 'github', 'linkedin', 'twitter', 'instagram', 'email',
            'demo', 'code',
            ...projectsData.map((p) => p.slug),
          ];
          const match = openTargets.find((t) => t.startsWith(partial.toLowerCase()) && t !== partial.toLowerCase());
          if (match) {
            return [...parts.slice(0, -1), match].join(' ');
          }
          return null;
        }

        // Path autocomplete
        const lastSlash = partial.lastIndexOf('/');
        let dirPath: string[];
        let prefix: string;

        if (lastSlash >= 0) {
          const dirPart = partial.substring(0, lastSlash);
          prefix = partial.substring(lastSlash + 1);
          const resolved = resolvePath(root, currentPath, dirPart || '/');
          dirPath = resolved.path;
        } else {
          dirPath = currentPath;
          prefix = partial;
        }

        const completions = getCompletions(root, dirPath);
        const match = completions.find((c) => c.startsWith(prefix) && c !== prefix);
        if (match) {
          if (lastSlash >= 0) {
            const dirPart = partial.substring(0, lastSlash + 1);
            return [...parts.slice(0, -1), `${dirPart}${match}`].join(' ');
          }
          return [...parts.slice(0, -1), match].join(' ');
        }
      }

      return null;
    },
    [root, currentPath]
  );

  return {
    lines,
    currentPath,
    history,
    historyIndex,
    setHistoryIndex,
    theme,
    execute,
    clearScreen,
    getPrompt,
    getAutocomplete,
  };
}

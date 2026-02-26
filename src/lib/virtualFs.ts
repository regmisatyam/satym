import { projectsData } from '@/data/projects';
import { skillsData } from '@/data/skills';
import { aboutData } from '@/data/about';
import { LINKS } from '@/constants/globalConstants';

export type FSNodeType = 'directory' | 'file';

export interface FSNode {
  name: string;
  type: FSNodeType;
  children?: Record<string, FSNode>;
  content?: () => string;
  /** For files that represent links */
  link?: string;
}

function buildProjectNodes(): Record<string, FSNode> {
  const nodes: Record<string, FSNode> = {};
  for (const p of projectsData) {
    nodes[p.slug] = {
      name: p.slug,
      type: 'file',
      content: () => {
        const lines = [
          `  ${p.title}`,
          `  ${p.description}`,
          ``,
          `  Stack: ${p.tags.join(', ')}`,
          ``,
          `  Demo : ${p.demoLink}`,
          `  Code : ${p.codeLink !== '#' ? p.codeLink : 'Private'}`,
          ``,
          `  Try: open demo | open code`,
        ];
        return lines.join('\n');
      },
      link: p.demoLink,
    };
  }
  return nodes;
}

function buildSkillsContent(): string {
  return skillsData
    .map((cat) => {
      const header = `  [${cat.category}]`;
      const items = cat.skills
        .map((s) => {
          const bar = '█'.repeat(Math.round(s.proficiency / 10)) + '░'.repeat(10 - Math.round(s.proficiency / 10));
          return `    ${s.name.padEnd(16)} ${bar} ${s.proficiency}%`;
        })
        .join('\n');
      return `${header}\n${items}`;
    })
    .join('\n\n');
}

function buildAboutContent(): string {
  const years = new Date().getFullYear() - aboutData.startYear;
  return [
    `  ${aboutData.name}`,
    `  ${aboutData.title} | ${years}+ years experience`,
    ``,
    `  ${aboutData.bio[0]}`,
    ``,
    `  ${aboutData.bio[1]}`,
    ``,
    `  Location   : ${aboutData.location}`,
    `  Education  : ${aboutData.education}`,
    `  Email      : ${LINKS.EMAIL}`,
    `  Status     : ${aboutData.availability}`,
  ].join('\n');
}

function buildContactContent(): string {
  return [
    `  Contact Information`,
    `  ───────────────────`,
    `  Email    : ${LINKS.EMAIL}`,
    `  Phone    : ${LINKS.PHONE}`,
    `  GitHub   : ${LINKS.GITHUB}`,
    `  LinkedIn : ${LINKS.LINKEDIN}`,
    `  Twitter  : ${LINKS.X}`,
    `  Instagram: ${LINKS.INSTAGRAM}`,
    ``,
    `  Try: open github | open linkedin | open email`,
  ].join('\n');
}

export function buildFileSystem(): FSNode {
  return {
    name: '~',
    type: 'directory',
    children: {
      about: {
        name: 'about',
        type: 'file',
        content: buildAboutContent,
      },
      skills: {
        name: 'skills',
        type: 'file',
        content: buildSkillsContent,
      },
      projects: {
        name: 'projects',
        type: 'directory',
        children: buildProjectNodes(),
      },
      experience: {
        name: 'experience',
        type: 'file',
        content: () =>
          [
            '  Experience',
            '  ──────────',
            '  Full Stack Developer | Freelance (2021 - Present)',
            '    - Built and deployed modern web applications for clients',
            '    - Specialized in React, Next.js, Node.js, Python',
            '    - Delivered 10+ production projects',
            '',
            '  View more: open resume',
          ].join('\n'),
      },
      contact: {
        name: 'contact',
        type: 'file',
        content: buildContactContent,
      },
      resume: {
        name: 'resume',
        type: 'file',
        content: () => '  Opening resume in new tab...',
        link: aboutData.resumeLink,
      },
    },
  };
}

/**
 * Resolve a path from the current directory, returning the node and new path segments.
 */
export function resolvePath(
  root: FSNode,
  currentPath: string[],
  target: string
): { node: FSNode | null; path: string[] } {
  let segments: string[];

  if (target === '~' || target === '/') {
    segments = [];
  } else if (target === '..') {
    segments = currentPath.slice(0, -1);
  } else if (target.startsWith('~/') || target.startsWith('/')) {
    segments = target.replace(/^[~/]+/, '').split('/').filter(Boolean);
  } else {
    // relative path
    const parts = target.split('/').filter(Boolean);
    segments = [...currentPath];
    for (const part of parts) {
      if (part === '..') {
        segments = segments.slice(0, -1);
      } else if (part !== '.') {
        segments.push(part);
      }
    }
  }

  let node: FSNode | null = root;
  for (const seg of segments) {
    if (node?.type === 'directory' && node.children?.[seg]) {
      node = node.children[seg];
    } else {
      return { node: null, path: segments };
    }
  }

  return { node, path: segments };
}

export function getNodeAtPath(root: FSNode, pathSegments: string[]): FSNode | null {
  let node: FSNode | null = root;
  for (const seg of pathSegments) {
    if (node?.type === 'directory' && node.children?.[seg]) {
      node = node.children[seg];
    } else {
      return null;
    }
  }
  return node;
}

export function getCurrentNode(root: FSNode, currentPath: string[]): FSNode | null {
  return getNodeAtPath(root, currentPath);
}

/**
 * List the children names of a directory node with type indicators.
 */
export function listDir(node: FSNode): string[] {
  if (node.type !== 'directory' || !node.children) return [];
  return Object.values(node.children).map((child) =>
    child.type === 'directory' ? `${child.name}/` : child.name
  );
}

/**
 * Get all valid names in a directory for autocomplete purposes.
 */
export function getCompletions(root: FSNode, currentPath: string[]): string[] {
  const node = getNodeAtPath(root, currentPath);
  if (!node || node.type !== 'directory' || !node.children) return [];
  return Object.keys(node.children);
}

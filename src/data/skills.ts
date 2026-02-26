export interface Skill {
  name: string;
  proficiency: number;
}

export interface SkillCategory {
  category: string;
  iconName: string; // Store icon name as string for data module
  skills: Skill[];
}

export const skillsData: SkillCategory[] = [
  {
    category: 'Frontend',
    iconName: 'FiLayout',
    skills: [
      { name: 'HTML/CSS', proficiency: 90 },
      { name: 'JavaScript', proficiency: 85 },
      { name: 'React', proficiency: 88 },
      { name: 'Next.js', proficiency: 85 },
      { name: 'Tailwind CSS', proficiency: 92 },
    ],
  },
  {
    category: 'Backend',
    iconName: 'FiServer',
    skills: [
      { name: 'Node.js', proficiency: 82 },
      { name: 'Express', proficiency: 85 },
      { name: 'Python', proficiency: 78 },
      { name: 'Django', proficiency: 75 },
      { name: 'GraphQL', proficiency: 70 },
    ],
  },
  {
    category: 'Database',
    iconName: 'FiDatabase',
    skills: [
      { name: 'MongoDB', proficiency: 88 },
      { name: 'MySQL', proficiency: 80 },
      { name: 'PostgreSQL', proficiency: 75 },
      { name: 'Firebase', proficiency: 85 },
      { name: 'Redis', proficiency: 65 },
    ],
  },
  {
    category: 'Mobile',
    iconName: 'FiSmartphone',
    skills: [
      { name: 'React Native', proficiency: 80 },
      { name: 'Flutter', proficiency: 65 },
      { name: 'Swift', proficiency: 60 },
      { name: 'Kotlin', proficiency: 55 },
    ],
  },
  {
    category: 'DevOps',
    iconName: 'FiTool',
    skills: [
      { name: 'Git', proficiency: 90 },
      { name: 'Docker', proficiency: 75 },
      { name: 'CI/CD', proficiency: 78 },
      { name: 'AWS', proficiency: 72 },
      { name: 'Kubernetes', proficiency: 68 },
    ],
  },
  {
    category: 'Other',
    iconName: 'FiCode',
    skills: [
      { name: 'TypeScript', proficiency: 85 },
      { name: 'Testing', proficiency: 80 },
      { name: 'UI/UX Design', proficiency: 75 },
      { name: 'Agile/Scrum', proficiency: 85 },
      { name: 'Problem Solving', proficiency: 92 },
    ],
  },
];

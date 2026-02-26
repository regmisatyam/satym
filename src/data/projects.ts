export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  tags: string[];
  demoLink: string;
  codeLink: string;
}

export const projectsData: Project[] = [
  {
    id: 1,
    title: 'LLAMA Web Builder',
    slug: 'llama-web-builder',
    description: 'Build Websites from Images and Voice command with AI',
    image: 'https://satym.me/image.png',
    tags: ['Web', 'AI', 'Next.js', 'LLAMA'],
    demoLink: 'https://llama.satym.me/',
    codeLink: 'https://github.com/regmisatyam/llama-web-agent',
  },
  {
    id: 2,
    title: 'GAgent',
    slug: 'gagent',
    description: 'Smart Personal Assistant for Google Services and Daily Tasks.',
    image: 'https://www.teletechnepal.com/favicon.ico',
    tags: ['AI', 'Web', 'Next.js', 'Node.js', 'Firebase', 'GAuth'],
    demoLink: 'https://ai.satym.me/',
    codeLink: 'https://github.com/regmisatyam/llm-agent',
  },
  {
    id: 3,
    title: 'Teletech Nepal',
    slug: 'teletech-nepal',
    description: 'A full-stack blogging platform with auth, user and admin dashboard.',
    image: 'https://www.teletechnepal.com/favicon.ico',
    tags: ['Web', 'Next.js', 'Node.js', 'PostgreSQL', 'Prisma'],
    demoLink: 'https://teletechnepal.com',
    codeLink: '#',
  },
  {
    id: 4,
    title: 'Guide of Visa',
    slug: 'guide-of-visa',
    description: 'Website that guides through visa process for different countries. Tracks Application and AI powered visa Interview.',
    image: 'https://guideofvisa.com/favicons/favicon.ico',
    tags: ['Web', 'AI', 'Python', 'Remix', 'Supabase', 'Firebase'],
    demoLink: 'https://guideofvisa.com',
    codeLink: '#',
  },
  {
    id: 5,
    title: 'All Nepali News',
    slug: 'all-nepali-news',
    description: 'All Nepali News. Short Fast Authentic news application.',
    image: 'https://play-lh.googleusercontent.com/sK0n5FqGV4Ilc6UEV4T7LdHU6A2Td2uvJJOU1W739S5xcw61t9rdalgbRot4k8VwmPU=w480-h960-rw',
    tags: ['Mobile', 'Web', 'Java', 'Python', 'React Native', 'Firebase'],
    demoLink: 'https://play.google.com/store/apps/details?id=com.satyamregmi.AllNepaliNews',
    codeLink: '#',
  },
  {
    id: 6,
    title: 'Fav Icon From Url',
    slug: 'favicon-from-url',
    description: 'Extract website favicons from url and provides favicon link in json format',
    image: '',
    tags: ['Web', 'Python', 'Scraping'],
    demoLink: 'https://fifu.vercel.app/?url=https://facebook.com',
    codeLink: 'https://github.com/regmisatyam/FavIconFromUrl',
  },
  {
    id: 7,
    title: 'SBP',
    slug: 'sbp',
    description: 'SBP is a Content Management System build on pure php with MySQL db. It is fast and occupies low storage. Can run on any apache or nginx server.',
    image: '',
    tags: ['Web', 'CMS', 'PHP', 'MySQL'],
    demoLink: 'https://blogs.satyamregmi.com.np',
    codeLink: 'https://github.com/regmisatyam/sbp',
  },
  {
    id: 8,
    title: 'Text to Speech',
    slug: 'text-to-speech',
    description: 'Converts any language text to Speech. Accessible through huggingface studio and API',
    image: '',
    tags: ['AI', 'Hugging Face', 'TTS', 'Python'],
    demoLink: 'https://regmisatyam-text-to-speech.hf.space/',
    codeLink: 'https://github.com/regmisatyam/text-to-speech-ai-model',
  },
];

export const projectCategories = ['All', 'Web', 'Mobile', 'AI'];

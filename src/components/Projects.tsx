'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiExternalLink, FiGithub } from 'react-icons/fi';

const projectsData = [
  {
    id: 1,
    title: 'Teletech Nepal',
    description: 'A full-stack blogging platform with auth, user and admin dashboard.',
    image: 'https://www.teletechnepal.com/favicon.ico',
    tags: ['Web', 'Next.js', 'Node.js', 'PostgreSQL', 'Prisma'],
    demoLink: 'https://teletechnepal.com',
    codeLink: '#',
  },
  {
    id: 2,
    title: 'Guide of Visa',
    description: 'Website that guides through visa process for different countries. Tracks Application and AI powered visa Interview. ',
    image: 'https://guideofvisa.com/favicons/favicon.ico',
    tags: ['Web','AI', 'Python', 'Remix', 'Supabase', 'Firebase'],
    demoLink: 'https://guideofvisa.com',
    codeLink: '#',
  },
  {
    id: 3,
    title: 'All Nepali News',
    description: 'All Nepali News. Short Fast Authentic news application.',
    image: 'https://play-lh.googleusercontent.com/sK0n5FqGV4Ilc6UEV4T7LdHU6A2Td2uvJJOU1W739S5xcw61t9rdalgbRot4k8VwmPU=w480-h960-rw',
    tags: ['Mobile', 'Web', 'Java', 'Python', 'React Native', 'Firebase'],
    demoLink: 'https://play.google.com/store/apps/details?id=com.satyamregmi.AllNepaliNews',
    codeLink: '#',
  },
  {
    id: 4,
    title: 'Fav Icon From Url',
    description: 'Extract website favicons from url and provides favicon link in json format',
    image: '',
    tags: ['Web', 'Python', 'Scraping'],
    demoLink: 'https://fifu.vercel.app/?url=https://facebook.com',
    codeLink: 'https://github.com/regmisatyam/FavIconFromUrl',
  },
  {
    id: 5,
    title: 'SBP',
    description: 'SBP is a Content Management System build on pure php with MySQL db. It is fast and occupies low storage. Can run on any apache or nginx server.',
    image: '',
    tags: ['Web', 'CMS', 'PHP', 'MySQL'],
    demoLink: 'https://blogs.satyamregmi.com.np',
    codeLink: 'https://github.com/regmisatyam/sbp',
  },
  {
    id: 6,
    title: 'Text to Speech',
    description: 'Converts any language text to Speech. Accessible through huggingface studio and API',
    image: '',
    tags: ['AI', 'Hugging Face', 'TTS', 'Python'],
    demoLink: 'https://regmisatyam-text-to-speech.hf.space/',
    codeLink: 'https://github.com/regmisatyam/text-to-speech-ai-model',
  },
];

// Unique categories for filtering
const categories = ['All', 'Web', 'Mobile', 'AI'];

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const filteredProjects = selectedCategory === 'All'
    ? projectsData
    : projectsData.filter(project => project.tags.includes(selectedCategory));

  return (
    <section id="projects" className="section-padding bg-dark-secondary">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">My Projects</h2>
          <div className="w-24 h-1 bg-highlight-primary mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-dark-muted">
            Explore my portfolio of projects spanning web development, mobile applications, and more.
            Each project demonstrates my technical skills and problem-solving abilities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-highlight-primary text-white'
                  : 'bg-dark-accent hover:bg-dark-accent/70 text-dark-muted'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-dark-primary rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
              >
                <div className="relative overflow-hidden h-48">
                  <div className="absolute inset-0 bg-gradient-to-br from-highlight-primary/20 to-purple-500/20 flex items-center justify-center text-xl font-bold text-dark-text">
                    {project.title}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6 flex-grow">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-dark-accent px-2 py-1 rounded-full text-dark-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-dark-text group-hover:text-highlight-primary transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-dark-muted mb-4">{project.description}</p>
                </div>
                
                <div className="p-6 pt-0 mt-auto flex gap-4">
                  <a
                    href={project.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark-muted hover:text-highlight-primary transition-colors duration-300 flex items-center"
                  >
                    <FiExternalLink className="mr-1" /> Visit
                  </a>
                  <a
                    href={project.codeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark-muted hover:text-highlight-primary transition-colors duration-300 flex items-center"
                  >
                    <FiGithub className="mr-1" /> Code
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
} 
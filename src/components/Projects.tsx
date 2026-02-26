'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import { projectsData, projectCategories as categories } from '@/data/projects';

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
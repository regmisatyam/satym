'use client';

import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { 
  FiCode, 
  FiLayout, 
  FiDatabase, 
  FiServer, 
  FiSmartphone,
  FiTool
} from 'react-icons/fi';
import { skillsData } from '@/data/skills';
import type { ReactElement } from 'react';

const iconMap: Record<string, ReactElement> = {
  FiLayout: <FiLayout />,
  FiServer: <FiServer />,
  FiDatabase: <FiDatabase />,
  FiSmartphone: <FiSmartphone />,
  FiTool: <FiTool />,
  FiCode: <FiCode />,
};

export default function Skills() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="skills" className="section-padding bg-dark-primary">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">My Skills</h2>
          <div className="w-24 h-1 bg-highlight-primary mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-dark-muted">
            A comprehensive overview of my technical skills and proficiency levels across various domains.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {skillsData.map((skillCategory, categoryIndex) => (
            <motion.div
              key={skillCategory.category}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="bg-dark-secondary p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-highlight-primary/20 text-highlight-primary rounded-lg mr-4">
                  {iconMap[skillCategory.iconName] || <FiCode />}
                </div>
                <h3 className="text-xl font-bold">{skillCategory.category}</h3>
              </div>

              <div className="space-y-4">
                {skillCategory.skills.map((skill, skillIndex) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-dark-text">{skill.name}</span>
                      <span className="text-dark-muted">{skill.proficiency}%</span>
                    </div>
                    <div className="h-2 bg-dark-accent rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${skill.proficiency}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: 0.3 + skillIndex * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-highlight-primary to-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 
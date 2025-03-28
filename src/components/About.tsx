'use client';

import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';
import {LINKS} from '../constants/globalConstants'

export default function About() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Calculate years of experience
  const startYear = 2021;
  const currentYear = new Date().getFullYear();
  const yearsOfExperience = currentYear - startYear;

  return (
    <section id="about" className="section-padding bg-dark-primary">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">About Me</h2>
          <div className="w-24 h-1 bg-highlight-primary mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl">
              <div className="w-full h-full bg-gradient-to-tr from-highlight-primary/30 to-purple-500/30 absolute"></div>
              <div className="absolute inset-4 rounded-xl overflow-hidden">
                <div className="w-full h-full bg-dark-secondary flex items-center justify-center text-xl">
                  {/* image placeholder */}
                  <span className="text-dark-muted italic">Satyam Regmi</span>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-6 -right-6 bg-highlight-primary text-white p-5 rounded-full shadow-lg"
            >
              <span className="text-xl font-bold">{yearsOfExperience}+</span>
              <span className="block text-xs">Years of<br />Experience</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-dark-text">Satyam Regmi</h3>
            <h4 className="text-xl text-highlight-primary">Full Stack Developer</h4>
            
            <p className="text-dark-muted">
              Hello! I&apos;m a passionate developer with expertise in building modern, responsive web applications. 
              I specialize in creating clean, efficient code and intuitive user interfaces that provide seamless experiences.
            </p>
            
            <p className="text-dark-muted">
              With a strong foundation in both frontend and backend technologies, I enjoy tackling complex problems 
              and turning ideas into reality. I&apos;m constantly learning new technologies to stay at the forefront of web development.
            </p>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-dark-text">Email</h5>
                <p className="text-dark-muted">{LINKS.EMAIL}</p>
              </div>
              <div>
                <h5 className="font-semibold text-dark-text">Location</h5>
                <p className="text-dark-muted">Caldwell, New Jersey</p>
              </div>
              <div>
                <h5 className="font-semibold text-dark-text">Education</h5>
                <p className="text-dark-muted">Computer Science, Caldwell University</p>
              </div>
              <div>
                <h5 className="font-semibold text-dark-text">Availability</h5>
                <p className="text-dark-muted">Open for opportunities</p>
              </div>
            </div>

            <motion.a
              href="https://satyamregmi.com.np/assets/satyam-resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="inline-flex items-center px-6 py-3 bg-highlight-primary hover:bg-highlight-secondary text-white rounded-full transition-colors duration-300 mt-6"
            >
              <FiDownload className="mr-2" /> Download Resume
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowDown, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Link from 'next/link';
import { LINKS } from '../constants/globalConstants'

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const calculateOffset = (offset: number) => {
    const x = (mousePosition.x - windowSize.width / 2) / offset;
    const y = (mousePosition.y - windowSize.height / 2) / offset;
    return { x, y };
  };

  return (
    <section id="hero" className="relative h-screen flex flex-col justify-center items-center overflow-hidden bg-dark-primary">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-highlight-primary/10 mix-blend-screen"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: calculateOffset(20 + i * 5).x,
              y: calculateOffset(20 + i * 5).y,
            }}
            transition={{ type: 'spring', stiffness: 50, damping: 30 }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <h2 className="text-2xl text-highlight-primary font-bold mb-2">Hello, I&apos;m</h2>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-highlight-primary to-purple-500 bg-clip-text text-transparent"
        >
          Satyam Regmi
        </motion.h1>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl md:text-2xl text-dark-muted mb-8"
        >
          Building beautiful digital experiences
        </motion.h3>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center space-x-6 mb-12"
        >
          <Link 
            href="#projects" 
            className="px-8 py-3 bg-highlight-primary hover:bg-highlight-secondary text-white rounded-full transition-colors duration-300 flex items-center"
          >
            View Projects
          </Link>
          <Link 
            href="#contact" 
            className="px-8 py-3 border border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 rounded-full transition-colors duration-300"
          >
            Contact Me
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex justify-center space-x-6"
        >
          <a href={LINKS.GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-dark-muted hover:text-highlight-primary transition-colors duration-300">
            <FiGithub size={24} />
          </a>
          <a href={`${LINKS.LINKEDIN}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-dark-muted hover:text-highlight-primary transition-colors duration-300">
            <FiLinkedin size={24} />
          </a>
          <a href={`${LINKS.X}`} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-dark-muted hover:text-highlight-primary transition-colors duration-300">
            <FiTwitter size={24} />
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce"
      >
        <FiArrowDown className="text-dark-muted" size={24} />
      </motion.div>
    </section>
  );
} 
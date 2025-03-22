'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiGithub, FiLinkedin, FiTwitter, FiInstagram, FiArrowUp } from 'react-icons/fi';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark-primary relative">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 md:mb-0"
          >
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-highlight-primary to-purple-500 bg-clip-text text-transparent">
              Satyam Regmi
            </Link>
            <p className="text-dark-muted mt-2 max-w-md">
              Building innovative digital experiences with a focus on clean code, intuitive design, and exceptional performance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center md:items-end"
          >
            <div className="flex space-x-4 mb-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 bg-dark-secondary rounded-full text-dark-muted hover:text-highlight-primary hover:bg-dark-accent transition-colors duration-300"
              >
                <FiGithub size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 bg-dark-secondary rounded-full text-dark-muted hover:text-highlight-primary hover:bg-dark-accent transition-colors duration-300"
              >
                <FiLinkedin size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="p-2 bg-dark-secondary rounded-full text-dark-muted hover:text-highlight-primary hover:bg-dark-accent transition-colors duration-300"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 bg-dark-secondary rounded-full text-dark-muted hover:text-highlight-primary hover:bg-dark-accent transition-colors duration-300"
              >
                <FiInstagram size={20} />
              </a>
            </div>
            <button
              onClick={scrollToTop}
              className="p-3 bg-highlight-primary rounded-full text-white hover:bg-highlight-secondary transition-colors duration-300"
              aria-label="Scroll to top"
            >
              <FiArrowUp size={20} />
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-8 border-t border-dark-accent flex flex-col md:flex-row justify-between items-center"
        >
          <div className="text-dark-muted text-sm mb-4 md:mb-0">
            &copy; {year} Satyam Regmi. All rights reserved.
          </div>
          
          <div className="flex space-x-6">
            <Link href="#about" className="text-dark-muted hover:text-highlight-primary transition-colors duration-300 text-sm">
              About
            </Link>
            <Link href="#projects" className="text-dark-muted hover:text-highlight-primary transition-colors duration-300 text-sm">
              Projects
            </Link>
            <Link href="#skills" className="text-dark-muted hover:text-highlight-primary transition-colors duration-300 text-sm">
              Skills
            </Link>
            <Link href="#contact" className="text-dark-muted hover:text-highlight-primary transition-colors duration-300 text-sm">
              Contact
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
} 
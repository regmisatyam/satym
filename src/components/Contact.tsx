'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import {LINKS} from '../constants/globalConstants';
import WeatherBackground from './WeatherBackground';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage('Your message has been sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitMessage('');
      }, 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-dark-secondary">
            <WeatherBackground>
      <div className="relative z-10 container section-padding mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Get In Touch</h2>
          <div className="w-24 h-1 bg-highlight-primary mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-dark-muted">
            Have a project in mind or want to collaborate? Feel free to reach out through the form below or via my contact information.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            
            <div className="flex items-start space-x-4">
              <div className="bg-highlight-primary/20 p-3 rounded-lg text-highlight-primary">
                <FiMail size={24} />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Email</h4>
                <p className="text-dark-muted">{LINKS.EMAIL}</p>
                <a 
                  href={`mailto:${LINKS.EMAIL}`}
                  className="text-highlight-primary hover:text-highlight-secondary transition-colors duration-300 text-sm"
                >
                  Send an email
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-highlight-primary/20 p-3 rounded-lg text-highlight-primary">
                <FiPhone size={24} />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Phone</h4>
                <p className="text-dark-muted">+1 (862) 224-1646</p>
                <a 
                  href="tel:+18622241646" 
                  className="text-highlight-primary hover:text-highlight-secondary transition-colors duration-300 text-sm"
                >
                  Call me
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-highlight-primary/20 p-3 rounded-lg text-highlight-primary">
                <FiMapPin size={24} />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Location</h4>
                <p className="text-dark-muted">Caldwell, New Jersey</p>
                <p className="text-dark-muted">United States</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-dark-primary rounded-lg shadow-lg">
              <h4 className="font-bold mb-4">Available For</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-highlight-primary mr-2"></span>
                  <span className="text-dark-muted">Freelance Projects</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-highlight-primary mr-2"></span>
                  <span className="text-dark-muted">Full-time Positions</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-highlight-primary mr-2"></span>
                  <span className="text-dark-muted">Consulting</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-highlight-primary mr-2"></span>
                  <span className="text-dark-muted">Collaboration</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-6">Send A Message</h3>
            
            {submitMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/30 text-green-400 p-4 rounded-lg mb-6"
              >
                {submitMessage}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-dark-muted mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-dark-accent text-dark-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight-primary"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-dark-muted mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-dark-accent text-dark-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight-primary"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-dark-muted mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-dark-accent text-dark-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight-primary"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-dark-muted mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-dark-accent text-dark-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight-primary resize-none"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-highlight-primary hover:bg-highlight-secondary text-white rounded-lg transition-colors duration-300 flex items-center justify-center disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <FiSend className="mr-2" /> Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      </WeatherBackground>
    </section>
  );
} 
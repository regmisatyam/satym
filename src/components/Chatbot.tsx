'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiUser, FiCpu, FiTrash2, FiMic, FiMicOff } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Send voice command
  const handleSendVoiceCommand = async (voiceInput: string) => {
    if (!voiceInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: voiceInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      let assistantMessage = data.message;

      // Check if the response contains a navigation action
      try {
        const navigationMatch = assistantMessage.match(/\{"action":\s*"navigate",\s*"section":\s*"([^"]+)"\}/);
        if (navigationMatch) {
          const section = navigationMatch[1];
          navigateToSection(section);
          assistantMessage = `Sure! Taking you to the ${section} section.`;
        }
      } catch {
        // Not a navigation response, continue normally
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsVoiceSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          
          // Auto-send the voice command after a short delay
          setTimeout(() => {
            if (transcript.trim()) {
              // Create the message directly here to avoid closure issues
              const userMessage: Message = { role: 'user', content: transcript };
              setMessages((prev) => [...prev, userMessage]);
              setInput('');
              setIsLoading(true);

              fetch('/api/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  messages: [...messages, userMessage].map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                  })),
                }),
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error('Failed to get response');
                  }
                  return response.json();
                })
                .then((data) => {
                  let assistantMessage = data.message;

                  // Check if the response contains a navigation action
                  try {
                    const navigationMatch = assistantMessage.match(/\{"action":\s*"navigate",\s*"section":\s*"([^"]+)"\}/);
                    if (navigationMatch) {
                      const section = navigationMatch[1];
                      navigateToSection(section);
                      assistantMessage = `Sure! Taking you to the ${section} section.`;
                    }
                  } catch {
                    // Not a navigation response, continue normally
                  }

                  setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
                })
                .catch((error) => {
                  console.error('Error:', error);
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: 'assistant',
                      content: "Sorry, I'm having trouble connecting right now. Please try again.",
                    },
                  ]);
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }
          }, 500);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access to use voice commands.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatbot-messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error loading messages:', error);
        const welcomeMessage = isVoiceSupported 
          ? "Hi! I'm Satyam's AI assistant. I can answer questions about his work, skills, and projects, or help you navigate the website. You can type or use the microphone button to speak. What would you like to know?"
          : "Hi! I'm Satyam's AI assistant. I can answer questions about his work, skills, and projects, or help you navigate the website. What would you like to know?";
        
        setMessages([
          {
            role: 'assistant',
            content: welcomeMessage,
          },
        ]);
      }
    } else {
      const welcomeMessage = isVoiceSupported 
        ? "Hi! I'm Satyam's AI assistant. I can answer questions about his work, skills, and projects, or help you navigate the website. You can type or use the microphone button to speak. What would you like to know?"
        : "Hi! I'm Satyam's AI assistant. I can answer questions about his work, skills, and projects, or help you navigate the website. What would you like to know?";
      
      setMessages([
        {
          role: 'assistant',
          content: welcomeMessage,
        },
      ]);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const navigateToSection = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Add a small delay before closing to show feedback
      setTimeout(() => {
        setIsOpen(false);
      }, 500);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      let assistantMessage = data.message;

      // Check if the response contains a navigation action
      try {
        const navigationMatch = assistantMessage.match(/\{"action":\s*"navigate",\s*"section":\s*"([^"]+)"\}/);
        if (navigationMatch) {
          const section = navigationMatch[1];
          navigateToSection(section);
          assistantMessage = `Sure! Taking you to the ${section} section.`;
        }
      } catch {
        // Not a navigation response, continue normally
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const welcomeMessage = isVoiceSupported 
      ? "Hi! I'm Satyam's AI assistant. I can answer questions about his work, skills, and projects, or help you navigate the website. You can type or use the microphone button to speak. What would you like to know?"
      : "Hi! I'm Satyam's AI assistant. I can answer questions about his work, skills, and projects, or help you navigate the website. What would you like to know?";
    
    const initialMessage: Message = {
      role: 'assistant',
      content: welcomeMessage,
    };
    setMessages([initialMessage]);
    localStorage.setItem('chatbot-messages', JSON.stringify([initialMessage]));
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const quickActions = [
    { label: 'View Projects', message: 'Show me the projects' },
    { label: 'About Satyam', message: 'Tell me about Satyam' },
    { label: 'Contact Info', message: 'How can I contact Satyam?' },
    { label: 'Skills', message: 'What are the skills?' },
  ];

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-highlight-primary to-purple-500 text-white p-4 rounded-full shadow-2xl hover:shadow-highlight-primary/50 transition-all duration-300"
        style={{ 
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          backgroundColor: '#6366f1',
          color: 'white'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 0 }}
              animate={{ rotate: 90 }}
              exit={{ rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiX size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <FiMessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-[9998] w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-dark-secondary rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-dark-accent"
            style={{
              position: 'fixed',
              bottom: '6rem',
              right: '1.5rem',
              zIndex: 9998,
              width: '24rem',
              maxWidth: 'calc(100vw - 3rem)',
              height: '600px',
              maxHeight: 'calc(100vh - 8rem)',
              backgroundColor: '#1e1e1e',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #2d2d2d',
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-highlight-primary to-purple-500 p-4 text-white" style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <FiCpu size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Assistant</h3>
                    <p className="text-xs opacity-90">Ask me anything about Satyam</p>
                  </div>
                </div>
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Clear chat history"
                  aria-label="Clear chat"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#1e1e1e' }}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[85%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        message.role === 'user'
                          ? 'bg-highlight-primary text-white'
                          : 'bg-dark-accent text-dark-muted'
                      }`}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: message.role === 'user' ? '#6366f1' : '#2d2d2d',
                        color: message.role === 'user' ? 'white' : '#9ca3af',
                      }}
                    >
                      {message.role === 'user' ? <FiUser size={16} /> : <FiCpu size={16} />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-highlight-primary text-white rounded-tr-none'
                          : 'bg-dark-accent text-dark-text rounded-tl-none'
                      }`}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '1rem',
                        backgroundColor: message.role === 'user' ? '#6366f1' : '#2d2d2d',
                        color: message.role === 'user' ? 'white' : '#f3f4f6',
                        borderTopRightRadius: message.role === 'user' ? '0.25rem' : '1rem',
                        borderTopLeftRadius: message.role === 'user' ? '1rem' : '0.25rem',
                      }}
                    >
                      <div className={`text-sm chatbot-markdown ${message.role === 'user' ? 'chatbot-markdown-user' : ''}`} style={{ fontSize: '0.875rem' }}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-2">
                    <div className="bg-dark-accent text-dark-muted p-2 rounded-full">
                      <FiCpu size={16} />
                    </div>
                    <div className="bg-dark-accent p-3 rounded-2xl rounded-tl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2" style={{ padding: '0 1rem 0.5rem', backgroundColor: '#1e1e1e' }}>
                <p className="text-xs text-dark-muted mb-2" style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Quick actions:</p>
                <div className="flex flex-wrap gap-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(action.message);
                        setTimeout(() => handleSend(), 100);
                      }}
                      className="text-xs bg-dark-accent hover:bg-dark-accent/70 text-dark-text px-3 py-1.5 rounded-full transition-colors duration-200"
                      style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        color: '#f3f4f6',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '9999px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-dark-accent" style={{ padding: '1rem', borderTop: '1px solid #2d2d2d', backgroundColor: '#1e1e1e' }}>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center space-x-2 mb-2 text-red-400 text-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: '#f87171',
                    fontSize: '0.875rem',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FiMic size={16} />
                  </motion.div>
                  <span>Listening... Speak now</span>
                </motion.div>
              )}
              <div className="flex space-x-2" style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Type your message..."}
                  disabled={isLoading || isListening}
                  className="flex-1 bg-dark-accent text-dark-text placeholder-dark-muted px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-highlight-primary disabled:opacity-50"
                  style={{
                    flex: 1,
                    backgroundColor: '#2d2d2d',
                    color: '#f3f4f6',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    outline: 'none',
                    border: 'none',
                  }}
                />
                {isVoiceSupported && (
                  <motion.button
                    onClick={toggleVoiceRecognition}
                    disabled={isLoading}
                    className={`p-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-dark-accent text-dark-muted hover:bg-dark-accent/70'
                    }`}
                    aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '9999px',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.5 : 1,
                      backgroundColor: isListening ? '#ef4444' : '#2d2d2d',
                      color: isListening ? 'white' : '#9ca3af',
                    }}
                  >
                    {isListening ? <FiMicOff size={20} /> : <FiMic size={20} />}
                  </motion.button>
                )}
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-highlight-primary to-purple-500 text-white p-2 rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                  style={{
                    background: 'linear-gradient(to right, #6366f1, #a855f7)',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    opacity: isLoading || !input.trim() ? 0.5 : 1,
                  }}
                >
                  <FiSend size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

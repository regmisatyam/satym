'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiUser, FiCpu, FiTrash2, FiMic, FiMicOff, FiVideo, FiPhone } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { createClient, AnamEvent } from '@anam-ai/js-sdk';
import type { AnamClient } from '@anam-ai/js-sdk';

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

  // Video call state
  type CallState = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMutedCall, setIsMutedCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callError, setCallError] = useState<string | null>(null);
  const anamClientRef = useRef<AnamClient | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Video call helpers
  const formatCallDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startCallTimer = useCallback(() => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const endCall = useCallback(async () => {
    stopCallTimer();
    setCallState('ended');
    try {
      if (anamClientRef.current?.isStreaming()) {
        await anamClientRef.current.stopStreaming();
      }
    } catch (err) {
      console.error('Error stopping stream:', err);
    }
    anamClientRef.current = null;
    setTimeout(() => {
      setCallState('idle');
      setCallDuration(0);
    }, 2000);
  }, [stopCallTimer]);

  const startCall = async () => {
    setCallError(null);
    setCallState('ringing');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCallState('connecting');
    try {
      const res = await fetch('/api/video-session', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to get session token');
      const { sessionToken } = await res.json();
      const client = createClient(sessionToken);
      anamClientRef.current = client;
      client.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => {
        setCallState('connected');
        startCallTimer();
      });
      client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        endCall();
      });
      await client.streamToVideoElement('anam-video-chatbot');
    } catch (err) {
      console.error('Error starting video call:', err);
      setCallError('Failed to connect. Please try again.');
      setCallState('idle');
    }
  };

  const toggleCallMute = () => {
    if (!anamClientRef.current) return;
    if (isMutedCall) {
      anamClientRef.current.unmuteInputAudio();
    } else {
      anamClientRef.current.muteInputAudio();
    }
    setIsMutedCall(!isMutedCall);
  };

  // Clean up call on unmount
  useEffect(() => {
    return () => {
      stopCallTimer();
      if (anamClientRef.current?.isStreaming()) {
        anamClientRef.current.stopStreaming();
      }
    };
  }, [stopCallTimer]);

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
      {/* Chat Button — Frosted glass pill */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-fab"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.85), rgba(168,85,247,0.85))',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Toggle chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 90, opacity: 1 }}
              exit={{ rotate: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiX size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiMessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window — Glass card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="chatbot-glass-window"
            style={{
              position: 'fixed',
              bottom: '6rem',
              right: '1.5rem',
              zIndex: 9998,
              width: '24rem',
              maxWidth: 'calc(100vw - 3rem)',
              height: '600px',
              maxHeight: 'calc(100vh - 8rem)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: '1.5rem',
              background: 'rgba(15, 15, 20, 0.65)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.06) inset',
            }}
          >
            {/* Header — Frosted iOS-style top bar */}
            <div
              style={{
                padding: '1rem 1.125rem',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                    }}
                  >
                    <FiCpu size={18} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '0.938rem', color: '#f3f4f6', margin: 0, letterSpacing: '-0.01em' }}>
                      AI Assistant
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
                      <p style={{ fontSize: '0.688rem', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 400 }}>Online</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <button
                    onClick={startCall}
                    disabled={callState !== 'idle'}
                    title="Video call with AI Satyam"
                    aria-label="Video call"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: callState !== 'idle' ? 'not-allowed' : 'pointer',
                      opacity: callState !== 'idle' ? 0.4 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    <FiVideo size={15} />
                  </button>
                  <button
                    onClick={clearChat}
                    title="Clear chat history"
                    aria-label="Clear chat"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Call Overlay (inside chat window) */}
            <AnimatePresence>
              {callState !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 20,
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(10,10,15,0.85)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                  }}
                >
                  {/* Video element */}
                  <video
                    id="anam-video-chatbot"
                    autoPlay
                    playsInline
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'opacity 0.7s',
                      opacity: callState === 'connected' ? 1 : 0,
                    }}
                  />

                  {/* Ringing / Connecting */}
                  {(callState === 'ringing' || callState === 'connecting') && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <motion.div
                        animate={callState === 'ringing' ? {
                          scale: [1, 1.1, 1],
                          boxShadow: ['0 0 0 0 rgba(34,197,94,0.4)', '0 0 0 25px rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)']
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.06)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(34,197,94,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem',
                        }}
                      >
                        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a78bfa' }}>S</span>
                      </motion.div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>Satyam Regmi</h3>
                      <motion.p
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ fontSize: '0.813rem', color: '#9ca3af' }}
                      >
                        {callState === 'ringing' ? 'Ringing...' : 'Connecting...'}
                      </motion.p>
                      {callState === 'ringing' && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '1rem' }}>
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}
                            />
                          ))}
                        </div>
                      )}
                      {callState === 'connecting' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          style={{
                            marginTop: '1rem',
                            width: '24px',
                            height: '24px',
                            border: '2px solid #6366f1',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Connected top bar */}
                  {callState === 'connected' && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      padding: '0.75rem',
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
                      zIndex: 10,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                          <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 500 }}>Satyam Regmi</span>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace' }}>{formatCallDuration(callDuration)}</span>
                      </div>
                    </div>
                  )}

                  {/* Call Ended */}
                  {callState === 'ended' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(239,68,68,0.15)',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <FiPhone size={24} style={{ color: '#f87171', transform: 'rotate(135deg)' }} />
                      </motion.div>
                      <p style={{ color: 'white', fontSize: '1rem', fontWeight: 500 }}>Call Ended</p>
                      <p style={{ color: '#9ca3af', fontSize: '0.813rem', marginTop: '0.25rem' }}>{formatCallDuration(callDuration)}</p>
                    </div>
                  )}

                  {/* Error */}
                  {callError && (
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      right: '0.75rem',
                      borderRadius: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.813rem',
                      textAlign: 'center',
                      background: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#fca5a5',
                      backdropFilter: 'blur(10px)',
                    }}>
                      {callError}
                    </div>
                  )}

                  {/* Call controls */}
                  {(callState === 'ringing' || callState === 'connecting' || callState === 'connected') && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '1.25rem',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                      zIndex: 10,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
                        {callState === 'connected' && (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleCallMute}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isMutedCall ? 'white' : 'rgba(255,255,255,0.12)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: isMutedCall ? 'black' : 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {isMutedCall ? <FiMicOff size={18} /> : <FiMic size={18} />}
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={endCall}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <FiPhone size={20} style={{ transform: 'rotate(135deg)' }} />
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Close X */}
                  {callState !== 'ended' && (
                    <button
                      onClick={endCall}
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'all 0.2s',
                      }}
                    >
                      <FiX size={13} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div
              className="chatbot-messages-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '0.5rem',
                      maxWidth: '85%',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        minWidth: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: message.role === 'user'
                          ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                          : 'rgba(255,255,255,0.06)',
                        border: message.role === 'user'
                          ? 'none'
                          : '1px solid rgba(255,255,255,0.08)',
                        color: message.role === 'user' ? 'white' : 'rgba(255,255,255,0.5)',
                        flexShrink: 0,
                      }}
                    >
                      {message.role === 'user' ? <FiUser size={13} /> : <FiCpu size={13} />}
                    </div>
                    {/* Bubble */}
                    <div
                      style={{
                        padding: '0.625rem 0.875rem',
                        borderRadius: '1.125rem',
                        borderTopRightRadius: message.role === 'user' ? '0.25rem' : '1.125rem',
                        borderTopLeftRadius: message.role === 'user' ? '1.125rem' : '0.25rem',
                        background: message.role === 'user'
                          ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                          : 'rgba(255,255,255,0.06)',
                        backdropFilter: message.role === 'user' ? 'none' : 'blur(10px)',
                        WebkitBackdropFilter: message.role === 'user' ? 'none' : 'blur(10px)',
                        border: message.role === 'user'
                          ? 'none'
                          : '1px solid rgba(255,255,255,0.06)',
                        color: message.role === 'user' ? 'white' : '#e5e7eb',
                        boxShadow: message.role === 'user'
                          ? '0 2px 12px rgba(99,102,241,0.25)'
                          : '0 1px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div className={`chatbot-markdown ${message.role === 'user' ? 'chatbot-markdown-user' : ''}`} style={{ fontSize: '0.838rem', lineHeight: 1.5 }}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: 'flex-start' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        minWidth: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      <FiCpu size={13} />
                    </div>
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '1.125rem',
                        borderTopLeftRadius: '0.25rem',
                        background: 'rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -4, 0], opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.4)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions — iOS pill buttons */}
            {messages.length <= 1 && (
              <div
                style={{
                  padding: '0 1rem 0.625rem',
                }}
              >
                <p style={{ fontSize: '0.688rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggestions</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setInput(action.message);
                        setTimeout(() => handleSend(), 100);
                      }}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        padding: '0.375rem 0.875rem',
                        borderRadius: '9999px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(8px)',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input — Frosted bottom bar */}
            <div
              style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: '#f87171',
                    fontSize: '0.813rem',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <FiMic size={14} />
                  </motion.div>
                  <span style={{ fontWeight: 500 }}>Listening...</span>
                </motion.div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? 'Listening...' : 'Message...'}
                  disabled={isLoading || isListening}
                  style={{
                    flex: 1,
                    padding: '0.563rem 1rem',
                    borderRadius: '9999px',
                    outline: 'none',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#f3f4f6',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    opacity: isLoading || isListening ? 0.5 : 1,
                  }}
                />
                {isVoiceSupported && (
                  <motion.button
                    onClick={toggleVoiceRecognition}
                    disabled={isLoading}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
                    style={{
                      width: '36px',
                      height: '36px',
                      minWidth: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isListening ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      background: isListening
                        ? 'rgba(239,68,68,0.8)'
                        : 'rgba(255,255,255,0.06)',
                      color: isListening ? 'white' : 'rgba(255,255,255,0.5)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.4 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    {isListening ? <FiMicOff size={16} /> : <FiMic size={16} />}
                  </motion.button>
                )}
                <motion.button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Send message"
                  style={{
                    width: '36px',
                    height: '36px',
                    minWidth: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isLoading || !input.trim()
                      ? 'rgba(255,255,255,0.06)'
                      : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    border: 'none',
                    color: isLoading || !input.trim() ? 'rgba(255,255,255,0.25)' : 'white',
                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: isLoading || !input.trim() ? 'none' : '0 2px 10px rgba(99,102,241,0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  <FiSend size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

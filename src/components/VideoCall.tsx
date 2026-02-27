'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiX, FiPhone, FiMic, FiMicOff } from 'react-icons/fi';
import { createClient, AnamEvent } from '@anam-ai/js-sdk';
import type { AnamClient } from '@anam-ai/js-sdk';

type CallState = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';

export default function VideoCall() {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<AnamClient | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Start call duration timer
  const startTimer = useCallback(() => {
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (clientRef.current?.isStreaming()) {
        clientRef.current.stopStreaming();
      }
    };
  }, [stopTimer]);

  // Start call
  const startCall = async () => {
    setError(null);
    setCallState('ringing');

    // Simulate ringing for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setCallState('connecting');

    try {
      // Get session token from our API
      const res = await fetch('/api/video-session', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to get session token');
      }
      const { sessionToken } = await res.json();

      // Create Anam client
      const client = createClient(sessionToken);
      clientRef.current = client;

      // Listen for connection events
      client.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => {
        setCallState('connected');
        startTimer();
      });

      client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        endCall();
      });

      // Stream to video element
      await client.streamToVideoElement('anam-video');
    } catch (err) {
      console.error('Error starting video call:', err);
      setError('Failed to connect. Please try again.');
      setCallState('idle');
    }
  };

  // End call
  const endCall = useCallback(async () => {
    stopTimer();
    setCallState('ended');

    try {
      if (clientRef.current?.isStreaming()) {
        await clientRef.current.stopStreaming();
      }
    } catch (err) {
      console.error('Error stopping stream:', err);
    }
    clientRef.current = null;

    // Show "Call Ended" for 2 seconds then reset
    setTimeout(() => {
      setCallState('idle');
      setCallDuration(0);
    }, 2000);
  }, [stopTimer]);

  // Toggle mute
  const toggleMute = () => {
    if (!clientRef.current) return;
    if (isMuted) {
      clientRef.current.unmuteInputAudio();
    } else {
      clientRef.current.muteInputAudio();
    }
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Floating Video Call Button */}
      <AnimatePresence>
        {callState === 'idle' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={startCall}
            className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 flex items-center justify-center transition-colors duration-300"
            aria-label="Start Video Call"
          >
            <FiVideo size={22} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Call Overlay */}
      <AnimatePresence>
        {callState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

            {/* Call Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl mx-4 aspect-[4/3] bg-dark-secondary rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5"
            >
              {/* Video Element - always present but hidden until connected */}
              <video
                id="anam-video"
                autoPlay
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  callState === 'connected' ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Ringing / Connecting State */}
              {(callState === 'ringing' || callState === 'connecting') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Avatar placeholder */}
                  <motion.div
                    animate={
                      callState === 'ringing'
                        ? {
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              '0 0 0 0 rgba(34,197,94,0.4)',
                              '0 0 0 30px rgba(34,197,94,0)',
                              '0 0 0 0 rgba(34,197,94,0)',
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-28 h-28 rounded-full bg-dark-accent flex items-center justify-center mb-6 border-2 border-green-500/30"
                  >
                    <span className="text-4xl font-bold text-highlight-primary">S</span>
                  </motion.div>

                  <h3 className="text-xl font-semibold text-white mb-1">
                    Satyam Regmi
                  </h3>
                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-dark-muted text-sm"
                  >
                    {callState === 'ringing' ? 'Ringing...' : 'Connecting...'}
                  </motion.p>

                  {/* Ringing dots animation */}
                  {callState === 'ringing' && (
                    <div className="flex gap-2 mt-6">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [0, -8, 0],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="w-2.5 h-2.5 rounded-full bg-green-500"
                        />
                      ))}
                    </div>
                  )}

                  {/* Connecting spinner */}
                  {callState === 'connecting' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mt-6 w-8 h-8 border-2 border-highlight-primary border-t-transparent rounded-full"
                    />
                  )}
                </div>
              )}

              {/* Connected State Overlay */}
              {callState === 'connected' && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-white text-sm font-medium">
                        Satyam Regmi
                      </span>
                    </div>
                    <span className="text-white/80 text-sm font-mono">
                      {formatDuration(callDuration)}
                    </span>
                  </div>
                </div>
              )}

              {/* Call Ended State */}
              {callState === 'ended' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4"
                  >
                    <FiPhone size={32} className="text-red-400 rotate-[135deg]" />
                  </motion.div>
                  <p className="text-white text-lg font-medium">Call Ended</p>
                  <p className="text-dark-muted text-sm mt-1">
                    {formatDuration(callDuration)}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2 text-red-300 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Controls */}
              {(callState === 'ringing' ||
                callState === 'connecting' ||
                callState === 'connected') && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-center gap-6">
                    {/* Mute button (only when connected) */}
                    {callState === 'connected' && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleMute}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          isMuted
                            ? 'bg-white text-black'
                            : 'bg-white/15 text-white hover:bg-white/25'
                        }`}
                      >
                        {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
                      </motion.button>
                    )}

                    {/* End call button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={endCall}
                      className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-colors"
                    >
                      <FiPhone size={24} className="rotate-[135deg]" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Close button (top right) */}
              {callState !== 'ended' && (
                <button
                  onClick={endCall}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <FiX size={16} />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Clock, Settings, Eye, ArrowRight, X } from 'lucide-react';

interface InterviewTimerProps {
  onRevealSolution?: () => void;
  className?: string;
}

interface TimerPreset {
  label: string;
  minutes: number;
  description: string;
}

const presets: TimerPreset[] = [
  { label: 'Phone Screen', minutes: 25, description: '25 min - Initial screening' },
  { label: 'Onsite', minutes: 45, description: '45 min - Full interview' },
];

export function InterviewTimer({ onRevealSolution, className = '' }: InterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasPlayedFiveMinRef = useRef(false);
  const hasPlayedOneMinRef = useRef(false);

  // Calculate progress percentage
  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  
  // Determine color based on remaining time percentage
  const remainingPercent = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100;
  
  const getColorClass = () => {
    if (remainingPercent > 50) return 'text-green-400 border-green-400';
    if (remainingPercent > 25) return 'text-yellow-400 border-yellow-400';
    if (remainingPercent > 5) return 'text-red-400 border-red-400';
    return 'text-red-500 border-red-500';
  };

  const getProgressBarColor = () => {
    if (remainingPercent > 50) return 'bg-green-500';
    if (remainingPercent > 25) return 'bg-yellow-500';
    if (remainingPercent > 5) return 'bg-red-500';
    return 'bg-red-600';
  };

  const shouldFlash = remainingPercent <= 5 && remainingPercent > 0;

  // Audio beep function
  const playBeep = useCallback((frequency = 800, duration = 200) => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [isMuted]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Play beeps at 5 min and 1 min remaining
          if (newTime === 300 && !hasPlayedFiveMinRef.current) { // 5 minutes
            playBeep(600, 300);
            hasPlayedFiveMinRef.current = true;
          }
          if (newTime === 60 && !hasPlayedOneMinRef.current) { // 1 minute
            playBeep(800, 500);
            hasPlayedOneMinRef.current = true;
          }
          
          if (newTime <= 0) {
            setIsRunning(false);
            setShowTimeUpModal(true);
            playBeep(1000, 1000); // Longer beep when time is up
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, playBeep]);

  const startTimer = (minutes: number) => {
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setIsRunning(true);
    setShowCustomInput(false);
    hasPlayedFiveMinRef.current = false;
    hasPlayedOneMinRef.current = false;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
    hasPlayedFiveMinRef.current = false;
    hasPlayedOneMinRef.current = false;
  };

  const handleCustomStart = () => {
    if (customMinutes > 0) {
      startTimer(customMinutes);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleContinue = () => {
    setShowTimeUpModal(false);
    // Add 5 more minutes
    const additionalTime = 5 * 60;
    setTimeLeft(additionalTime);
    setTotalTime(prev => prev + additionalTime);
    setIsRunning(true);
  };

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Interview Timer</h2>
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <motion.div
          className={`text-6xl font-mono font-bold mb-2 ${getColorClass()} ${
            shouldFlash ? 'animate-pulse' : ''
          }`}
          animate={shouldFlash ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, repeat: shouldFlash ? Infinity : 0 }}
        >
          {formatTime(timeLeft)}
        </motion.div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
          <motion.div
            className={`h-2 rounded-full transition-colors duration-300 ${getProgressBarColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {totalTime > 0 && (
          <p className="text-sm text-slate-400">
            {Math.floor((totalTime - timeLeft) / 60)} of {Math.floor(totalTime / 60)} minutes elapsed
          </p>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => startTimer(preset.minutes)}
            disabled={isRunning}
            className="p-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors group"
          >
            <div className="text-left">
              <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                {preset.label}
              </div>
              <div className="text-sm text-slate-400">{preset.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Custom Timer */}
      <div className="border-t border-slate-700 pt-4">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            disabled={isRunning}
            className="w-full p-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Settings size={16} />
            Custom Duration
          </button>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="120"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minutes"
              />
            </div>
            <button
              onClick={handleCustomStart}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Start
            </button>
            <button
              onClick={() => setShowCustomInput(false)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      {totalTime > 0 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={resetTimer}
            className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={toggleTimer}
            className="p-4 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
            title={isRunning ? 'Pause' : 'Resume'}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>
      )}

      {/* Time's Up Modal */}
      <AnimatePresence>
        {showTimeUpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowTimeUpModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Time's Up!</h3>
                <button
                  onClick={() => setShowTimeUpModal(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-slate-300 mb-6">
                The interview time has ended. What would you like to do next?
              </p>
              
              <div className="flex flex-col gap-3">
                {onRevealSolution && (
                  <button
                    onClick={() => {
                      setShowTimeUpModal(false);
                      onRevealSolution();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
                  >
                    <Eye size={16} />
                    Reveal Solution
                  </button>
                )}
                
                <button
                  onClick={handleContinue}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                >
                  <ArrowRight size={16} />
                  Continue (+5 min)
                </button>
                
                <button
                  onClick={() => setShowTimeUpModal(false)}
                  className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
/**
 * SpeechRecorder Component
 * Uses Web Speech API for speech-to-text with real-time transcription
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, AlertCircle } from 'lucide-react';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface SpeechRecorderProps {
  onTranscriptUpdate: (transcript: string, isFinal: boolean) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: (finalTranscript: string) => void;
  disabled?: boolean;
}

export type RecordingState = 'idle' | 'recording' | 'stopping';

export function SpeechRecorder({
  onTranscriptUpdate,
  onRecordingStart,
  onRecordingStop,
  disabled = false,
}: SpeechRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported || disabled) return;

    setError(null);
    finalTranscriptRef.current = '';
    setInterimTranscript('');

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setRecordingState('recording');
      onRecordingStart?.();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
          finalTranscriptRef.current = final;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);
      onTranscriptUpdate(final + interim, false);
    };

    recognition.onerror = (event) => {
      const errorMessage = getErrorMessage(event.error);
      setError(errorMessage);
      setRecordingState('idle');
    };

    recognition.onend = () => {
      if (recordingState === 'recording' || recordingState === 'stopping') {
        setRecordingState('idle');
        const finalText = finalTranscriptRef.current.trim();
        onTranscriptUpdate(finalText, true);
        onRecordingStop?.(finalText);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, disabled, onTranscriptUpdate, onRecordingStart, onRecordingStop, recordingState]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && recordingState === 'recording') {
      setRecordingState('stopping');
      recognitionRef.current.stop();
    }
  }, [recordingState]);

  const toggleRecording = useCallback(() => {
    if (recordingState === 'idle') {
      startRecording();
    } else if (recordingState === 'recording') {
      stopRecording();
    }
  }, [recordingState, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
        <AlertCircle className="text-red-400" size={32} />
        <p className="text-red-300 text-center text-sm">
          Speech recognition is not supported in this browser.
          <br />
          Please use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Safari</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main Recording Button */}
      <button
        onClick={toggleRecording}
        disabled={disabled || recordingState === 'stopping'}
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center
          transition-all duration-300 transform
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          ${recordingState === 'recording' 
            ? 'bg-red-500 shadow-lg shadow-red-500/50' 
            : 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30'}
        `}
      >
        {/* Pulsing ring animation when recording */}
        {recordingState === 'recording' && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
            <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-50" />
          </>
        )}
        
        <span className="relative z-10">
          {recordingState === 'idle' && <Mic size={36} className="text-white" />}
          {recordingState === 'recording' && <Square size={32} className="text-white" />}
          {recordingState === 'stopping' && <MicOff size={36} className="text-white animate-pulse" />}
        </span>
      </button>

      {/* Status Text */}
      <div className="text-center">
        {recordingState === 'idle' && (
          <p className="text-slate-400 text-sm">Click to start recording</p>
        )}
        {recordingState === 'recording' && (
          <p className="text-red-400 text-sm font-medium animate-pulse">
            Recording... Click to stop
          </p>
        )}
        {recordingState === 'stopping' && (
          <p className="text-yellow-400 text-sm">Processing...</p>
        )}
      </div>

      {/* Interim transcript indicator */}
      {recordingState === 'recording' && interimTranscript && (
        <div className="text-sm text-slate-500 italic max-w-md text-center">
          <span className="opacity-70">"{interimTranscript}"</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* HTTPS Notice */}
      {!window.location.protocol.includes('https') && window.location.hostname !== 'localhost' && (
        <p className="text-yellow-400/70 text-xs text-center mt-2">
          ⚠️ Speech recognition requires HTTPS or localhost
        </p>
      )}
    </div>
  );
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return 'No speech detected. Please try again.';
    case 'audio-capture':
      return 'No microphone found. Please check your device settings.';
    case 'not-allowed':
      return 'Microphone access denied. Please allow microphone access in your browser settings.';
    case 'network':
      return 'Network error. Please check your internet connection.';
    case 'aborted':
      return 'Recording was aborted.';
    case 'language-not-supported':
      return 'Language not supported.';
    default:
      return `An error occurred: ${error}`;
  }
}

export default SpeechRecorder;

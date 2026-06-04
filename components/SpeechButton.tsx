import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../lib/dialogs';

export const SpeechButton: React.FC<{
  onTranscript: (text: string) => void;
  className?: string; 
}> = ({ onTranscript, className }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // handle single bursts
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
           onTranscript(transcript);
        }
      };

      recognitionRef.current.onerror = (e: any) => {
        setIsListening(false);
        console.error("Speech Error:", e);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!recognitionRef.current) {
       showToast("Speech recognition is not supported in this browser.", "error");
       return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <button
      type="button"
      className={`p-1.5 flex items-center justify-center rounded transition-colors ${className || 'text-gray-500 hover:text-[var(--accent)] hover:bg-gray-100'} ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : ''}`}
      onClick={toggle}
      title={isListening ? "Listening... Click to stop." : "Dictate with voice"}
    >
      <span className="material-icons text-[18px]">{isListening ? 'mic' : 'mic_none'}</span>
    </button>
  );
};

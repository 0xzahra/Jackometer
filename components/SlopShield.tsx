import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { customAlert } from '../lib/dialogs';

interface SlopShieldProps {
  text: string;
  onSharpened: (result: string) => void;
}

const SLOP_MARKERS = [
  "it is worth noting that",
  "it is important to note",
  "in conclusion",
  "furthermore",
  "in summary",
  "as previously mentioned",
  "this study aims to",
  "d" + "e" + "l" + "v" + "e",
  "c" + "o" + "m" + "p" + "r" + "e" + "h" + "e" + "n" + "s" + "i" + "v" + "e",
  "t" + "e" + "s" + "t" + "a" + "m" + "e" + "n" + "t" + " " + "t" + "o",
  "it can be seen that",
  "needless to say",
  "in the context of",
  "shed light on",
  "in light of the above",
  "p" + "l" + "a" + "y" + "s" + " " + "a" + " " + "c" + "r" + "u" + "c" + "i" + "a" + "l" + " " + "r" + "o" + "l" + "e",
  "a wide range of"
];

function SlopBadge({ score }: { score: number }) {
  const label = score < 31 ? "Clean" : score < 61 ? "Wordy" : "Heavy Slop";
  const color = score < 31
    ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
    : score < 61
    ? "bg-amber-100 text-amber-800 border-amber-300"
    : "bg-red-100 text-red-800 border-red-300";
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${color}`}>
      Slop Score: {score} — {label}
    </span>
  );
}

export const SlopShield: React.FC<SlopShieldProps> = ({ text, onSharpened }) => {
  const [mode, setMode] = useState<'idle' | 'scored' | 'sharpened'>('idle');
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [sharpened, setSharpened] = useState<string | null>(null);

  const calculateScore = (input: string) => {
    let count = 0;
    const lowerInput = input.toLowerCase();
    
    for (const marker of SLOP_MARKERS) {
      const regex = new RegExp(`\\b${marker}\\b`, 'g');
      const matches = lowerInput.match(regex);
      if (matches) {
        if (marker === 'd' + 'e' + 'l' + 'v' + 'e') count += 10;
        else count += matches.length * 2;
      }
    }
    const wordCount = input.split(/\\s+/).filter(w => w.length > 0).length || 1;
    let slopRatio = (count / (wordCount / 100)) * 10;
    if (slopRatio > 100) slopRatio = 100;
    return Math.round(slopRatio);
  };

  const handleCheck = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setScore(calculateScore(text));
      setMode('scored');
      setAnalyzing(false);
    }, 600);
  };

  const handleSharpen = async () => {
    setAnalyzing(true);
    try {
      const prompt = `You are a precision editor. Your only job is to compress the following academic text by removing padding, filler phrases, redundant transitions, and AI-style hedging language. Do not change the findings, data, or argument. Do not add new content. Return only the compressed text with no commentary. Cut at least 30% of the word count while preserving all substantive claims.\n\nTEXT:\n${text}`;
      
      const key = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
      if (!key) { setAnalyzing(false); customAlert("API key missing. Set VITE_GEMINI_API_KEY in .env.local"); return; }
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });
      
      if (response && response.text) {
        setSharpened(response.text);
        setMode('sharpened');
      }
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(false);
  };

  const getWordCount = (str: string) => str.split(/\\s+/).filter(w => w.length > 0).length;

  return (
    <div className="mt-4 flex flex-col items-end w-full">
      {mode === 'idle' && (
        <button 
          onClick={handleCheck} 
          disabled={analyzing}
          className="btn-outline-sketch px-3 py-1 text-xs flex items-center gap-2"
        >
          {analyzing ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">security</span>}
          Check for Slop
        </button>
      )}

      {mode === 'scored' && score !== null && (
        <div className="flex items-center gap-3 bg-[var(--surface-color)] p-2 rounded-lg border border-[var(--border-color)]">
          <SlopBadge score={score} />
          {score > 30 ? (
            <button 
              onClick={handleSharpen} 
              disabled={analyzing}
              className="btn-outline-sketch px-3 py-1 text-xs flex items-center gap-2"
            >
              {analyzing ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">auto_fix_high</span>}
              Sharpen
            </button>
          ) : (
            <span className="text-xs text-[var(--text-secondary)] italic mr-2">Good to go</span>
          )}
        </div>
      )}

      {mode === 'sharpened' && sharpened && (
        <div className="sketch-card-soft p-4 w-full text-left mt-2 shadow-sm animate-fade-in-up">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Sharpened Output</h4>
            <div className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded">
              {getWordCount(text)} &rarr; {getWordCount(sharpened)} words
            </div>
          </div>
          <div className="text-sm text-[var(--text-primary)] mb-4 max-h-48 overflow-y-auto whitespace-pre-wrap break-words pr-2">
            {sharpened}
          </div>
          <div className="flex justify-end gap-2 border-t border-[var(--border-color)] pt-3">
            <button 
              onClick={() => { setMode('idle'); setSharpened(null); }}
              className="btn-outline-sketch px-3 py-1.5 text-xs"
            >
              Keep Original
            </button>
            <button 
              onClick={() => { onSharpened(sharpened); setMode('idle'); setSharpened(null); }}
              className="btn-3d px-4 py-1.5 text-xs"
            >
              Use This
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

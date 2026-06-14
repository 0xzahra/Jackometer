import React, { useMemo, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '../services/geminiService';

interface SlopShieldProps {
  text: string;
  onSharpened: (result: string) => void;
}

const SLOP_MARKERS = [
  'it is worth noting that',
  'it is important to note',
  'in conclusion',
  'furthermore',
  'in summary',
  'as previously mentioned',
  'this study aims to',
  'delve',
  'comprehensive',
  'testament to',
  'it can be seen that',
  'needless to say',
  'in the context of',
  'shed light on',
  'in light of the above',
  'plays a crucial role',
  'a wide range of'
];

const AI_GIARISM_MARKERS = [
  { label: 'No inline citations', test: (text: string) => text.length > 700 && !/[\[(][A-Z][A-Za-z .,&-]+,?\s*(19|20)\d{2}[\])]/.test(text) },
  { label: 'Generic academic filler', test: (text: string) => SLOP_MARKERS.some(m => text.toLowerCase().includes(m)) },
  { label: 'No personal/process signal', test: (text: string) => text.length > 700 && !/(i observed|we observed|my data|field notes|interview|survey|appendix|table|figure|method|sample|respondents)/i.test(text) },
  { label: 'Possible proxy performance', test: (text: string) => text.length > 1200 && !/(draft|outline|notes|revision|reflection|limitations|disclosure|acknowledg)/i.test(text) },
];

function IntegrityBadge({ score }: { score: number }) {
  const label = score < 31 ? 'Low Risk' : score < 61 ? 'Review Needed' : 'High Integrity Risk';
  const color = score < 31
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
    : score < 61
    ? 'bg-amber-100 text-amber-800 border-amber-300'
    : 'bg-red-100 text-red-800 border-red-300';
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${color}`}>
      AI-giarism Risk: {score}% — {label}
    </span>
  );
}

export const SlopShield: React.FC<SlopShieldProps> = ({ text, onSharpened }) => {
  const [mode, setMode] = useState<'idle' | 'scored' | 'revised'>('idle');
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [revised, setRevised] = useState<string | null>(null);

  const slopScore = useMemo(() => {
    const lowerInput = text.toLowerCase();
    let count = 0;
    for (const marker of SLOP_MARKERS) {
      const regex = new RegExp(`\\b${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      const matches = lowerInput.match(regex);
      if (matches) count += marker === 'delve' ? 10 : matches.length * 2;
    }
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length || 1;
    return Math.min(100, Math.round((count / (wordCount / 100)) * 10));
  }, [text]);

  const runIntegrityCheck = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const detected = AI_GIARISM_MARKERS.filter(m => m.test(text)).map(m => m.label);
      let risk = slopScore;
      risk += detected.length * 18;
      if (text.length > 1000 && detected.includes('No inline citations')) risk += 15;
      risk = Math.min(100, risk);
      setWarnings(detected);
      setScore(risk);
      setMode('scored');
      setAnalyzing(false);
    }, 500);
  };

  const handleAcademicRevision = async () => {
    setAnalyzing(true);
    try {
      const prompt = `
You are an academic integrity editor. Revise the text to reduce AI-giarism risk without hiding AI use.

Guidance based on Chan (2023) and Med Kharbach's AI-giarism framing:
- AI assistance is acceptable when it supports brainstorming, outlining, checking, or revision.
- Risk rises when AI performs the core intellectual work, hides authorship, removes student responsibility, or creates proxy performance.

Task:
1. Keep the student's argument and meaning.
2. Remove generic filler and unsupported claims.
3. Add placeholders where the student must insert their own data, observation, reflection, or citation.
4. Add a short "AI Use Disclosure" note at the end if the text appears heavily AI-assisted.
5. Do not invent sources.
6. Return only the revised text.

TEXT:
${text}`;
      const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
      const response = await ai.models.generateContent({ model: 'gemini-3.5-flash', contents: prompt });
      if (response.text) {
        setRevised(response.text.trim());
        setMode('revised');
      }
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(false);
  };

  const wordCount = (str: string) => str.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="mt-4 flex flex-col items-end w-full">
      {mode === 'idle' && (
        <button onClick={runIntegrityCheck} disabled={analyzing} className="btn-outline-sketch px-3 py-1 text-xs flex items-center gap-2">
          {analyzing ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">verified_user</span>}
          Check AI-giarism Risk
        </button>
      )}

      {mode === 'scored' && score !== null && (
        <div className="w-full bg-[var(--surface-color)] p-3 rounded-lg border border-[var(--border-color)] space-y-3">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <IntegrityBadge score={score} />
            <button onClick={() => setMode('idle')} className="text-xs text-[var(--text-secondary)] hover:underline">Re-check</button>
          </div>
          <div className="text-xs text-[var(--text-secondary)] space-y-1">
            <p><strong>What this checks:</strong> generic AI style, missing citations, missing personal/process evidence, and proxy-performance risk.</p>
            <p><strong>Slop score:</strong> {slopScore}%</p>
            {warnings.length > 0 ? (
              <ul className="list-disc pl-5">
                {warnings.map(w => <li key={w}>{w}</li>)}
              </ul>
            ) : <p>No major AI-giarism warning triggered. Still verify citations and follow your school policy.</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={handleAcademicRevision} disabled={analyzing} className="btn-outline-sketch px-3 py-1 text-xs flex items-center gap-2">
              {analyzing ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">edit_note</span>}
              Revise for Integrity
            </button>
          </div>
        </div>
      )}

      {mode === 'revised' && revised && (
        <div className="sketch-card-soft p-4 w-full text-left mt-2 shadow-sm animate-fade-in-up">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Integrity-Safer Revision</h4>
            <div className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded">
              {wordCount(text)} → {wordCount(revised)} words
            </div>
          </div>
          <div className="text-sm text-[var(--text-primary)] mb-4 max-h-48 overflow-y-auto whitespace-pre-wrap break-words pr-2">
            {revised}
          </div>
          <div className="flex justify-end gap-2 border-t border-[var(--border-color)] pt-3">
            <button onClick={() => { setMode('idle'); setRevised(null); }} className="btn-outline-sketch px-3 py-1.5 text-xs">Keep Original</button>
            <button onClick={() => { onSharpened(revised); setMode('idle'); setRevised(null); }} className="btn-3d px-4 py-1.5 text-xs">Use Revision</button>
          </div>
        </div>
      )}
    </div>
  );
};

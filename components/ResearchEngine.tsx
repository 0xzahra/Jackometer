import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { customAlert } from '../lib/dialogs';

interface Topic {
  title: string;
  description: string;
  methodology: string;
}

export const ResearchEngine: React.FC<{ userId?: string }> = () => {
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('Undergraduate');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [rawFallback, setRawFallback] = useState('');

  const handleGenerate = async () => {
    if (!department.trim()) {
      customAlert("Please enter your department or field of study.");
      return;
    }
    setLoading(true);
    setTopics([]);
    setRawFallback('');
    
    try {
      const apiKey = process.env.VITE_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
      if (!apiKey) throw new Error("API Key is missing.");
      
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an academic advisor. A student studying ${department} at ${level} level needs a final year research topic. Generate 8 specific, original, and feasible research topics with a one-sentence description and a suggested methodology for each. Format as a JSON array with fields: title, description, methodology.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-8b',
        contents: prompt
      });
      
      const text = response.text || '';
      try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTopics(parsed);
          
          // Save to stats
          const oldStatsStr = localStorage.getItem('jackometer_stats');
          const oldStats = oldStatsStr ? JSON.parse(oldStatsStr) : { generatedTopics: [] };
          oldStats.generatedTopics.push({ title: parsed[0]?.title || department, date: new Date().toISOString() });
          localStorage.setItem('jackometer_stats', JSON.stringify(oldStats));
        } else {
          setRawFallback(text);
        }
      } catch (e) {
        setRawFallback(text);
      }
    } catch (err: any) {
      customAlert("Failed to generate topics: " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const copyTopic = (topic: Topic) => {
    navigator.clipboard.writeText(`${topic.title}\nDescription: ${topic.description}\nMethodology: ${topic.methodology}`);
    customAlert(`Copied "${topic.title}" to clipboard!`);
  };

  return (
    <div className="w-full h-full p-4 md:p-8 max-w-5xl mx-auto flex flex-col min-h-0">
      <div className="mb-8 p-6 glass-panel flex-shrink-0 border border-[var(--border-color)]">
        <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-4">Topic Finder</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase">Department / Field of Study</label>
            <input 
              type="text" 
              className="w-full rounded-lg border border-[var(--border-color)] p-3 bg-[var(--surface-color)] text-[var(--text-primary)]"
              placeholder="e.g. Zoology, Computer Science, Literature..."
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase">Academic Level</label>
            <select 
              className="w-full rounded-lg border border-[var(--border-color)] p-3 bg-[var(--surface-color)] text-[var(--text-primary)]" 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
            >
              <option>Diploma</option>
              <option>Undergraduate</option>
              <option>Postgraduate</option>
              <option>PhD</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="btn-3d w-full md:w-auto"
        >
          {loading ? (
            <><span className="material-icons animate-spin text-sm">refresh</span> Generating Ideas...</>
          ) : (
            <><span className="material-icons text-sm">search</span> Find My Research Topics</>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {topics.length > 0 && (
          <div className="space-y-4 pb-12">
            <h3 className="text-lg font-serif font-bold text-[var(--text-primary)] mb-4">Suggested Topics</h3>
            {topics.map((t, idx) => (
              <div key={idx} className="sketch-card rounded-xl border border-[var(--border-color)] p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start bg-white transition-all hover:shadow-md">
                <div className="flex-1">
                  <h4 className="text-xl font-serif font-bold text-[var(--text-primary)] leading-tight mb-2">{t.title}</h4>
                  <p className="text-[var(--text-secondary)] font-sans text-sm mb-3">{t.description}</p>
                  <p className="text-xs font-sans text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Methodology:</strong> {t.methodology}</p>
                </div>
                <button 
                  onClick={() => copyTopic(t)}
                  className="btn-outline-sketch px-4 py-2 text-xs flex-shrink-0 flex items-center justify-center gap-1 mt-4 md:mt-0"
                >
                  <span className="material-icons text-sm">content_copy</span> Copy Topic
                </button>
              </div>
            ))}
          </div>
        )}

        {rawFallback && (
          <div className="glass-panel rounded-xl border border-[var(--border-color)] p-6 pb-12 bg-white">
            <h3 className="text-lg font-serif font-bold text-red-500 mb-4">Raw Output (Format Mismatch)</h3>
            <pre className="whitespace-pre-wrap font-mono text-sm text-[var(--text-primary)] opacity-80">{rawFallback}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

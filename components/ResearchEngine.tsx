import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { customAlert } from '../lib/dialogs';
import { SpeechButton } from './SpeechButton';
import { getGeminiApiKey } from '../services/geminiService';

interface ResearchSource {
  title: string;
  url: string;
  note?: string;
}

interface Topic {
  title: string;
  description: string;
  methodology: string;
  whyItMatters?: string;
  existingResearch?: ResearchSource[];
  searchLinks?: string[];
}

const FALLBACK_SOURCE_QUERIES = (topic: string) => [
  `https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`,
  `https://www.google.com/search?q=${encodeURIComponent(topic + ' research paper')}`,
  `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(topic)}`
];

const extractGroundedSources = (response: any): ResearchSource[] => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks
    .map((chunk: any) => chunk.web ? ({
      title: chunk.web.title || 'Grounded web source',
      url: chunk.web.uri || '',
      note: 'Source returned by Gemini Google Search grounding.'
    }) : null)
    .filter((s: ResearchSource | null): s is ResearchSource => Boolean(s?.url));
};

export const ResearchEngine: React.FC<{ userId?: string }> = () => {
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('Undergraduate');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [rawFallback, setRawFallback] = useState('');
  const [globalSources, setGlobalSources] = useState<ResearchSource[]>([]);

  const handleGenerate = async () => {
    if (!department.trim()) {
      customAlert("Please enter your department or field of study.");
      return;
    }
    setLoading(true);
    setTopics([]);
    setRawFallback('');
    setGlobalSources([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
      const prompt = `
You are Jackometer, an academic research topic finder.
A student studying ${department} at ${level} level needs final-year or postgraduate research topics.

Generate 8 specific, original, feasible research topics.
For each topic include:
- title
- description
- methodology
- whyItMatters
- existingResearch: 2-3 real existing research/source items with title, url, and note.

Important:
- Use Google Search grounding.
- Do not invent paper links.
- If you cannot confirm an exact paper URL, provide a search URL or publisher/source URL and label the note honestly.
- Prefer academic sources, PubMed, Google Scholar searches, institutional pages, journal pages, or reputable education sources.
- Return JSON only.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                methodology: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
                existingResearch: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING },
                      note: { type: Type.STRING }
                    }
                  }
                },
                searchLinks: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['title', 'description', 'methodology']
            }
          }
        }
      });
      
      const text = response.text || '';
      const grounded = extractGroundedSources(response);
      setGlobalSources(grounded);

      try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const enriched = parsed.map((topic: Topic) => {
            const hasSources = Array.isArray(topic.existingResearch) && topic.existingResearch.some(s => s?.url);
            return {
              ...topic,
              existingResearch: hasSources
                ? topic.existingResearch
                : grounded.slice(0, 3).length
                  ? grounded.slice(0, 3)
                  : FALLBACK_SOURCE_QUERIES(topic.title).map((url, idx) => ({
                      title: idx === 0 ? 'Google Scholar search' : idx === 1 ? 'Google research search' : 'PubMed search',
                      url,
                      note: 'Search link for verifying existing work before choosing this topic.'
                    }))
            };
          });
          setTopics(enriched);
          
          const oldStatsStr = localStorage.getItem('jackometer_stats');
          const oldStats = oldStatsStr ? JSON.parse(oldStatsStr) : { generatedTopics: [] };
          oldStats.generatedTopics.push({ title: enriched[0]?.title || department, date: new Date().toISOString() });
          localStorage.setItem('jackometer_stats', JSON.stringify(oldStats));
        } else {
          setRawFallback(text);
        }
      } catch (e) {
        setRawFallback(text);
      }
    } catch (err: any) {
      console.error('Topic generation failed', err);
      customAlert(`Could not generate topics: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyTopic = (topic: Topic) => {
    const sources = (topic.existingResearch || []).map(s => `- ${s.title}: ${s.url}`).join('\n');
    navigator.clipboard.writeText(`${topic.title}\nDescription: ${topic.description}\nMethodology: ${topic.methodology}\nWhy it matters: ${topic.whyItMatters || ''}\nSources:\n${sources}`);
    customAlert(`Copied "${topic.title}" with sources to clipboard!`);
  };

  return (
    <div className="w-full h-full p-4 md:p-8 max-w-5xl mx-auto flex flex-col min-h-0">
      <div className="mb-8 p-6 glass-panel flex-shrink-0 border border-[var(--border-color)]">
        <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-2">Topic Finder</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Generates research topics with visible source links so you can verify existing work before choosing a topic.</p>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase">Department / Field of Study</label>
            <div className="flex gap-2 items-center bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg pr-1">
              <input 
                type="text" 
                className="flex-1 rounded-lg p-3 bg-transparent text-[var(--text-primary)] outline-none"
                placeholder="e.g. Zoology, Parasitology, Computer Science..."
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
              <SpeechButton onTranscript={(text) => setDepartment((prev) => (prev || '') + (prev && !prev.endsWith(' ') ? ' ' : '') + text)} />
            </div>
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
        
        <button onClick={handleGenerate} disabled={loading} className="btn-3d w-full md:w-auto">
          {loading ? (
            <><span className="material-icons animate-spin text-sm">refresh</span> Searching with sources...</>
          ) : (
            <><span className="material-icons text-sm">search</span> Find Research Topics + Sources</>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {topics.length > 0 && (
          <div className="space-y-4 pb-12">
            <h3 className="text-lg font-serif font-bold text-[var(--text-primary)] mb-4">Suggested Topics With Existing Research</h3>
            {topics.map((t, idx) => (
              <div key={idx} className="sketch-card rounded-xl border border-[var(--border-color)] p-6 shadow-sm flex flex-col gap-4 bg-white transition-all hover:shadow-md">
                <div>
                  <h4 className="text-xl font-serif font-bold text-[var(--text-primary)] leading-tight mb-2">{t.title}</h4>
                  <p className="text-[var(--text-secondary)] font-sans text-sm mb-3">{t.description}</p>
                  <p className="text-xs font-sans text-[var(--text-secondary)] mb-2"><strong className="text-[var(--text-primary)]">Methodology:</strong> {t.methodology}</p>
                  {t.whyItMatters && <p className="text-xs font-sans text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Why it matters:</strong> {t.whyItMatters}</p>}
                </div>

                <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-3">
                  <h5 className="text-xs uppercase tracking-wide font-bold text-[var(--text-primary)] mb-2">Existing research / verification links</h5>
                  <div className="space-y-2">
                    {(t.existingResearch || []).slice(0, 4).map((source, sIdx) => (
                      <a key={sIdx} href={source.url} target="_blank" rel="noreferrer" className="block text-xs text-[var(--accent)] hover:underline break-all">
                        <span className="font-bold">{source.title || 'Source'}</span>
                        <br />
                        <span>{source.url}</span>
                        {source.note && <span className="block text-[var(--text-secondary)] no-underline">{source.note}</span>}
                      </a>
                    ))}
                  </div>
                </div>

                <button onClick={() => copyTopic(t)} className="btn-outline-sketch px-4 py-2 text-xs flex-shrink-0 flex items-center justify-center gap-1 self-start">
                  <span className="material-icons text-sm">content_copy</span> Copy Topic + Sources
                </button>
              </div>
            ))}
          </div>
        )}

        {globalSources.length > 0 && topics.length === 0 && (
          <div className="glass-panel rounded-xl border border-[var(--border-color)] p-6 pb-12 bg-white">
            <h3 className="text-lg font-serif font-bold text-[var(--text-primary)] mb-4">Grounded Sources Found</h3>
            {globalSources.map((s, idx) => <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="block text-sm text-[var(--accent)] mb-2 break-all">{s.title}: {s.url}</a>)}
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

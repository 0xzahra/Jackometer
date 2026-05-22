import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { customAlert } from '../lib/dialogs';

export const LiteratureEngine: React.FC = () => {
    const [concept, setConcept] = useState('');
    const [searchStrings, setSearchStrings] = useState<string>('');
    const [loading, setLoading] = useState(false);
    
    // Stage 1
    const handleGenerateStrategy = async () => {
        if (!concept) return;
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            const p = `Act as an academic search expert. Given the concept: "${concept}", generate optimized Boolean search strings for Google Scholar, Scopus, and PubMed.`;
            const res = await ai.models.generateContent({ model: 'gemini-3.1-8b', contents: p });
            setSearchStrings(res.text || '');
        } catch(e) {
            customAlert("Failed to generate search strings.");
        }
        setLoading(false);
    };

    return (
        <div className="w-full h-full overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold font-sans text-[var(--text-primary)]">Literature Engine</h1>
                        <p className="text-[var(--text-secondary)] mt-2">6-Stage Literature Review Assembly Line</p>
                    </div>
                </div>

                {/* Stage 1 */}
                <div className="glass-panel p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] border-b pb-2 mb-4">Stage 1: The Strategy (Keyword Builder)</h2>
                    <input type="text" placeholder="Enter research concept..." className="w-full mb-4" value={concept} onChange={e => setConcept(e.target.value)} />
                    <button onClick={handleGenerateStrategy} disabled={loading} className="btn-primary">Generate Boolean Strings</button>
                    {searchStrings && (
                        <div className="mt-4 p-4 bg-white/50 rounded font-mono text-xs whitespace-pre-wrap">{searchStrings}</div>
                    )}
                </div>

                {/* Stage 2 */}
                <div className="glass-panel p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] border-b pb-2 mb-4">Stage 2: The Grid (Paper Extraction)</h2>
                    <p className="text-sm text-gray-500 mb-4">Upload PDFs to extract author, year, findings, methods into a structural matrix.</p>
                    <input type="file" multiple accept=".pdf" className="mb-4" />
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">PDF Extraction requires backend text parsing integration in the full version.</div>
                </div>

                {/* Stage 3 & 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-panel p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] border-b pb-2 mb-4">Stage 3: The Detective (Theme Spotter)</h2>
                        <button className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded text-sm mb-4">Spot Patterns in PDF Grid</button>
                    </div>
                    <div className="glass-panel p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] border-b pb-2 mb-4">Stage 4: The Sniper (Gap Locator)</h2>
                        <button className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded text-sm mb-4">Identify Research Gaps</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

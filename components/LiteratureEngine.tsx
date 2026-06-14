import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { showToast } from '../lib/dialogs';
import { SpeechButton } from './SpeechButton';

export const LiteratureEngine: React.FC = () => {
    const [concept, setConcept] = useState('');
    const [searchStrings, setSearchStrings] = useState<string>('');
    const [loading, setLoading] = useState(false);
    
    // Stage 2
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const handleGenerateStrategy = async () => {
        if (!concept) return;
        setLoading(true);
        try {
            const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
            const ai = new GoogleGenAI({ apiKey });
            const p = `Act as an academic search expert. Given the concept: "${concept}", generate optimized search keyword combinations for Google Scholar, Scopus, and PubMed.`;
            const res = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: p });
            setSearchStrings(res.text || '');
        } catch(e) {
            showToast("Failed to generate search keywords.", "error");
        }
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        if (uploadedFiles.length + newFiles.length > 10) {
            showToast("You can upload up to 10 files at once.", "warning");
            return;
        }
        setUploadedFiles(prev => [...prev, ...newFiles]);
        // Reset the input so the same files can be selected again if removed
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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
                <div className="glass-panel p-6 shadow-sm border border-[var(--border-color)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] border-b pb-2 mb-4 drop-shadow-sm">1. Find Search Words</h2>
                    <p className="text-sm text-gray-500 mb-4 font-medium">Helper: Get useful search phrases for Google Scholar.</p>
                    <div className="flex gap-2 mb-4 items-center bg-white rounded border border-[var(--border-color)] pr-1">
                      <input type="text" placeholder="Enter research concept..." className="flex-1 bg-transparent border-none outline-none p-3" value={concept} onChange={e => setConcept(e.target.value)} />
                      <SpeechButton onTranscript={(text) => setConcept((prev) => (prev || '') + (prev && !prev.endsWith(' ') ? ' ' : '') + text)} />
                    </div>
                    <button onClick={handleGenerateStrategy} disabled={loading} className="btn-primary">Build My Search Keywords</button>
                    {searchStrings && (
                        <div className="mt-4 p-4 bg-white/50 rounded flex-1 font-mono text-xs whitespace-pre-wrap">{searchStrings}</div>
                    )}
                </div>

                {/* Stage 2 */}
                <div className="glass-panel p-6 shadow-sm border border-[var(--border-color)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] border-b pb-2 mb-4 drop-shadow-sm">2. Upload Papers or Photos</h2>
                    <p className="text-sm text-gray-500 mb-4 font-medium">Helper: Add PDF papers or clear photos of printed documents.</p>
                    <input type="file" multiple accept=".pdf,image/*" className="mb-4 text-sm" onChange={handleFileChange} />
                    <p className="text-xs text-[var(--text-secondary)] mb-4">Upload your research papers (PDF) or photos of printed documents (JPG/PNG). You can select multiple files at once.</p>
                    <div className="text-xs text-[var(--accent)] bg-[var(--accent)]/10 p-2 rounded mb-4 shadow-sm border border-[var(--accent)]/30">Tip: You can upload photos of printed papers too.</div>
                    
                    {uploadedFiles.length > 0 && (
                        <div className="bg-slate-50 border border-[var(--border-color)] rounded-lg overflow-hidden">
                            <ul className="divide-y divide-slate-200">
                                {uploadedFiles.map((f, i) => (
                                    <li key={i} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-col truncate pr-4">
                                            <span className="font-bold text-sm text-slate-800 truncate">{f.name}</span>
                                            <span className="text-xs text-slate-500">{f.type || 'Unknown'} • {(f.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 flex-shrink-0">
                                            <span className="material-icons text-sm">delete</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Stage 3 & 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-panel p-6 shadow-sm border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] border-b pb-2 mb-4 drop-shadow-sm">3. Summarize Your Sources</h2>
                        <p className="text-sm text-gray-500 mb-4 font-medium">Helper: Turn each paper into a short table.</p>
                        <button className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded text-sm mb-4 shadow-sm hover:bg-slate-300">Summarize Papers</button>
                    </div>
                    <div className="glass-panel p-6 shadow-sm border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] border-b pb-2 mb-4 drop-shadow-sm">4. Find Common Themes</h2>
                        <p className="text-sm text-gray-500 mb-4 font-medium">Helper: See what ideas appear again and again.</p>
                        <button className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded text-sm mb-4 shadow-sm hover:bg-slate-300">Find Common Themes</button>
                    </div>
                </div>
                
                {/* Stage 5 & 6 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-panel p-6 shadow-sm border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] border-b pb-2 mb-4 drop-shadow-sm">5. Find Research Gaps</h2>
                        <p className="text-sm text-gray-500 mb-4 font-medium">Helper: See what is missing in the studies you found.</p>
                        <button className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded text-sm mb-4 shadow-sm hover:bg-slate-300">Show What's Missing</button>
                    </div>
                    <div className="glass-panel p-6 shadow-sm border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] border-b pb-2 mb-4 drop-shadow-sm">6. Check My Writing</h2>
                        <p className="text-sm text-gray-500 mb-4 font-medium">Helper: Check if your paragraph is just listing sources or actually comparing ideas.</p>
                        <button className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded text-sm mb-4 shadow-sm hover:bg-slate-300">Check My Writing</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

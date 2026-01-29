import React, { useState } from 'react';
import { analyzeData } from '../services/geminiService';
import { AnalysisResult } from '../types';

export const DataCruncher: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!inputData) return;
    setLoading(true);
    try {
      const res = await analyzeData(inputData);
      setResult(res);
    } catch (e) {
      alert("Analysis failed.");
    }
    setLoading(false);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_analysis.json';
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
         <div>
             <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">Data Cruncher <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2 font-sans font-bold">OPTIMIZED</span></h2>
             <p className="text-xs text-[var(--text-secondary)]">Zero-error processing for biological & statistical data.</p>
         </div>
         <button className="text-[var(--accent)] font-bold text-sm hover:underline" onClick={() => setInputData('')}>Clear Data</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        <div className="paper-panel p-6 rounded-sm flex flex-col">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Input Data (Paste CSV or Observations)</label>
          <textarea 
            className="flex-1 w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-4 font-mono text-sm text-[var(--text-primary)] outline-none resize-none mb-4"
            placeholder="e.g. Specimen A: 5cm, Specimen B: 7cm..."
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          ></textarea>
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded shadow hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            {loading ? <span className="material-icons animate-spin mr-2">refresh</span> : <span className="material-icons mr-2">analytics</span>}
            {loading ? 'Processing Precision Logic...' : 'Run Analysis'}
          </button>
        </div>

        <div className="paper-panel p-8 rounded-sm overflow-y-auto bg-white border border-[var(--border-color)]">
          {!result ? (
            <div className="flex items-center justify-center h-full text-[var(--text-secondary)] opacity-50 italic">
              Results will appear here...
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-2">Summary</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result.summary}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-2">Key Trends</h3>
                <ul className="list-disc pl-5 text-sm text-[var(--text-secondary)] space-y-1">
                  {result.keyTrends.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-2">Recommendation</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result.recommendation}</p>
              </div>
              
              <div className="pt-4 flex gap-2">
                 <button onClick={handleExport} className="text-xs font-bold border border-[var(--border-color)] px-4 py-2 rounded hover:bg-[var(--bg-color)]">
                   Download JSON
                 </button>
                 <a href={`mailto:?subject=Data Analysis&body=${encodeURIComponent(JSON.stringify(result))}`} className="text-xs font-bold border border-[var(--border-color)] px-4 py-2 rounded hover:bg-[var(--bg-color)]">
                   Email Report
                 </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
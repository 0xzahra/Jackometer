import React, { useState } from 'react';
import { analyzeData } from '../services/geminiService';
import { AnalysisResult, FieldTable } from '../types';

export const DataCruncher: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [tables, setTables] = useState<FieldTable[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Table Logic
  const addTable = () => {
    setTables([...tables, {
      id: Date.now().toString(),
      name: `Dataset ${tables.length + 1}`,
      headers: ['Variable', 'Value A', 'Value B', 'Control'],
      rows: [['', '', '', '']],
      collapsed: false
    }]);
  };

  const updateTableData = (tableId: string, rowIndex: number, colIndex: number, val: string) => {
    setTables(tables.map(t => {
      if (t.id === tableId) {
        const newRows = [...t.rows];
        newRows[rowIndex][colIndex] = val;
        return { ...t, rows: newRows };
      }
      return t;
    }));
  };

  const addTableRow = (tableId: string) => {
    setTables(tables.map(t => {
      if (t.id === tableId) return { ...t, rows: [...t.rows, new Array(t.headers.length).fill('')] };
      return t;
    }));
  };

  const toggleTable = (tableId: string) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, collapsed: !t.collapsed } : t));
  };

  const formatTables = () => {
    return tables.map(t => `Table: ${t.name}\n${t.rows.map(r => r.join(', ')).join('\n')}`).join('\n\n');
  };

  const handleAnalyze = async () => {
    if (!inputData && tables.length === 0) return;
    setLoading(true);
    try {
      const res = await analyzeData(inputData, formatTables());
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
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
         <div>
             <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">Data Cruncher <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2 font-sans font-bold">OPTIMIZED</span></h2>
             <p className="text-xs text-[var(--text-secondary)]">Zero-error processing for biological & statistical data.</p>
         </div>
         <button className="text-[var(--accent)] font-bold text-sm hover:underline" onClick={() => {setInputData(''); setTables([]);}}>Clear All</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        <div className="paper-panel p-6 rounded-sm flex flex-col overflow-y-auto">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Raw Observations</label>
          <textarea 
            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-4 font-mono text-sm text-[var(--text-primary)] outline-none resize-none mb-4 h-40"
            placeholder="e.g. Specimen A: 5cm, Specimen B: 7cm..."
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          ></textarea>

          {/* Structured Tables */}
          <div className="flex-1 overflow-y-auto border-t border-[var(--border-color)] pt-4">
             <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Structured Datasets</label>
                <button onClick={addTable} className="text-xs text-[var(--accent)] font-bold hover:underline">+ Add Dataset</button>
             </div>
             {tables.map(t => (
               <div key={t.id} className="mb-2 border border-[var(--border-color)] rounded bg-[var(--bg-color)]">
                  <div className="p-2 flex justify-between items-center cursor-pointer bg-[var(--surface-color)]" onClick={() => toggleTable(t.id)}>
                     <span className="font-bold text-sm text-[var(--text-primary)]">{t.name}</span>
                     <span className="material-icons text-sm">{t.collapsed ? 'expand_more' : 'expand_less'}</span>
                  </div>
                  {!t.collapsed && (
                    <div className="p-2 overflow-x-auto">
                       <table className="w-full text-xs">
                          <thead>
                             <tr>{t.headers.map((h, i) => <th key={i} className="border p-1">{h}</th>)}</tr>
                          </thead>
                          <tbody>
                             {t.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                   {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="border p-0">
                                         <input className="w-full p-1 bg-transparent outline-none" value={cell} onChange={(e) => updateTableData(t.id, rIdx, cIdx, e.target.value)} />
                                      </td>
                                   ))}
                                </tr>
                             ))}
                          </tbody>
                       </table>
                       <button onClick={() => addTableRow(t.id)} className="text-[10px] text-[var(--accent)] font-bold mt-1">+ Row</button>
                    </div>
                  )}
               </div>
             ))}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded shadow hover:opacity-90 transition-opacity flex items-center justify-center mt-4"
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
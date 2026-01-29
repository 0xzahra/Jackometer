import React, { useState, useEffect } from 'react';
import { generateRapidPresentation, generateFieldTripDocument } from '../services/geminiService';
import { SlideDeck, FieldTable } from '../types';

export const FieldTripSuite: React.FC = () => {
  const [tab, setTab] = useState<'GPS' | 'DATA' | 'SLIDES' | 'DOCUMENT'>('GPS');
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [deck, setDeck] = useState<SlideDeck | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [tables, setTables] = useState<FieldTable[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Loc failed")
      );
    }
  }, []);

  const addTable = () => {
    const newTable: FieldTable = {
      id: Date.now().toString(),
      name: `Table ${tables.length + 1}`,
      headers: ['Parameter', 'Observation', 'Remarks'],
      rows: [['', '', '']],
      collapsed: false
    };
    setTables([...tables, newTable]);
  };

  const updateCell = (tableIndex: number, rowIndex: number, colIndex: number, val: string) => {
    const newTables = [...tables];
    newTables[tableIndex].rows[rowIndex][colIndex] = val;
    setTables(newTables);
  };

  const addRow = (tableIndex: number) => {
    const newTables = [...tables];
    const colCount = newTables[tableIndex].headers.length;
    newTables[tableIndex].rows.push(new Array(colCount).fill(''));
    setTables(newTables);
  };

  const toggleTable = (index: number) => {
    const newTables = [...tables];
    newTables[index].collapsed = !newTables[index].collapsed;
    setTables(newTables);
  };

  const formatTablesForAI = () => {
    return tables.map(t => {
      return `Table: ${t.name}\nHeaders: ${t.headers.join(', ')}\nRows:\n${t.rows.map(r => r.join(' | ')).join('\n')}`;
    }).join('\n\n');
  };

  const handleGenerateDeck = async () => {
    setLoading(true);
    try {
      const tableData = formatTablesForAI();
      const result = await generateRapidPresentation(topic, `${notes}\n\n${tableData}`);
      setDeck(result);
      setTab('SLIDES');
    } catch (e) {
      alert("Error generating deck");
    }
    setLoading(false);
  };

  const handleGenerateDoc = async () => {
    setLoading(true);
    try {
      const tableData = formatTablesForAI();
      const result = await generateFieldTripDocument(topic, tableData, notes);
      setDocumentContent(result);
      setTab('DOCUMENT');
    } catch (e) {
      alert("Error generating document");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex space-x-2 md:space-x-4 mb-6 border-b border-[var(--border-color)] pb-1 overflow-x-auto">
        {['GPS', 'DATA', 'SLIDES', 'DOCUMENT'].map((t) => (
          <button 
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 md:px-6 py-2 font-bold font-serif transition-colors whitespace-nowrap ${tab === t ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'}`}
          >
            {t === 'GPS' ? 'Telemetry' : t === 'DATA' ? 'Input Data' : t === 'SLIDES' ? 'Presentation' : 'Document'}
          </button>
        ))}
      </div>

      {tab === 'GPS' && (
        <div className="paper-panel p-6 rounded-sm relative overflow-hidden flex flex-col justify-between h-96">
           <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=13&size=600x300&maptype=roadmap')] bg-cover opacity-10"></div>
           <div className="relative z-10">
             <h3 className="text-[var(--text-primary)] font-bold mb-6 flex items-center border-b border-[var(--border-color)] pb-2">
               <span className="material-icons mr-2">satellite</span>
               Live Telemetry
             </h3>
             <div className="space-y-4 font-mono text-sm">
               <div className="flex justify-between border-b border-[var(--border-color)] pb-2 border-dashed">
                 <span className="text-[var(--text-secondary)]">LATITUDE</span>
                 <span className="text-[var(--text-primary)] font-bold">{coords.lat.toFixed(6)} N</span>
               </div>
               <div className="flex justify-between border-b border-[var(--border-color)] pb-2 border-dashed">
                 <span className="text-[var(--text-secondary)]">LONGITUDE</span>
                 <span className="text-[var(--text-primary)] font-bold">{coords.lng.toFixed(6)} E</span>
               </div>
               <div className="flex justify-between border-b border-[var(--border-color)] pb-2 border-dashed">
                 <span className="text-[var(--text-secondary)]">TEMP</span>
                 <span className="text-[var(--text-primary)] font-bold">32°C (Dry)</span>
               </div>
             </div>
           </div>
           <div className="relative z-10 mt-6 bg-[var(--bg-color)] p-3 rounded border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
             TIMESTAMP: {new Date().toLocaleString()}
           </div>
        </div>
      )}

      {tab === 'DATA' && (
        <div className="space-y-6 pb-20">
          <div className="paper-panel p-6 rounded-sm">
            <h3 className="text-[var(--text-primary)] font-bold mb-4 font-serif">Basic Info</h3>
            <input 
              className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded p-3 text-[var(--text-primary)] mb-4 focus:border-[var(--accent)] outline-none" 
              placeholder="Field Trip Topic (e.g., Tilapia at BUK)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <textarea 
              className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded p-3 text-[var(--text-primary)] mb-4 focus:border-[var(--accent)] outline-none resize-none font-mono text-xs h-32" 
              placeholder="Paste raw data, observations, or lab notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          {/* Dynamic Tables */}
          {tables.map((table, tIdx) => (
             <div key={table.id} className="paper-panel p-4 rounded-sm">
                <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleTable(tIdx)}>
                   <h4 className="font-bold text-[var(--text-primary)]">{table.name}</h4>
                   <span className="material-icons text-[var(--text-secondary)]">{table.collapsed ? 'expand_more' : 'expand_less'}</span>
                </div>
                {!table.collapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {table.headers.map((h, i) => (
                            <th key={i} className="border border-[var(--border-color)] p-2 bg-[var(--bg-color)] text-xs text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="border border-[var(--border-color)] p-1">
                                <input 
                                  value={cell} 
                                  onChange={(e) => updateCell(tIdx, rIdx, cIdx, e.target.value)}
                                  className="w-full bg-transparent outline-none text-sm"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={() => addRow(tIdx)} className="mt-2 text-xs font-bold text-[var(--accent)]">+ Add Row</button>
                  </div>
                )}
             </div>
          ))}

          <div className="flex justify-between items-center">
             <button onClick={addTable} className="text-sm font-bold border border-[var(--border-color)] px-4 py-2 rounded hover:bg-[var(--bg-color)]">
               + Add Data Table
             </button>
             <div className="space-x-2">
                <button onClick={handleGenerateDeck} disabled={loading} className="bg-[var(--accent)] text-white font-bold px-6 py-2 rounded shadow text-sm">
                   {loading ? '...' : 'Generate Slides'}
                </button>
                <button onClick={handleGenerateDoc} disabled={loading} className="bg-[var(--text-secondary)] text-white font-bold px-6 py-2 rounded shadow text-sm">
                   {loading ? '...' : 'Write Document'}
                </button>
             </div>
          </div>
        </div>
      )}

      {tab === 'SLIDES' && (
        <div className="h-full flex flex-col bg-slate-200/50 rounded-lg border-2 border-dashed border-slate-300 p-4">
           {!deck ? (
             <div className="flex-1 flex items-center justify-center text-slate-400">
               No presentation generated yet.
             </div>
           ) : (
             <div className="flex-1 overflow-x-auto flex gap-8 p-4 snap-x items-center">
               {deck.slides.map((slide, idx) => (
                 <div key={idx} className="flex-shrink-0 w-[800px] h-[450px] bg-white text-slate-900 rounded-sm shadow-2xl p-12 flex flex-col relative snap-center border border-slate-200">
                    <h2 className="text-4xl font-serif font-bold mb-8 text-slate-900 border-b-4 border-slate-800 pb-4 inline-block self-start z-10">{slide.header}</h2>
                    <ul className="flex-1 space-y-4 z-10">{slide.content.map((point, i) => <li key={i} className="text-xl flex items-start font-serif"><span className="mr-3 text-slate-400 font-bold">•</span>{point}</li>)}</ul>
                    <div className="absolute bottom-2 right-4 text-xs text-slate-400 font-mono">Slide {idx + 1}</div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {tab === 'DOCUMENT' && (
        <div className="paper-panel p-10 rounded-sm flex-1 overflow-y-auto bg-white border border-[var(--border-color)] shadow-inner">
           {documentContent ? (
             <article className="prose prose-slate max-w-none">
               <pre className="whitespace-pre-wrap font-serif text-base text-[var(--text-primary)] font-normal">{documentContent}</pre>
             </article>
           ) : (
             <div className="flex items-center justify-center h-full text-[var(--text-secondary)] opacity-50 italic">Document not generated yet.</div>
           )}
        </div>
      )}
    </div>
  );
};
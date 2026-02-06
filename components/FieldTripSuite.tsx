import React, { useState, useEffect, useRef } from 'react';
import { generateRapidPresentation, generateFieldTripDocument, estimateWeatherConditions, generateFieldTripGuide, saveToGoogleDrive } from '../services/geminiService';
import { SlideDeck, FieldTable } from '../types';

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export const FieldTripSuite: React.FC = () => {
  const [tab, setTab] = useState<'ENVIRONMENT' | 'DATA' | 'SLIDES' | 'DOCUMENT'>('ENVIRONMENT');
  const [loading, setLoading] = useState(false);
  const [driveSaving, setDriveSaving] = useState(false);
  
  // Trip Setup State
  const [topic, setTopic] = useState('');
  const [lecturerReqs, setLecturerReqs] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const [notes, setNotes] = useState('');
  
  // Slide & Doc specific inputs
  const [slideInput, setSlideInput] = useState('');
  const [docInput, setDocInput] = useState('');
  
  const [deck, setDeck] = useState<SlideDeck | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  
  // Sensor State
  const [coords, setCoords] = useState<{ lat: number, lng: number, alt: number | null, acc: number | null }>({ lat: 0, lng: 0, alt: null, acc: null });
  const [weather, setWeather] = useState({ temp: '', humidity: '', conditions: '', pressure: '' });
  const [analyzingWeather, setAnalyzingWeather] = useState(false);
  
  // Evidence State
  const [evidence, setEvidence] = useState<{ src: string, meta: string }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- GPS Logic ---
  const refreshLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude,
          alt: pos.coords.altitude,
          acc: pos.coords.accuracy
        }),
        (err) => console.log("Loc failed", err),
        { enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => { refreshLocation(); }, []);

  // --- Weather Logic ---
  const fetchWeather = async () => {
    if (coords.lat === 0) { alert("Acquire GPS signal first."); return; }
    setAnalyzingWeather(true);
    try {
      const data = await estimateWeatherConditions(coords.lat, coords.lng);
      setWeather({ ...weather, ...data });
    } catch (e) {
      alert("Weather analysis failed.");
    }
    setAnalyzingWeather(false);
  };

  // --- Camera & Overlay Logic ---
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       const reader = new FileReader();
       reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
             const canvas = document.createElement('canvas');
             const ctx = canvas.getContext('2d');
             if (ctx) {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Overlay Metadata
                const metaText = `LAT: ${coords.lat.toFixed(5)} | LNG: ${coords.lng.toFixed(5)} | ${new Date().toLocaleString()}\n${weather.temp} ${weather.conditions}`;
                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
                ctx.fillStyle = "#fff";
                ctx.font = "bold 24px monospace";
                ctx.fillText(metaText, 20, canvas.height - 40);
                
                setEvidence([...evidence, { src: canvas.toDataURL(), meta: metaText }]);
             }
          };
          img.src = event.target?.result as string;
       };
       reader.readAsDataURL(file);
    }
  };

  // --- Data Table Logic ---
  const [tables, setTables] = useState<FieldTable[]>([]);
  const addTable = () => {
    setTables([...tables, { id: Date.now().toString(), name: `Site Data ${tables.length + 1}`, headers: ['Param', 'Value', 'Unit'], rows: [['', '', '']], collapsed: false }]);
  };
  const updateCell = (tIdx: number, rIdx: number, cIdx: number, val: string) => {
    const newTables = [...tables]; newTables[tIdx].rows[rIdx][cIdx] = val; setTables(newTables);
  };
  const addRow = (tIdx: number) => {
    const newTables = [...tables]; newTables[tIdx].rows.push(new Array(newTables[tIdx].headers.length).fill('')); setTables(newTables);
  };
  const toggleTable = (i: number) => {
    const newTables = [...tables]; newTables[i].collapsed = !newTables[i].collapsed; setTables(newTables);
  };

  const handleInitializeGuide = async () => {
    if (!topic) return;
    setInitializing(true);
    try {
      const guide = await generateFieldTripGuide(topic, lecturerReqs);
      
      const newTables = guide.tables.map((t, i) => ({
        id: Date.now().toString() + i,
        name: t.name,
        headers: t.headers,
        rows: [new Array(t.headers.length).fill('')],
        collapsed: false
      }));

      const newChecklist = guide.checklist.map((c, i) => ({
        id: `check_${i}`,
        text: c,
        done: false
      }));

      setTables(newTables);
      setChecklist(newChecklist);
      setIsGuideActive(true);
      setTab('DATA');
    } catch (e) {
      alert("Could not generate guide. Try again.");
    }
    setInitializing(false);
  };

  const toggleCheckItem = (id: string) => {
    setChecklist(checklist.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  const formatData = () => {
    const tableStr = tables.map(t => `Table: ${t.name}\n${t.rows.map(r => r.join('|')).join('\n')}`).join('\n\n');
    const weatherStr = `Weather: ${weather.temp}, ${weather.humidity}, ${weather.conditions}`;
    
    // Add checklist info
    const checklistStr = checklist.length > 0 
      ? `\n\nChecklist Completion:\n${checklist.map(c => `[${c.done ? 'x' : ' '}] ${c.text}`).join('\n')}` 
      : '';

    return `${weatherStr}${checklistStr}\n\n${tableStr}`;
  };

  const handleGenerateDeck = async () => {
    if (!slideInput && !topic) {
        alert("Please provide a topic or some input data.");
        return;
    }
    setLoading(true);
    const combinedData = `${slideInput}\n\n--- AUTO COLLECTED DATA ---\n${notes}\n${formatData()}`;
    await generateRapidPresentation(topic || "Field Trip Report", combinedData).then(setDeck);
    setLoading(false);
  };

  const handleGenerateDoc = async () => {
    if (!docInput && !topic) {
        alert("Please provide a topic or some input data.");
        return;
    }
    setLoading(true);
    // Combine manual doc input with automated data
    const combinedNotes = `${docInput}\n\n--- FIELD NOTES ---\n${notes}`;
    await generateFieldTripDocument(topic || "Field Report", formatData(), combinedNotes).then(setDocumentContent);
    setLoading(false);
  };

  const handleDriveSave = async () => {
    if (!documentContent) return;
    setDriveSaving(true);
    const filename = `${topic || 'Field_Report'}.docx`;
    await saveToGoogleDrive(filename, documentContent, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    setDriveSaving(false);
    alert("Field report saved to Google Drive!");
  };

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex space-x-2 md:space-x-4 mb-6 border-b border-[var(--border-color)] pb-1 overflow-x-auto">
        {['ENVIRONMENT', 'DATA', 'SLIDES', 'DOCUMENT'].map((t) => (
          <button 
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 md:px-6 py-2 font-bold transition-colors whitespace-nowrap ${tab === t ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'}`}
          >
            {t === 'ENVIRONMENT' ? 'Environment Monitor' : t === 'DATA' ? (isGuideActive ? 'Field Input' : 'Trip Setup') : t === 'SLIDES' ? 'Presentation' : 'Document'}
          </button>
        ))}
      </div>

      {tab === 'ENVIRONMENT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           
           {/* GPS CARD */}
           <div className="paper-panel p-6 rounded-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-[var(--text-primary)] flex items-center"><span className="material-icons mr-2 text-[var(--accent)]">satellite</span> GPS Telemetry</h3>
                 <button onClick={refreshLocation} className="text-xs bg-[var(--bg-color)] p-2 rounded hover:bg-gray-200"><span className="material-icons animate-pulse">my_location</span></button>
              </div>
              <div className="space-y-3 font-mono text-sm">
                 <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                    <span className="text-[var(--text-secondary)]">LATITUDE</span>
                    <span className="font-bold">{coords.lat.toFixed(6)}° N</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                    <span className="text-[var(--text-secondary)]">LONGITUDE</span>
                    <span className="font-bold">{coords.lng.toFixed(6)}° E</span>
                 </div>
                 <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                    <span className="text-[var(--text-secondary)]">ALTITUDE</span>
                    <span className="font-bold">{coords.alt ? coords.alt.toFixed(1) + 'm' : 'N/A'}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">ACCURACY</span>
                    <span className="font-bold">±{coords.acc ? coords.acc.toFixed(1) + 'm' : '--'}</span>
                 </div>
              </div>
           </div>

           {/* WEATHER CARD */}
           <div className="paper-panel p-6 rounded-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-[var(--text-primary)] flex items-center"><span className="material-icons mr-2 text-blue-500">cloud</span> Weather Analysis</h3>
                 <button onClick={fetchWeather} disabled={analyzingWeather} className="text-xs bg-[var(--accent)] text-white px-2 py-1 rounded font-bold">{analyzingWeather ? '...' : 'Fetch Estimate'}</button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Temperature</label>
                    <input className="w-full text-sm font-mono border-b border-gray-300 bg-transparent" placeholder="--°C" value={weather.temp} onChange={(e) => setWeather({...weather, temp: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Humidity</label>
                    <input className="w-full text-sm font-mono border-b border-gray-300 bg-transparent" placeholder="--%" value={weather.humidity} onChange={(e) => setWeather({...weather, humidity: e.target.value})} />
                 </div>
              </div>
              <div>
                 <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Conditions</label>
                 <input className="w-full text-sm font-mono border-b border-gray-300 bg-transparent" placeholder="e.g. Sunny, Dry" value={weather.conditions} onChange={(e) => setWeather({...weather, conditions: e.target.value})} />
              </div>
           </div>

           {/* EVIDENCE CARD */}
           <div className="paper-panel p-6 rounded-sm">
              <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center"><span className="material-icons mr-2 text-red-500">camera_alt</span> Evidence Capture</h3>
              <label className="w-full h-32 border-2 border-dashed border-[var(--border-color)] rounded flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--bg-color)] transition-colors">
                 <span className="material-icons text-3xl text-[var(--text-secondary)]">add_a_photo</span>
                 <span className="text-xs font-bold text-[var(--text-secondary)] mt-2">Capture & Overlay Meta</span>
                 <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} />
              </label>
           </div>
           
           {/* Gallery */}
           <div className="col-span-full paper-panel p-6 rounded-sm">
              <h3 className="font-bold text-[var(--text-primary)] mb-4">Captured Evidence ({evidence.length})</h3>
              <div className="flex gap-4 overflow-x-auto pb-4">
                 {evidence.map((ev, i) => (
                    <div key={i} className="flex-shrink-0 w-64 border border-[var(--border-color)] rounded overflow-hidden shadow-sm">
                       <img src={ev.src} className="w-full h-40 object-cover" alt="Evidence" />
                       <div className="p-2 bg-[var(--bg-color)] text-[10px] font-mono break-all leading-tight">{ev.meta.split('\n')[0]}</div>
                    </div>
                 ))}
                 {evidence.length === 0 && <p className="text-sm text-[var(--text-secondary)] italic">No photos captured yet.</p>}
              </div>
           </div>
        </div>
      )}

      {tab === 'DATA' && (
        <div className="space-y-6 pb-20">
          {!isGuideActive ? (
            <div className="paper-panel p-8 rounded-sm max-w-2xl mx-auto mt-10">
               <div className="flex flex-col items-center text-center mb-8">
                  <span className="material-icons text-5xl text-[var(--accent)] mb-4">travel_explore</span>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)]">Initialize Field Trip</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Configure your research parameters. Jackometer will architect the data collection tables and observation checklist for you.
                  </p>
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1 block">Trip Title / Topic</label>
                    <input 
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] focus:border-[var(--accent)] outline-none font-bold"
                      placeholder="e.g. Geological Survey of Zuma Rock"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1 block">Lecturer Requirements (Optional)</label>
                    <textarea 
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] focus:border-[var(--accent)] outline-none resize-none h-24"
                      placeholder="Paste any specific instructions, required measurements, or focus areas provided by your supervisor..."
                      value={lecturerReqs}
                      onChange={(e) => setLecturerReqs(e.target.value)}
                    ></textarea>
                  </div>

                  <button 
                    onClick={handleInitializeGuide}
                    disabled={initializing || !topic}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    {initializing ? <span className="material-icons animate-spin">refresh</span> : <span className="material-icons">architecture</span>}
                    {initializing ? 'Analyzing Requirements...' : 'Generate Field Guide'}
                  </button>
               </div>
            </div>
          ) : (
            <>
               <div className="paper-panel p-6 rounded-sm bg-blue-50/30 border border-blue-100 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-lg">{topic}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Active Field Session</p>
                  </div>
                  <button onClick={() => setIsGuideActive(false)} className="text-xs text-red-500 hover:underline">End Session</button>
               </div>

               {checklist.length > 0 && (
                 <div className="paper-panel p-6 rounded-sm">
                    <h4 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                       <span className="material-icons text-[var(--accent)]">checklist</span> Required Observations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {checklist.map(c => (
                          <div key={c.id} onClick={() => toggleCheckItem(c.id)} className={`p-3 rounded border cursor-pointer flex items-start gap-3 transition-colors ${c.done ? 'bg-green-50 border-green-200' : 'bg-[var(--bg-color)] border-[var(--border-color)]'}`}>
                             <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${c.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400'}`}>
                                {c.done && <span className="material-icons text-sm">check</span>}
                             </div>
                             <span className={`text-sm ${c.done ? 'text-green-800 line-through opacity-70' : 'text-[var(--text-primary)]'}`}>{c.text}</span>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

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
               </div>

               <div className="paper-panel p-6 rounded-sm">
                  <h3 className="text-[var(--text-primary)] font-bold mb-4">Additional Field Notes</h3>
                  <textarea 
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded p-3 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none resize-none font-mono text-xs h-32" 
                    placeholder="Observations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
               </div>
               
               <div className="p-4 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100 flex items-center">
                   <span className="material-icons mr-2 text-sm">info</span>
                   Switch to <strong>SLIDES</strong> or <strong>DOCUMENT</strong> tabs to finalize and generate your report.
               </div>
            </>
          )}
        </div>
      )}

      {tab === 'SLIDES' && (
        <div className="h-full flex flex-col">
           {/* Input Section */}
           <div className="paper-panel p-6 mb-4 rounded-sm flex-shrink-0">
               <h3 className="font-bold text-[var(--text-primary)] mb-2">Presentation Builder</h3>
               <textarea 
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded p-3 text-sm focus:border-[var(--accent)] outline-none resize-none h-20 mb-4" 
                  placeholder="Enter specific points, key findings, or context for the slides..."
                  value={slideInput}
                  onChange={(e) => setSlideInput(e.target.value)}
               ></textarea>
               <button 
                  onClick={handleGenerateDeck} 
                  disabled={loading} 
                  className="bg-[var(--accent)] text-white font-bold px-6 py-2 rounded shadow text-sm flex items-center gap-2"
               >
                  {loading ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">co_present</span>}
                  {deck ? 'Regenerate Slides' : 'Generate Presentation'}
               </button>
           </div>

           {/* Slide View */}
           <div className="flex-1 bg-slate-200/50 rounded-lg border-2 border-dashed border-slate-300 p-4 overflow-hidden relative">
               {!deck ? (
                 <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                       <span className="material-icons text-5xl mb-2">slideshow</span>
                       <p>No presentation generated yet.</p>
                    </div>
                 </div>
               ) : (
                 <div className="w-full h-full overflow-x-auto snap-x snap-mandatory flex gap-8 p-4 items-center">
                   {deck.slides.map((slide, idx) => (
                     <div key={idx} className="flex-shrink-0 w-[85vw] md:w-[800px] h-[50vh] md:h-[450px] bg-white text-slate-900 rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col relative snap-center border border-slate-200">
                        <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-slate-900 border-b-4 border-slate-800 pb-4 inline-block self-start z-10">{slide.header}</h2>
                        <ul className="flex-1 space-y-4 z-10 overflow-y-auto">{slide.content.map((point, i) => <li key={i} className="text-lg md:text-xl flex items-start"><span className="mr-3 text-slate-400 font-bold">•</span>{point}</li>)}</ul>
                        <div className="absolute bottom-2 right-4 text-xs text-slate-400 font-mono">Slide {idx + 1}</div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
        </div>
      )}

      {tab === 'DOCUMENT' && (
        <div className="h-full flex flex-col">
            {/* Input Section */}
            <div className="paper-panel p-6 mb-4 rounded-sm flex-shrink-0">
               <h3 className="font-bold text-[var(--text-primary)] mb-2">Report Writer</h3>
               <textarea 
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded p-3 text-sm focus:border-[var(--accent)] outline-none resize-none h-20 mb-4" 
                  placeholder="Enter specific details, methodology notes, or conclusions for the document..."
                  value={docInput}
                  onChange={(e) => setDocInput(e.target.value)}
               ></textarea>
               <div className="flex gap-2">
                 <button 
                    onClick={handleGenerateDoc} 
                    disabled={loading} 
                    className="bg-[var(--text-secondary)] text-white font-bold px-6 py-2 rounded shadow text-sm flex items-center gap-2"
                 >
                    {loading ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">article</span>}
                    {documentContent ? 'Regenerate Document' : 'Write Report'}
                 </button>
                 <button 
                    onClick={handleDriveSave} 
                    disabled={driveSaving || !documentContent}
                    className="bg-green-600 text-white font-bold px-6 py-2 rounded shadow text-sm flex items-center gap-2 disabled:opacity-50"
                 >
                    <span className="material-icons text-sm">add_to_drive</span>
                    {driveSaving ? 'Saving...' : 'Save to Drive'}
                 </button>
               </div>
           </div>

           <div className="paper-panel p-10 rounded-sm flex-1 overflow-y-auto bg-white border border-[var(--border-color)] shadow-inner">
              {documentContent ? (
                <article className="prose prose-slate max-w-none">
                  <pre className="whitespace-pre-wrap font-serif text-base text-[var(--text-primary)] font-normal">{documentContent}</pre>
                </article>
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--text-secondary)] opacity-50 italic">
                   Document not generated yet. Use the controls above.
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { generateTechnicalReport, generateLabReport, analyzeMicroscopeImage, generateImageCaption, downloadFile } from '../services/geminiService';
import { AppendixItem, FieldTable, Collaborator, UserSearchResult } from '../types';
import { CollaborationModal } from './CollaborationModal';

interface ReportSuiteProps {
  type: 'TECHNICAL' | 'LAB';
}

interface DocumentDraft {
  id: string;
  topic: string;
  details: string;
  report: string;
  imageAnalysis?: string;
  history: string[];
  historyIndex: number;
  tables: FieldTable[];
  appendix: AppendixItem[];
}

export const ReportSuite: React.FC<ReportSuiteProps> = ({ type }) => {
  const [docs, setDocs] = useState<DocumentDraft[]>([
    { id: '1', topic: '', details: '', report: '', history: [''], historyIndex: 0, tables: [], appendix: [] }
  ]);
  const [activeDocId, setActiveDocId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);

  // Collaboration State
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: 'me', name: 'You', color: 'bg-blue-600', status: 'ONLINE' }
  ]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Simulate Real-time Activity
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators(prev => prev.map(c => {
        if (c.id === 'me') return c;
        // Randomly toggle status
        const rand = Math.random();
        let newStatus: 'ONLINE' | 'EDITING' | 'IDLE' = c.status;
        if (rand > 0.8) newStatus = 'EDITING';
        else if (rand > 0.5) newStatus = 'ONLINE';
        else newStatus = 'IDLE';
        return { ...c, status: newStatus };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddCollaborator = (user: UserSearchResult) => {
    const colors = ['bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    const randomColor = colors[collaborators.length % colors.length];
    
    const newCollab: Collaborator = {
      id: user.id,
      name: user.name,
      email: user.email,
      color: randomColor,
      status: 'ONLINE'
    };
    
    setCollaborators([...collaborators, newCollab]);
    setIsInviteModalOpen(false);
    alert(`${user.name} has been added to the lab session.`);
  };

  const activeDoc = docs.find(d => d.id === activeDocId) || docs[0];

  const updateDoc = (field: keyof DocumentDraft, value: any) => {
    setDocs(docs.map(d => d.id === activeDocId ? { ...d, [field]: value } : d));
  };

  const pushHistory = (newContent: string) => {
    if (newContent === activeDoc.report) return;
    const newHistory = activeDoc.history.slice(0, activeDoc.historyIndex + 1);
    newHistory.push(newContent);
    setDocs(docs.map(d => d.id === activeDocId ? { 
      ...d, 
      report: newContent, 
      history: newHistory, 
      historyIndex: newHistory.length - 1 
    } : d));
  };

  const handleUndo = () => {
    if (activeDoc.historyIndex > 0) {
      const newIndex = activeDoc.historyIndex - 1;
      setDocs(docs.map(d => d.id === activeDocId ? { 
        ...d, 
        report: d.history[newIndex], 
        historyIndex: newIndex 
      } : d));
    }
  };

  const handleRedo = () => {
    if (activeDoc.historyIndex < activeDoc.history.length - 1) {
      const newIndex = activeDoc.historyIndex + 1;
      setDocs(docs.map(d => d.id === activeDocId ? { 
        ...d, 
        report: d.history[newIndex], 
        historyIndex: newIndex 
      } : d));
    }
  };

  const createNewDraft = () => {
    const newId = Date.now().toString();
    setDocs([...docs, { id: newId, topic: '', details: '', report: '', history: [''], historyIndex: 0, tables: [], appendix: [] }]);
    setActiveDocId(newId);
  };

  const closeDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (docs.length === 1) return;
    const newDocs = docs.filter(d => d.id !== id);
    setDocs(newDocs);
    if (activeDocId === id) setActiveDocId(newDocs[0].id);
  };

  // --- Table Logic ---
  const addTable = () => {
    const newTable: FieldTable = {
      id: Date.now().toString(),
      name: `Data Table ${activeDoc.tables.length + 1}`,
      headers: ['Variable', 'Reading 1', 'Reading 2', 'Average'],
      rows: [['', '', '', '']],
      collapsed: false
    };
    updateDoc('tables', [...activeDoc.tables, newTable]);
  };

  const updateTableData = (tableId: string, rowIndex: number, colIndex: number, val: string) => {
    const newTables = activeDoc.tables.map(t => {
      if (t.id === tableId) {
        const newRows = [...t.rows];
        newRows[rowIndex][colIndex] = val;
        return { ...t, rows: newRows };
      }
      return t;
    });
    updateDoc('tables', newTables);
  };

  const addTableRow = (tableId: string) => {
    const newTables = activeDoc.tables.map(t => {
      if (t.id === tableId) {
        return { ...t, rows: [...t.rows, new Array(t.headers.length).fill('')] };
      }
      return t;
    });
    updateDoc('tables', newTables);
  };

  const toggleTable = (tableId: string) => {
    updateDoc('tables', activeDoc.tables.map(t => t.id === tableId ? { ...t, collapsed: !t.collapsed } : t));
  };

  const formatTablesForAI = () => {
    return activeDoc.tables.map(t => {
      return `Table: ${t.name}\nHeaders: ${t.headers.join(', ')}\nRows:\n${t.rows.map(r => r.join(' | ')).join('\n')}`;
    }).join('\n\n');
  };

  // --- Appendix Logic ---
  const handleAppendixUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCaptionLoading(true);
      const newItems: AppendixItem[] = [];
      // Explicitly cast to File[] to avoid 'unknown' type error in strict environments
      for (const file of Array.from(files) as File[]) {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            // Generate caption
            const caption = await generateImageCaption(base64.split(',')[1]);
            newItems.push({
              id: Date.now() + Math.random().toString(),
              image: base64,
              caption: caption
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      updateDoc('appendix', [...activeDoc.appendix, ...newItems]);
      setCaptionLoading(false);
    }
  };

  const updateCaption = (id: string, newCaption: string) => {
    updateDoc('appendix', activeDoc.appendix.map(item => item.id === id ? { ...item, caption: newCaption } : item));
  };

  const removeAppendixItem = (id: string) => {
    updateDoc('appendix', activeDoc.appendix.filter(item => item.id !== id));
  };

  const formatAppendixForAI = () => {
    return activeDoc.appendix.map((item, i) => `Image ${i+1}: ${item.caption}`).join('\n');
  };

  // --- Main Generation ---
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const tableData = formatTablesForAI();
      const appendixData = formatAppendixForAI();
      const result = type === 'TECHNICAL' 
        ? await generateTechnicalReport(activeDoc.topic, activeDoc.details, tableData, appendixData)
        : await generateLabReport(activeDoc.topic, activeDoc.details + (activeDoc.imageAnalysis ? `\n\nMicroscope Analysis:\n${activeDoc.imageAnalysis}` : ''), tableData, appendixData);
      pushHistory(result);
    } catch (e) {
      alert("Report generation failed");
    }
    setLoading(false);
  };

  const handleExport = (format: string) => {
    let mime = 'text/plain';
    if (format === 'DOCX') mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (format === 'ODT') mime = 'application/vnd.oasis.opendocument.text';
    downloadFile(activeDoc.report, `${activeDoc.topic || 'Report'}.${format.toLowerCase()}`, mime);
  };

  // --- Microscope Analysis ---
  const handleMicroscopeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     setAnalyzingImage(true);
     const reader = new FileReader();
     reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
           const analysis = await analyzeMicroscopeImage(base64.split(',')[1]);
           updateDoc('imageAnalysis', analysis);
           updateDoc('details', activeDoc.details + `\n\n[BIO/CHEM OBSERVATION]: ${analysis}`);
        } catch (e) { alert("Analysis failed"); }
        setAnalyzingImage(false);
     };
     reader.readAsDataURL(file);
  };

  // Enhanced Render: Rich Link Tooltips
  const renderContent = (text: string) => {
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <div key={index} className="inline-block relative group z-10 align-baseline">
            <a href={match[2]} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] font-bold bg-blue-50 px-2 py-0.5 rounded mx-1 hover:underline cursor-pointer border border-blue-100 text-sm font-sans">
              {match[1]} <span className="material-icons text-[10px] inline-block align-middle">link</span>
            </a>
            {/* Hover Tooltip / Preview Card */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white p-3 rounded-lg shadow-xl border border-[var(--border-color)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[var(--text-secondary)]">
                    <span className="material-icons text-xs">public</span>
                 </div>
                 <span className="text-xs font-bold text-[var(--text-primary)] truncate block w-full">{match[1]}</span>
               </div>
               <p className="text-[10px] text-[var(--text-secondary)] truncate mb-2">{match[2]}</p>
               <div className="bg-gray-50 p-2 rounded text-[10px] text-gray-500 italic">
                 Click to open source context.
               </div>
               <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b border-r border-[var(--border-color)]"></div>
            </div>
          </div>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
       <CollaborationModal 
         isOpen={isInviteModalOpen} 
         onClose={() => setIsInviteModalOpen(false)} 
         onAdd={handleAddCollaborator}
         existingIds={collaborators.map(c => c.id)}
       />

       <div className="mb-6 flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {type === 'TECHNICAL' ? 'Technical Report Generator' : 'Lab Report Builder'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {type === 'TECHNICAL' ? 'SIWES & Industrial Reports' : 'Experiments & Microscope Analysis'}
            </p>
         </div>
         <div className="flex items-center gap-4">
             <div className="flex items-center -space-x-2 mr-2">
                 {collaborators.map(c => (
                    <div key={c.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs ${c.color} relative group`}>
                       {c.name[0]}
                       <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${c.status === 'EDITING' ? 'bg-orange-400' : c.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                       {/* Tooltip */}
                       <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                          {c.name} ({c.status})
                       </div>
                    </div>
                 ))}
                 <button 
                   onClick={() => setIsInviteModalOpen(true)}
                   className="w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 hover:border-gray-500 z-10 transition-colors"
                   title="Invite Collaborator"
                 >
                   <span className="material-icons text-sm">person_add</span>
                 </button>
             </div>
             <div className="flex gap-1 bg-[var(--surface-color)] p-1 rounded border border-[var(--border-color)]">
               <button onClick={handleUndo} disabled={activeDoc.historyIndex === 0} className="p-2 disabled:opacity-30 hover:bg-gray-100 rounded" title="Undo"><span className="material-icons text-sm">undo</span></button>
               <button onClick={handleRedo} disabled={activeDoc.historyIndex === activeDoc.history.length - 1} className="p-2 disabled:opacity-30 hover:bg-gray-100 rounded" title="Redo"><span className="material-icons text-sm">redo</span></button>
             </div>
         </div>
       </div>

       {/* Tabs Bar */}
       <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
         {docs.map(doc => (
           <div 
             key={doc.id}
             onClick={() => setActiveDocId(doc.id)}
             className={`flex items-center px-4 py-2 rounded-t-lg border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
               activeDocId === doc.id 
                 ? 'bg-[var(--surface-color)] border-[var(--primary)] text-[var(--primary)] font-bold' 
                 : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-color)]'
             }`}
           >
             <span className="mr-2 max-w-[150px] truncate">{doc.topic || 'Untitled Draft'}</span>
             <button onClick={(e) => closeDraft(doc.id, e)} className="hover:text-red-500 rounded-full p-1">
               <span className="material-icons text-xs">close</span>
             </button>
           </div>
         ))}
         <button onClick={createNewDraft} className="p-2 rounded-full hover:bg-[var(--surface-color)] text-[var(--text-secondary)]" title="New Draft">
           <span className="material-icons">add</span>
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
         {/* Input Side */}
         <div className="paper-panel p-6 rounded-sm overflow-y-auto space-y-6">
           
           {/* Basic Info */}
           <div>
             <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                {type === 'TECHNICAL' ? "Establishment / Topic" : "Experiment Title"}
             </label>
             <input 
               className="w-full"
               value={activeDoc.topic}
               onChange={(e) => updateDoc('topic', e.target.value)}
             />
           </div>

           {/* Microscope Analysis (Lab Only) */}
           {type === 'LAB' && (
             <div className="border-2 border-dashed border-[var(--accent)] bg-blue-50/50 p-4 rounded text-center">
                <label className="cursor-pointer block">
                  <span className="material-icons text-3xl text-[var(--accent)] mb-2">biotech</span>
                  <div className="font-bold text-[var(--accent)]">Analyze Biological/Chemical Sample</div>
                  <div className="text-xs text-[var(--text-secondary)]">Upload microscope or chemical reaction images for AI observation.</div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleMicroscopeUpload} />
                </label>
                {analyzingImage && <p className="text-xs text-[var(--accent)] mt-2 animate-pulse">Analyzing cellular structure & chemical properties...</p>}
                {activeDoc.imageAnalysis && <p className="text-xs text-green-600 mt-2 font-bold">Analysis Attached to Observations.</p>}
             </div>
           )}

           <div>
             <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
               {type === 'TECHNICAL' ? "Experience Details" : "Observations & Procedure"}
             </label>
             <textarea 
                className="w-full h-40 resize-none"
                value={activeDoc.details}
                onChange={(e) => updateDoc('details', e.target.value)}
             ></textarea>
           </div>

           {/* Collapsible Input Tables */}
           <div className="border-t border-[var(--border-color)] pt-4">
              <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Data Tables</label>
                 <button onClick={addTable} className="text-xs text-[var(--accent)] font-bold hover:underline">+ Add Table (Collapsible)</button>
              </div>
              {activeDoc.tables.map(t => (
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

           {/* Appendix Builder */}
           <div className="border-t border-[var(--border-color)] pt-4">
              <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Appendix (Images & Captions)</label>
                 <label className="text-xs text-[var(--accent)] font-bold hover:underline cursor-pointer">
                    + Upload Image
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleAppendixUpload} />
                 </label>
              </div>
              {captionLoading && <p className="text-xs text-[var(--text-secondary)] animate-pulse">Generating academic captions...</p>}
              <div className="space-y-3">
                 {activeDoc.appendix.map((item, idx) => (
                    <div key={item.id} className="flex gap-3 items-start bg-[var(--bg-color)] p-2 rounded border border-[var(--border-color)]">
                       <img src={item.image} className="w-16 h-16 object-cover rounded" alt="Appendix" />
                       <div className="flex-1">
                          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Figure {idx + 1}</p>
                          <textarea 
                             className="w-full text-xs p-1 bg-transparent border-none outline-none resize-none h-12" 
                             value={item.caption} 
                             onChange={(e) => updateCaption(item.id, e.target.value)}
                             placeholder="Is this caption accurate? Edit here..."
                          />
                       </div>
                       <button onClick={() => removeAppendixItem(item.id)} className="text-red-400 hover:text-red-600">
                          <span className="material-icons text-sm">delete</span>
                       </button>
                    </div>
                 ))}
              </div>
           </div>
           
           <button 
             onClick={handleGenerate}
             disabled={loading}
             className="w-full btn-primary"
           >
             {loading ? 'Compiling Report...' : 'Generate Report'}
           </button>
         </div>

         {/* Output Side */}
         <div className="paper-panel p-10 rounded-sm flex-1 overflow-y-auto bg-white border border-[var(--border-color)] relative">
           {activeDoc.report ? (
             <>
               <div className="absolute top-4 right-4 flex gap-2">
                 <button onClick={() => handleExport('PDF')} className="text-xs font-bold border border-[var(--border-color)] px-3 py-1 rounded hover:bg-gray-50">PDF</button>
                 <button onClick={() => handleExport('DOCX')} className="text-xs font-bold border border-[var(--border-color)] px-3 py-1 rounded hover:bg-gray-50">Word</button>
                 <button onClick={() => handleExport('ODT')} className="text-xs font-bold border border-[var(--border-color)] px-3 py-1 rounded hover:bg-gray-50">ODT</button>
               </div>
               <article className="prose prose-slate max-w-none mt-6">
                 <div className="whitespace-pre-wrap font-serif text-base text-[var(--text-primary)] font-normal leading-relaxed">
                   {renderContent(activeDoc.report)}
                 </div>
               </article>
             </>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50">
               <span className="material-icons text-6xl mb-4">description</span>
               <p className="italic">Report preview will appear here</p>
             </div>
           )}
         </div>
       </div>
    </div>
  );
};
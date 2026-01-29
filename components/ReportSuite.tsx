import React, { useState } from 'react';
import { generateTechnicalReport, generateLabReport, analyzeMicroscopeImage, downloadFile } from '../services/geminiService';

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
}

export const ReportSuite: React.FC<ReportSuiteProps> = ({ type }) => {
  const [docs, setDocs] = useState<DocumentDraft[]>([
    { id: '1', topic: '', details: '', report: '', history: [''], historyIndex: 0 }
  ]);
  const [activeDocId, setActiveDocId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  const activeDoc = docs.find(d => d.id === activeDocId) || docs[0];

  const updateDoc = (field: keyof DocumentDraft, value: any) => {
    setDocs(docs.map(d => d.id === activeDocId ? { ...d, [field]: value } : d));
  };

  // Undo/Redo Logic
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
    setDocs([...docs, { id: newId, topic: '', details: '', report: '', history: [''], historyIndex: 0 }]);
    setActiveDocId(newId);
  };

  const closeDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (docs.length === 1) {
       updateDoc('topic', ''); 
       updateDoc('details', ''); 
       updateDoc('report', '');
       return;
    }
    const newDocs = docs.filter(d => d.id !== id);
    setDocs(newDocs);
    if (activeDocId === id) setActiveDocId(newDocs[0].id);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = type === 'TECHNICAL' 
        ? await generateTechnicalReport(activeDoc.topic, activeDoc.details)
        : await generateLabReport(activeDoc.topic, activeDoc.details + (activeDoc.imageAnalysis ? `\n\nMicroscope Analysis:\n${activeDoc.imageAnalysis}` : ''));
      pushHistory(result);
    } catch (e) {
      alert("Report generation failed");
    }
    setLoading(false);
  };

  const handleExport = (format: string) => {
    downloadFile(activeDoc.report, `${activeDoc.topic || 'Report'}.${format.toLowerCase()}`, 'application/msword');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAnalyzingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const analysis = await analyzeMicroscopeImage(base64);
        updateDoc('imageAnalysis', analysis);
        // Auto-append to details for convenience
        updateDoc('details', activeDoc.details + `\n\n[Microscope Image Analysis]: ${analysis}`);
      } catch (err) {
        alert("Image analysis failed");
      }
      setAnalyzingImage(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
       <div className="mb-6 flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {type === 'TECHNICAL' ? 'Technical Report Generator' : 'Lab Report Builder'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {type === 'TECHNICAL' ? 'SIWES & Industrial Reports' : 'Experiments & Microscope Analysis'}
            </p>
         </div>
         <div className="flex gap-1 bg-[var(--surface-color)] p-1 rounded border border-[var(--border-color)]">
           <button onClick={handleUndo} disabled={activeDoc.historyIndex === 0} className="p-2 disabled:opacity-30 hover:bg-gray-100 rounded" title="Undo"><span className="material-icons text-sm">undo</span></button>
           <button onClick={handleRedo} disabled={activeDoc.historyIndex === activeDoc.history.length - 1} className="p-2 disabled:opacity-30 hover:bg-gray-100 rounded" title="Redo"><span className="material-icons text-sm">redo</span></button>
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
         <div className="paper-panel p-6 rounded-sm overflow-y-auto">
           <div className="mb-4">
             <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                {type === 'TECHNICAL' ? "Establishment / Topic" : "Experiment Title"}
             </label>
             <input 
               className="w-full"
               value={activeDoc.topic}
               onChange={(e) => updateDoc('topic', e.target.value)}
             />
           </div>

           {type === 'LAB' && (
             <div className="mb-4 p-4 border-2 border-dashed border-[var(--border-color)] rounded-lg bg-[var(--bg-color)]">
                <label className="flex items-center cursor-pointer justify-center gap-2 text-[var(--primary)] font-bold">
                  <span className="material-icons">biotech</span>
                  {analyzingImage ? "Analyzing Microscope Slide..." : "Upload Microscope Image"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={analyzingImage} />
                </label>
                {activeDoc.imageAnalysis && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                    <strong>Analysis Ready:</strong> {activeDoc.imageAnalysis.substring(0, 50)}...
                  </div>
                )}
             </div>
           )}

           <div className="mb-4">
             <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
               {type === 'TECHNICAL' ? "Experience Details" : "Observations & Procedure"}
             </label>
             <textarea 
                className="w-full h-64 resize-none"
                value={activeDoc.details}
                onChange={(e) => updateDoc('details', e.target.value)}
             ></textarea>
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
                 <button onClick={() => handleExport('RTF')} className="text-xs font-bold border border-[var(--border-color)] px-3 py-1 rounded hover:bg-gray-50">RTF</button>
               </div>
               <article className="prose prose-slate max-w-none mt-6">
                 <pre className="whitespace-pre-wrap font-serif text-base text-[var(--text-primary)] font-normal leading-relaxed">
                   {activeDoc.report}
                 </pre>
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
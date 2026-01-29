import React, { useState, useEffect } from 'react';
import { generateAcademicDocument, searchYouTubeVideos, generateBibliography, downloadFile } from '../services/geminiService';
import { YouTubeVideo, Citation, Collaborator } from '../types';

interface DocDraft {
  id: string;
  level: string;
  course: string;
  topic: string;
  details: string;
  output: string;
  videos: YouTubeVideo[];
  citations: Citation[];
  history: string[]; // For Undo/Redo
  historyIndex: number; // For Undo/Redo
}

export const DocumentWriter: React.FC = () => {
  const [drafts, setDrafts] = useState<DocDraft[]>([
    { id: '1', level: 'Undergraduate', course: '', topic: '', details: '', output: '', videos: [], citations: [], history: [''], historyIndex: 0 }
  ]);
  const [activeId, setActiveId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [citationLoading, setCitationLoading] = useState(false);
  const [collabPanelOpen, setCollabPanelOpen] = useState(false);

  // Mock Collaborators
  const collaborators: Collaborator[] = [
    { id: '1', name: 'You', color: 'bg-blue-500', status: 'ONLINE' },
    { id: '2', name: 'Dr. Emily', color: 'bg-green-500', status: 'EDITING' },
    { id: '3', name: 'Student_02', color: 'bg-purple-500', status: 'IDLE' },
  ];

  const activeDraft = drafts.find(d => d.id === activeId) || drafts[0];

  // Helper to update draft
  const updateDraft = (field: keyof DocDraft, value: any) => {
    setDrafts(drafts.map(d => d.id === activeId ? { ...d, [field]: value } : d));
  };

  // Undo/Redo Logic
  const pushHistory = (newContent: string) => {
    if (newContent === activeDraft.output) return;
    
    const newHistory = activeDraft.history.slice(0, activeDraft.historyIndex + 1);
    newHistory.push(newContent);
    
    // Limit history stack size if needed, e.g. 50 steps
    if (newHistory.length > 50) newHistory.shift();

    setDrafts(drafts.map(d => d.id === activeId ? { 
      ...d, 
      output: newContent, 
      history: newHistory, 
      historyIndex: newHistory.length - 1 
    } : d));
  };

  const handleUndo = () => {
    if (activeDraft.historyIndex > 0) {
      const newIndex = activeDraft.historyIndex - 1;
      setDrafts(drafts.map(d => d.id === activeId ? { 
        ...d, 
        output: d.history[newIndex], 
        historyIndex: newIndex 
      } : d));
    }
  };

  const handleRedo = () => {
    if (activeDraft.historyIndex < activeDraft.history.length - 1) {
      const newIndex = activeDraft.historyIndex + 1;
      setDrafts(drafts.map(d => d.id === activeId ? { 
        ...d, 
        output: d.history[newIndex], 
        historyIndex: newIndex 
      } : d));
    }
  };

  const newDraft = () => {
    const id = Date.now().toString();
    setDrafts([...drafts, { 
      id, level: 'Undergraduate', course: '', topic: '', details: '', output: '', videos: [], citations: [], history: [''], historyIndex: 0 
    }]);
    setActiveId(id);
  };

  const closeDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (drafts.length === 1) return;
    const rem = drafts.filter(d => d.id !== id);
    setDrafts(rem);
    if (activeId === id) setActiveId(rem[0].id);
  };

  const handleGenerate = async () => {
    if (!activeDraft.topic || !activeDraft.course) return;
    setLoading(true);
    try {
      const [docText, fetchedVideos] = await Promise.all([
        generateAcademicDocument(activeDraft.level, activeDraft.course, activeDraft.topic, activeDraft.details),
        searchYouTubeVideos(activeDraft.topic)
      ]);
      pushHistory(docText);
      updateDraft('videos', fetchedVideos);
    } catch (e) {
      alert("Generation failed.");
    }
    setLoading(false);
  };

  // Citation Management
  const addCitation = () => {
    const newCit: Citation = { id: Date.now().toString(), type: 'WEBSITE', title: '', author: '', year: new Date().getFullYear().toString() };
    updateDraft('citations', [...activeDraft.citations, newCit]);
  };

  const updateCitation = (cid: string, field: keyof Citation, val: string) => {
    const newCits = activeDraft.citations.map(c => c.id === cid ? { ...c, [field]: val } : c);
    updateDraft('citations', newCits);
  };

  const generateBib = async (style: 'APA' | 'MLA' | 'Chicago') => {
    setCitationLoading(true);
    try {
      const bib = await generateBibliography(activeDraft.citations, style);
      const newContent = activeDraft.output + `\n\nBIBLIOGRAPHY (${style})\n\n` + bib;
      pushHistory(newContent);
    } catch (e) {
      alert("Bibliography generation failed");
    }
    setCitationLoading(false);
  };

  // Export
  const handleExport = (format: 'PDF' | 'DOCX' | 'RTF' | 'TXT') => {
    const filename = `${activeDraft.topic || 'Document'}.${format.toLowerCase()}`;
    // Simulating DOCX/RTF with text/html content for prototype compatibility
    const mime = format === 'TXT' ? 'text/plain' : 'application/msword'; 
    downloadFile(activeDraft.output, filename, mime);
  };

  // Function to render text with clickable links
  const renderContent = (text: string) => {
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold bg-blue-50 px-1 rounded mx-1">
            {match[1]} <span className="material-icons text-[10px]">open_in_new</span>
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col relative">
      {/* Collaboration Bar / Header */}
      <div className="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-2">
         {/* Tabs */}
         <div className="flex items-center gap-2 overflow-x-auto">
            {drafts.map(d => (
              <div 
                key={d.id}
                onClick={() => setActiveId(d.id)}
                className={`px-4 py-2 cursor-pointer text-sm font-medium border-b-2 flex items-center transition-colors ${
                  activeId === d.id ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-color)] rounded-t' : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-color)]'
                }`}
              >
                <span className="mr-2 max-w-[120px] truncate">{d.topic || 'Untitled Doc'}</span>
                <button onClick={(e) => closeDraft(d.id, e)} className="hover:bg-gray-200 rounded-full p-1"><span className="material-icons text-[10px]">close</span></button>
              </div>
            ))}
            <button onClick={newDraft} className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)]"><span className="material-icons">add_circle</span></button>
         </div>

         {/* Collaboration & Export Actions */}
         <div className="flex items-center gap-4">
            <div className="flex -space-x-2 cursor-pointer" onClick={() => setCollabPanelOpen(!collabPanelOpen)} title="Active Collaborators">
               {collaborators.map(c => (
                 <div key={c.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs ${c.color} relative`}>
                    {c.name[0]}
                    {c.status === 'EDITING' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></span>}
                 </div>
               ))}
               <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500 hover:bg-gray-300">+</div>
            </div>
            
            <div className="flex gap-1 bg-[var(--surface-color)] rounded p-1 border border-[var(--border-color)]">
              <button onClick={handleUndo} disabled={activeDraft.historyIndex === 0} className="p-1 disabled:opacity-30 hover:bg-gray-100 rounded" title="Undo"><span className="material-icons text-sm">undo</span></button>
              <button onClick={handleRedo} disabled={activeDraft.historyIndex === activeDraft.history.length - 1} className="p-1 disabled:opacity-30 hover:bg-gray-100 rounded" title="Redo"><span className="material-icons text-sm">redo</span></button>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-1 bg-[var(--accent)] text-white px-3 py-1.5 rounded text-sm font-bold">
                Export <span className="material-icons text-sm">expand_more</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[var(--border-color)] shadow-xl rounded-lg hidden group-hover:block z-50">
                 <button onClick={() => handleExport('PDF')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">PDF Document (.pdf)</button>
                 <button onClick={() => handleExport('DOCX')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Word Document (.doc)</button>
                 <button onClick={() => handleExport('RTF')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Rich Text (.rtf)</button>
                 <button onClick={() => handleExport('TXT')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Plain Text (.txt)</button>
              </div>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
        {/* Left Sidebar: Inputs & Tools */}
        <div className="w-full md:w-1/3 space-y-6 overflow-y-auto pb-10 pr-2 custom-scrollbar">
          
          {/* Main Input Panel */}
          <div className="paper-panel p-6 rounded-sm">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span className="material-icons text-sm">edit_note</span> Document Details
            </h3>
            
            <div className="space-y-3">
              <select value={activeDraft.level} onChange={(e) => updateDraft('level', e.target.value)} className="w-full">
                <option>Diploma</option>
                <option>Undergraduate (BSc, BA)</option>
                <option>Postgraduate (MSc)</option>
                <option>PhD</option>
              </select>

              <input value={activeDraft.course} onChange={(e) => updateDraft('course', e.target.value)} className="w-full" placeholder="Course (e.g. Microbiology)" />
              <input value={activeDraft.topic} onChange={(e) => updateDraft('topic', e.target.value)} className="w-full" placeholder="Research Topic" />
              <textarea value={activeDraft.details} onChange={(e) => updateDraft('details', e.target.value)} className="w-full h-24" placeholder="Context & Specifics..."></textarea>
            </div>

            <button onClick={handleGenerate} disabled={loading} className="w-full btn-primary mt-4 flex items-center justify-center gap-2">
              {loading ? <span className="animate-spin material-icons">refresh</span> : <span className="material-icons">auto_awesome</span>}
              {loading ? 'Writing...' : 'Generate Document'}
            </button>
          </div>

          {/* Citation Manager */}
          <div className="paper-panel p-6 rounded-sm border-t-4 border-[var(--primary)]">
             <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="material-icons text-sm">format_quote</span> Citation Manager</span>
                <button onClick={addCitation} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">+ Add</button>
             </h3>
             
             <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
               {activeDraft.citations.length === 0 && <p className="text-xs text-gray-400 italic">No citations added yet.</p>}
               {activeDraft.citations.map(c => (
                 <div key={c.id} className="bg-[var(--bg-color)] p-2 rounded border border-[var(--border-color)] text-xs space-y-1">
                    <input className="w-full bg-transparent border-none p-0 font-bold placeholder-gray-500" placeholder="Title/Source Name" value={c.title} onChange={(e) => updateCitation(c.id, 'title', e.target.value)} />
                    <div className="flex gap-2">
                      <input className="w-1/2 bg-transparent border-none p-0" placeholder="Author" value={c.author} onChange={(e) => updateCitation(c.id, 'author', e.target.value)} />
                      <input className="w-1/2 bg-transparent border-none p-0" placeholder="Year" value={c.year} onChange={(e) => updateCitation(c.id, 'year', e.target.value)} />
                    </div>
                 </div>
               ))}
             </div>

             <div className="flex gap-2">
                {['APA', 'MLA', 'Chicago'].map((style) => (
                  <button 
                    key={style} 
                    onClick={() => generateBib(style as any)} 
                    disabled={citationLoading || activeDraft.citations.length === 0}
                    className="flex-1 text-xs border border-[var(--border-color)] py-2 rounded hover:bg-gray-50 font-bold"
                  >
                    {style}
                  </button>
                ))}
             </div>
          </div>

          {/* Videos */}
          {activeDraft.videos.length > 0 && (
             <div className="paper-panel p-6 rounded-sm border-l-4 border-red-500">
               <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center">
                 <span className="material-icons text-red-500 mr-2">smart_display</span>
                 Related Videos
               </h3>
               <div className="space-y-4">
                 {activeDraft.videos.map((v, i) => (
                   <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-[var(--bg-color)] rounded border border-[var(--border-color)] hover:bg-[var(--shadow-sm)]">
                     <p className="font-bold text-sm text-[var(--text-primary)] mb-1">{v.title}</p>
                     <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{v.description}</p>
                   </a>
                 ))}
               </div>
             </div>
          )}
        </div>

        {/* Editor / Output */}
        <div className="w-full md:w-2/3 paper-panel p-10 rounded-sm overflow-y-auto bg-white border border-[var(--border-color)] shadow-inner relative">
           {activeDraft.output ? (
             <article className="prose prose-slate max-w-none">
               <div className="whitespace-pre-wrap font-serif text-base text-[var(--text-primary)] font-normal leading-relaxed">
                 {renderContent(activeDraft.output)}
               </div>
             </article>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50">
               <span className="material-icons text-6xl mb-4">article</span>
               <p className="italic">Document Preview will appear here.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
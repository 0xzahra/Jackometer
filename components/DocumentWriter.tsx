import React, { useState, useEffect } from 'react';
import { generateAcademicDocument, searchYouTubeVideos, generateBibliography, downloadFile, generateImageCaption } from '../services/geminiService';
import { YouTubeVideo, Citation, Collaborator, AppendixItem } from '../types';

interface DocDraft {
  id: string;
  level: string;
  course: string;
  topic: string;
  details: string;
  output: string;
  videos: YouTubeVideo[];
  citations: Citation[];
  history: string[]; 
  historyIndex: number;
  uploadedImages: string[];
  appendix: AppendixItem[];
}

export const DocumentWriter: React.FC = () => {
  const [drafts, setDrafts] = useState<DocDraft[]>([
    { id: '1', level: 'Undergraduate', course: '', topic: '', details: '', output: '', videos: [], citations: [], history: [''], historyIndex: 0, uploadedImages: [], appendix: [] }
  ]);
  const [activeId, setActiveId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [citationLoading, setCitationLoading] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);

  // Mock Collaborators
  const collaborators: Collaborator[] = [
    { id: '1', name: 'You', color: 'bg-blue-500', status: 'ONLINE' },
    { id: '2', name: 'Dr. Emily', color: 'bg-green-500', status: 'EDITING' },
    { id: '3', name: 'Student_02', color: 'bg-purple-500', status: 'IDLE' },
  ];

  const activeDraft = drafts.find(d => d.id === activeId) || drafts[0];

  const updateDraft = (field: keyof DocDraft, value: any) => {
    setDrafts(drafts.map(d => d.id === activeId ? { ...d, [field]: value } : d));
  };

  // Undo/Redo Logic
  const pushHistory = (newContent: string) => {
    if (newContent === activeDraft.output) return;
    const newHistory = activeDraft.history.slice(0, activeDraft.historyIndex + 1);
    newHistory.push(newContent);
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
      id, level: 'Undergraduate', course: '', topic: '', details: '', output: '', videos: [], citations: [], history: [''], historyIndex: 0, uploadedImages: [], appendix: []
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
      const appendixStr = activeDraft.appendix.map((a, i) => `Figure ${i+1}: ${a.caption}`).join('\n');
      const [docText, fetchedVideos] = await Promise.all([
        generateAcademicDocument(activeDraft.level, activeDraft.course, activeDraft.topic, activeDraft.details, appendixStr),
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

  // Appendix Logic
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
      updateDraft('appendix', [...activeDraft.appendix, ...newItems]);
      setCaptionLoading(false);
    }
  };

  const updateCaption = (id: string, text: string) => {
    updateDraft('appendix', activeDraft.appendix.map(a => a.id === id ? { ...a, caption: text } : a));
  };

  const removeAppendix = (id: string) => {
    updateDraft('appendix', activeDraft.appendix.filter(a => a.id !== id));
  };

  // Export
  const handleExport = (format: 'PDF' | 'DOCX' | 'RTF' | 'ODT' | 'TXT') => {
    const filename = `${activeDraft.topic || 'Document'}.${format.toLowerCase()}`;
    let mime = 'text/plain';
    if (format === 'DOCX') mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (format === 'ODT') mime = 'application/vnd.oasis.opendocument.text';
    if (format === 'RTF') mime = 'application/rtf';
    if (format === 'PDF') mime = 'application/pdf'; 

    downloadFile(activeDraft.output, filename, mime);
  };

  // Enhanced Render: Rich Link Tooltips
  const renderContent = (text: string) => {
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <div key={index} className="inline-block relative group z-10">
            <a href={match[2]} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] font-bold bg-blue-50 px-2 py-0.5 rounded mx-1 hover:underline cursor-pointer border border-blue-100">
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
    <div className="max-w-7xl mx-auto h-full flex flex-col relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-2">
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

         <div className="flex items-center gap-4">
            {/* Collaborators */}
            <div className="flex -space-x-2 cursor-pointer" title="Active Collaborators">
               {collaborators.map(c => (
                 <div key={c.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs ${c.color} relative`}>
                    {c.name[0]}
                    {c.status === 'EDITING' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></span>}
                 </div>
               ))}
               <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500 hover:bg-gray-300">+</div>
            </div>
            
            {/* Undo/Redo */}
            <div className="flex gap-1 bg-[var(--surface-color)] rounded p-1 border border-[var(--border-color)]">
              <button onClick={handleUndo} disabled={activeDraft.historyIndex === 0} className="p-1 disabled:opacity-30 hover:bg-gray-100 rounded" title="Undo"><span className="material-icons text-sm">undo</span></button>
              <button onClick={handleRedo} disabled={activeDraft.historyIndex === activeDraft.history.length - 1} className="p-1 disabled:opacity-30 hover:bg-gray-100 rounded" title="Redo"><span className="material-icons text-sm">redo</span></button>
            </div>

            {/* Export */}
            <div className="relative group">
              <button className="flex items-center gap-1 bg-[var(--accent)] text-white px-3 py-1.5 rounded text-sm font-bold shadow-sm">
                Export <span className="material-icons text-sm">expand_more</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[var(--border-color)] shadow-xl rounded-lg hidden group-hover:block z-50">
                 <button onClick={() => handleExport('PDF')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">PDF Document (.pdf)</button>
                 <button onClick={() => handleExport('DOCX')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">Word Document (.docx)</button>
                 <button onClick={() => handleExport('ODT')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">OpenDocument (.odt)</button>
                 <button onClick={() => handleExport('RTF')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">Rich Text (.rtf)</button>
                 <button onClick={() => handleExport('TXT')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">Plain Text (.txt)</button>
              </div>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 space-y-6 overflow-y-auto pb-10 pr-2 custom-scrollbar">
          
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

            {/* Appendix Builder */}
            <div className="border-t border-[var(--border-color)] pt-4 mt-4">
               <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Appendix (Images & Captions)</label>
                  <label className="text-xs text-[var(--accent)] font-bold hover:underline cursor-pointer">
                     + Add Image
                     <input type="file" multiple accept="image/*" className="hidden" onChange={handleAppendixUpload} />
                  </label>
               </div>
               {captionLoading && <p className="text-xs text-[var(--text-secondary)] animate-pulse">Generating academic captions...</p>}
               <div className="space-y-3">
                  {activeDraft.appendix.map((item, idx) => (
                     <div key={item.id} className="flex gap-3 items-start bg-[var(--bg-color)] p-2 rounded border border-[var(--border-color)]">
                        <img src={item.image} className="w-16 h-16 object-cover rounded" alt="Appendix" />
                        <div className="flex-1">
                           <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Figure {idx + 1}</p>
                           <textarea 
                              className="w-full text-xs p-1 bg-transparent border-none outline-none resize-none h-12" 
                              value={item.caption} 
                              onChange={(e) => updateCaption(item.id, e.target.value)}
                              placeholder="Review caption..."
                           />
                        </div>
                        <button onClick={() => removeAppendix(item.id)} className="text-red-400 hover:text-red-600">
                           <span className="material-icons text-sm">delete</span>
                        </button>
                     </div>
                  ))}
               </div>
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
                <button onClick={addCitation} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-300">+ Add</button>
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
        </div>

        {/* Editor Area */}
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
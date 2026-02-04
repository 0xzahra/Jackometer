import React, { useState, useEffect, useRef } from 'react';
import { generateAcademicDocument, searchYouTubeVideos, generateBibliography, downloadFile, generateImageCaption, enrichCitationFromUrl, verifyCitations, getContextualQuotes } from '../services/geminiService';
import { YouTubeVideo, Citation, Collaborator, AppendixItem, UserSearchResult } from '../types';
import { CollaborationModal } from './CollaborationModal';
import katex from 'katex';

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

interface DocumentWriterProps {
  userId: string;
}

export const DocumentWriter: React.FC<DocumentWriterProps> = ({ userId }) => {
  const STORAGE_KEY_DRAFTS = `jackometer_docs_${userId}_drafts`;
  const STORAGE_KEY_ACTIVE = `jackometer_docs_${userId}_active`;

  // Initialize Drafts from LocalStorage
  const [drafts, setDrafts] = useState<DocDraft[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load drafts from storage", e);
    }
    // Default initial state if no save found
    return [{ id: '1', level: 'Undergraduate', course: '', topic: '', details: '', output: '', videos: [], citations: [], history: [''], historyIndex: 0, uploadedImages: [], appendix: [] }];
  });

  // Initialize Active ID from LocalStorage
  const [activeId, setActiveId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) return saved;
    } catch (e) {}
    // Fallback to the ID of the first draft if available, or '1'
    return '1';
  });

  // Persist drafts whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(drafts));
    } catch (e) {
      console.error("Storage quota exceeded or error saving drafts", e);
    }
  }, [drafts, STORAGE_KEY_DRAFTS]);

  // Persist active ID whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE, activeId);
  }, [activeId, STORAGE_KEY_ACTIVE]);

  const [loading, setLoading] = useState(false);
  const [citationLoading, setCitationLoading] = useState(false);
  const [smartImportUrl, setSmartImportUrl] = useState('');
  const [captionLoading, setCaptionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const saveTimeoutRef = useRef<any>(null);

  // Verification & Contextual Sourcing State
  const [verifying, setVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any[]>([]);
  
  // Contextual Modal State
  const [showContextModal, setShowContextModal] = useState(false);
  const [selectedCitationForContext, setSelectedCitationForContext] = useState<Citation | null>(null);
  const [targetParagraph, setTargetParagraph] = useState('');
  const [contextQuotes, setContextQuotes] = useState<string[]>([]);
  const [contextLoading, setContextLoading] = useState(false);

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
        // Randomly toggle status for others to simulate activity
        const rand = Math.random();
        let newStatus: 'ONLINE' | 'EDITING' | 'IDLE' = c.status;
        if (rand > 0.7) newStatus = 'EDITING';
        else if (rand > 0.4) newStatus = 'ONLINE';
        else newStatus = 'IDLE';
        return { ...c, status: newStatus };
      }));
    }, 5000);
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
    alert(`${user.name} has been invited to the document.`);
  };

  // Ensure activeDraft exists, fallback to first if activeId is stale/invalid
  const activeDraft = drafts.find(d => d.id === activeId) || drafts[0];

  // Safety check to prevent crashing if localstorage corrupted drafts into empty array (though init prevents this)
  if (!activeDraft) return <div className="p-8 text-center text-red-500">Error: No active document found. Please reset via settings.</div>;

  const updateDraft = (field: keyof DocDraft, value: any) => {
    setDrafts(drafts.map(d => d.id === activeId ? { ...d, [field]: value } : d));
  };

  const handleManualEdit = (val: string) => {
    // 1. Update visual state immediately for responsiveness
    setDrafts(prev => prev.map(d => d.id === activeId ? { ...d, output: val } : d));

    // 2. Debounce history commit to avoid one entry per keystroke
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setDrafts(current => current.map(d => {
        if (d.id === activeId) {
           const lastHistory = d.history[d.historyIndex];
           // Only push if content actually changed from last history point
           if (lastHistory !== val) {
             const newHistory = d.history.slice(0, d.historyIndex + 1);
             newHistory.push(val);
             if (newHistory.length > 50) newHistory.shift();
             return {
               ...d,
               history: newHistory,
               historyIndex: newHistory.length - 1
             };
           }
        }
        return d;
      }));
    }, 1000); // 1 second debounce
  };

  const insertLatex = () => {
    const template = " $$ E = mc^2 $$ ";
    const newContent = activeDraft.output + template;
    pushHistory(newContent);
  };

  // Undo/Redo Logic
  const pushHistory = (newContent: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    setDrafts(currDrafts => {
      const d = currDrafts.find(item => item.id === activeId);
      if (!d) return currDrafts;
      if (newContent === d.output) return currDrafts;

      const newHistory = d.history.slice(0, d.historyIndex + 1);
      newHistory.push(newContent);
      if (newHistory.length > 50) newHistory.shift();
      
      return currDrafts.map(item => item.id === activeId ? { 
        ...item, 
        output: newContent, 
        history: newHistory, 
        historyIndex: newHistory.length - 1 
      } : item);
    });
  };

  const handleUndo = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    setDrafts(currDrafts => {
      const d = currDrafts.find(item => item.id === activeId);
      if (!d || d.historyIndex <= 0) return currDrafts;

      const newIndex = d.historyIndex - 1;
      return currDrafts.map(item => item.id === activeId ? { 
        ...item, 
        output: item.history[newIndex], 
        historyIndex: newIndex 
      } : item);
    });
  };

  const handleRedo = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    setDrafts(currDrafts => {
      const d = currDrafts.find(item => item.id === activeId);
      if (!d || d.historyIndex >= d.history.length - 1) return currDrafts;

      const newIndex = d.historyIndex + 1;
      return currDrafts.map(item => item.id === activeId ? { 
        ...item, 
        output: item.history[newIndex], 
        historyIndex: newIndex 
      } : item);
    });
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

  const handleSmartImport = async () => {
    if(!smartImportUrl.trim()) return;
    setCitationLoading(true);
    try {
      const enriched = await enrichCitationFromUrl(smartImportUrl);
      const newCit: Citation = {
        id: Date.now().toString(),
        type: 'WEBSITE',
        title: enriched.title || 'Unknown Source',
        author: enriched.author || 'n.d.',
        year: enriched.year || 'n.d.',
        url: smartImportUrl,
        context: enriched.context || 'Accessed via URL.'
      };
      updateDraft('citations', [...activeDraft.citations, newCit]);
      setSmartImportUrl('');
    } catch(e) {
      alert("Could not import URL details.");
    }
    setCitationLoading(false);
  };

  const updateCitation = (cid: string, field: keyof Citation, val: string) => {
    const newCits = activeDraft.citations.map(c => c.id === cid ? { ...c, [field]: val } : c);
    updateDraft('citations', newCits);
  };

  const removeCitation = (cid: string) => {
    updateDraft('citations', activeDraft.citations.filter(c => c.id !== cid));
  };

  const handleVerifyCitations = async () => {
     if (activeDraft.citations.length === 0) return;
     setVerifying(true);
     setVerificationResults([]);
     try {
       const results = await verifyCitations(activeDraft.citations);
       setVerificationResults(results);
     } catch(e) { alert("Verification failed."); }
     setVerifying(false);
  };

  // --- Contextual Sourcing Logic ---
  const openContextModal = (cit: Citation) => {
    setSelectedCitationForContext(cit);
    setTargetParagraph(''); // Reset paragraph input
    setContextQuotes([]);
    setShowContextModal(true);
  };

  const handleAnalyzeContext = async () => {
    if (!selectedCitationForContext || !targetParagraph.trim()) return;
    setContextLoading(true);
    try {
      const quotes = await getContextualQuotes(selectedCitationForContext, targetParagraph);
      setContextQuotes(quotes);
    } catch (e) {
      alert("Could not find quotes.");
    }
    setContextLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
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

  // Enhanced Render: Rich Link Tooltips & LaTeX Support
  const renderLinks = (text: string) => {
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
      return <span key={index}>{part}</span>;
    });
  };

  const renderContent = (text: string) => {
    // Split by Block Math ($$...$$) or Inline Math ($...$)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\n$]+\$)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block Math
        try {
          const html = katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false });
          return <div key={index} dangerouslySetInnerHTML={{ __html: html }} className="my-4 text-center overflow-x-auto" />;
        } catch (e) {
          return <code key={index} className="text-red-500 block">{part}</code>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline Math
        try {
          const html = katex.renderToString(part.slice(1, -1), { displayMode: false, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
        } catch (e) {
          return <code key={index} className="text-red-500">{part}</code>;
        }
      } else {
        // Regular Text (with Links)
        return <span key={index}>{renderLinks(part)}</span>;
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col relative">
      <CollaborationModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        onAdd={handleAddCollaborator}
        existingIds={collaborators.map(c => c.id)}
      />

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
            <div className="flex items-center -space-x-2 mr-2">
               {collaborators.map(c => (
                 <div key={c.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs ${c.color} relative group cursor-pointer`}>
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
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="material-icons text-sm">format_quote</span> Citation Manager
                </h3>
                {activeDraft.citations.length > 0 && (
                  <button 
                    onClick={handleVerifyCitations} 
                    disabled={verifying}
                    className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200"
                  >
                    {verifying ? 'Verifying...' : 'Verify Sources'}
                  </button>
                )}
             </div>
             
             {/* Smart Import Input */}
             <div className="flex gap-2 mb-4 bg-gray-50 p-2 rounded border border-gray-200">
               <input 
                 className="flex-1 bg-transparent border-none text-xs outline-none" 
                 placeholder="Paste URL to Smart Import..." 
                 value={smartImportUrl}
                 onChange={(e) => setSmartImportUrl(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSmartImport()}
               />
               <button 
                  onClick={handleSmartImport} 
                  disabled={citationLoading || !smartImportUrl}
                  className="text-xs font-bold text-[var(--primary)] hover:underline"
               >
                 {citationLoading ? '...' : 'IMPORT'}
               </button>
             </div>

             <div className="space-y-3 max-h-64 overflow-y-auto mb-4 custom-scrollbar">
               {activeDraft.citations.length === 0 && <p className="text-xs text-gray-400 italic text-center">No citations added yet.</p>}
               {activeDraft.citations.map(c => {
                 const verifyResult = verificationResults.find(r => r.id === c.id);
                 return (
                   <div key={c.id} className={`bg-[var(--bg-color)] p-2 rounded border text-xs relative group ${verifyResult?.status === 'SUSPICIOUS' ? 'border-red-400 bg-red-50' : verifyResult?.status === 'VALID' ? 'border-green-400 bg-green-50' : 'border-[var(--border-color)]'}`}>
                      <button 
                        onClick={() => removeCitation(c.id)} 
                        className="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-icons text-[10px]">close</span>
                      </button>
                      
                      <div className="flex gap-1 mb-1">
                         <input className="w-full bg-transparent border-none p-0 font-bold placeholder-gray-500" placeholder="Title/Source Name" value={c.title} onChange={(e) => updateCitation(c.id, 'title', e.target.value)} />
                         {verifyResult && (
                           <span className="material-icons text-xs" title={verifyResult.note}>{verifyResult.status === 'VALID' ? 'check_circle' : 'warning'}</span>
                         )}
                      </div>

                      <div className="flex gap-2 mb-1">
                        <input className="w-1/2 bg-transparent border-none p-0" placeholder="Author" value={c.author} onChange={(e) => updateCitation(c.id, 'author', e.target.value)} />
                        <input className="w-1/2 bg-transparent border-none p-0" placeholder="Year" value={c.year} onChange={(e) => updateCitation(c.id, 'year', e.target.value)} />
                      </div>
                      
                      {/* Contextual Sourcing Trigger */}
                      <div className="flex justify-between items-center mt-1 border-t border-[var(--border-color)] pt-1">
                         <a href={c.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline truncate block w-2/3">{c.url}</a>
                         <button 
                           onClick={() => openContextModal(c)} 
                           className="text-[9px] font-bold text-[var(--accent)] hover:underline flex items-center"
                         >
                           <span className="material-icons text-[10px] mr-1">push_pin</span> Contextualize
                         </button>
                      </div>
                   </div>
                 );
               })}
             </div>
             
             <div className="flex justify-between items-center mb-2">
                <button onClick={addCitation} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-300 w-full">+ Manual Entry</button>
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
        <div className="w-full md:w-2/3 paper-panel rounded-sm overflow-hidden bg-white border border-[var(--border-color)] shadow-inner relative flex flex-col">
           {/* Editor Toolbar */}
           <div className="h-10 bg-[var(--surface-color)] border-b border-[var(--border-color)] flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`text-xs font-bold px-3 py-1 rounded flex items-center gap-1 ${isEditing ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'}`}
                >
                  <span className="material-icons text-sm">{isEditing ? 'visibility' : 'edit'}</span>
                  {isEditing ? 'View Mode' : 'Edit Mode'}
                </button>
                {isEditing && (
                  <button onClick={insertLatex} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-[var(--text-secondary)]" title="Insert Equation">
                    $$x^2$$
                  </button>
                )}
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">{isEditing ? 'Raw Editor' : 'Rendered View'}</span>
           </div>

           <div className="flex-1 overflow-y-auto relative p-10">
              {activeDraft.output || isEditing ? (
                 isEditing ? (
                   <textarea 
                     className="w-full h-full bg-transparent resize-none outline-none font-mono text-sm leading-relaxed"
                     value={activeDraft.output}
                     onChange={(e) => handleManualEdit(e.target.value)}
                     placeholder="Start typing your document here..."
                   />
                 ) : (
                   <article className="prose prose-slate max-w-none">
                     <div className="whitespace-pre-wrap font-serif text-base text-[var(--text-primary)] font-normal leading-relaxed">
                       {renderContent(activeDraft.output)}
                     </div>
                   </article>
                 )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50">
                  <span className="material-icons text-6xl mb-4">article</span>
                  <p className="italic">Document Preview will appear here.</p>
                  <p className="text-xs mt-2">Generate content or switch to Edit Mode to write.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Contextual Sourcing Modal */}
      {showContextModal && selectedCitationForContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white max-w-lg w-full rounded-lg shadow-2xl p-6 relative animate-fade-in-up flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-lg font-serif font-bold text-[var(--text-primary)] flex items-center gap-2">
                       <span className="material-icons text-[var(--accent)]">push_pin</span> Contextual Sourcing
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">Pin source <strong>{selectedCitationForContext.title.substring(0, 30)}...</strong> to a paragraph.</p>
                 </div>
                 <button onClick={() => setShowContextModal(false)} className="text-gray-400 hover:text-gray-600"><span className="material-icons text-sm">close</span></button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                 <div className="mb-4">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2 block">Target Paragraph</label>
                    <textarea 
                       className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-sm text-[var(--text-primary)] outline-none resize-none h-32"
                       placeholder="Paste the paragraph you want to strengthen here..."
                       value={targetParagraph}
                       onChange={(e) => setTargetParagraph(e.target.value)}
                    ></textarea>
                 </div>

                 {contextQuotes.length > 0 && (
                    <div className="space-y-3 mb-4">
                       <label className="text-[10px] font-bold text-green-600 uppercase block">Suggested Quotes & Paraphrases</label>
                       {contextQuotes.map((q, i) => (
                          <div key={i} className="bg-green-50 p-3 rounded border border-green-100 flex gap-2 group">
                             <p className="text-sm text-green-900 flex-1 italic">"{q}"</p>
                             <button onClick={() => copyToClipboard(q)} className="text-green-700 hover:text-green-900 opacity-0 group-hover:opacity-100 transition-opacity" title="Copy">
                                <span className="material-icons text-sm">content_copy</span>
                             </button>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-end">
                 <button 
                    onClick={handleAnalyzeContext}
                    disabled={contextLoading || !targetParagraph}
                    className="bg-[var(--accent)] text-white px-4 py-2 rounded font-bold text-sm shadow hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                 >
                    {contextLoading ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">manage_search</span>}
                    {contextLoading ? 'Analyzing Source...' : 'Find Supporting Quotes'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
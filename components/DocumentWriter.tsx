import React, { useState, useEffect, useRef } from 'react';
import { generateSectionContent, searchYouTubeVideos, downloadFile, generateImageCaption, enrichCitationFromUrl, generateRapidPresentation, saveToGoogleDrive } from '../services/geminiService';
import { YouTubeVideo, Citation, Collaborator, AppendixItem, UserSearchResult, SlideDeck } from '../types';
import { CollaborationModal } from './CollaborationModal';

interface DocSection {
  id: string;
  title: string;
  type: 'PRELIM' | 'CHAPTER' | 'APPENDIX';
  content: string;
}

interface DocDraft {
  id: string;
  level: string;
  course: string;
  topic: string;
  details: string;
  sections: DocSection[];
  videos: YouTubeVideo[];
  citations: Citation[];
  history: string[]; 
  historyIndex: number;
  uploadedImages: string[];
  appendix: AppendixItem[];
  slides?: SlideDeck;
}

interface DocumentWriterProps {
  userId: string;
}

export const DocumentWriter: React.FC<DocumentWriterProps> = ({ userId }) => {
  const STORAGE_KEY_DRAFTS = `jackometer_docs_${userId}_drafts`;
  const STORAGE_KEY_ACTIVE = `jackometer_docs_${userId}_active`;

  // DEFAULT DOCUMENT STRUCTURE
  const createDefaultSections = (): DocSection[] => [
    { id: 'prelim_1', title: 'Title Page', type: 'PRELIM', content: '' },
    { id: 'prelim_2', title: 'Abstract', type: 'PRELIM', content: '' },
    { id: 'prelim_3', title: 'Table of Contents', type: 'PRELIM', content: 'To be generated automatically.' },
    { id: 'ch_1', title: 'Chapter 1: Introduction', type: 'CHAPTER', content: '' },
    { id: 'ch_2', title: 'Chapter 2: Literature Review', type: 'CHAPTER', content: '' },
    { id: 'ch_3', title: 'Chapter 3: Methodology', type: 'CHAPTER', content: '' },
  ];

  // Initialize Drafts from LocalStorage
  const [drafts, setDrafts] = useState<DocDraft[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((d: any) => {
             const sections = (!d.sections || d.sections.length === 0) ? createDefaultSections() : d.sections;
             const history = (d.history && d.history.length > 0) ? d.history : [JSON.stringify(sections)];
             return { 
               ...d, 
               sections,
               history,
               historyIndex: d.historyIndex !== undefined ? d.historyIndex : 0
             };
          });
        }
      }
    } catch (e) {
      console.error("Failed to load drafts from storage", e);
    }
    const defaultSections = createDefaultSections();
    return [{ 
      id: '1', 
      level: 'Undergraduate', 
      course: '', 
      topic: '', 
      details: '', 
      sections: defaultSections,
      videos: [], 
      citations: [], 
      history: [JSON.stringify(defaultSections)], 
      historyIndex: 0, 
      uploadedImages: [], 
      appendix: [] 
    }];
  });

  // Initialize Active ID
  const [activeId, setActiveId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) return saved;
    } catch (e) {}
    return '1';
  });

  // Persist drafts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(drafts));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  }, [drafts, STORAGE_KEY_DRAFTS]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE, activeId);
  }, [activeId, STORAGE_KEY_ACTIVE]);

  const activeDraft = drafts.find(d => d.id === activeId) || drafts[0];
  
  // Section Management State
  const [activeSectionId, setActiveSectionId] = useState<string>(activeDraft.sections[0]?.id || 'prelim_1');
  const [isOutlineOpen, setIsOutlineOpen] = useState(true);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // View Mode
  const [viewMode, setViewMode] = useState<'WRITER' | 'SLIDES'>('WRITER');

  // Sync active section when draft changes
  useEffect(() => {
    if (!activeDraft.sections.find(s => s.id === activeSectionId)) {
        setActiveSectionId(activeDraft.sections[0]?.id || '');
    }
  }, [activeDraft.id]);

  const activeSection = activeDraft.sections.find(s => s.id === activeSectionId) || activeDraft.sections[0];

  const [loading, setLoading] = useState(false);
  const [driveSaving, setDriveSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Archive & Search State
  const [showArchiveSearch, setShowArchiveSearch] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState('');
  const [archiveResults, setArchiveResults] = useState<DocDraft[]>([]);

  // Collaboration State
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: 'me', name: 'You', color: 'bg-blue-600', status: 'ONLINE' }
  ]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // --- HISTORY MANAGEMENT ---
  const saveToHistory = (newSections: DocSection[]) => {
    const currentDraft = activeDraft;
    const snapshot = JSON.stringify(newSections);
    
    if (currentDraft.history[currentDraft.historyIndex] === snapshot) return;

    const newHistory = currentDraft.history.slice(0, currentDraft.historyIndex + 1);
    newHistory.push(snapshot);

    if (newHistory.length > 30) {
      newHistory.shift();
    }

    setDrafts(drafts.map(d => 
      d.id === activeId ? { 
        ...d, 
        sections: newSections, 
        history: newHistory, 
        historyIndex: newHistory.length - 1 
      } : d
    ));
  };

  const handleUndo = () => {
    const d = activeDraft;
    if (d.historyIndex > 0) {
      const newIndex = d.historyIndex - 1;
      const restoredSections = JSON.parse(d.history[newIndex]);
      
      setDrafts(drafts.map(dr => 
        dr.id === activeId ? { ...dr, sections: restoredSections, historyIndex: newIndex } : dr
      ));

      if (!restoredSections.find((s: DocSection) => s.id === activeSectionId)) {
        setActiveSectionId(restoredSections[0]?.id || '');
      }
    }
  };

  const handleRedo = () => {
    const d = activeDraft;
    if (d.historyIndex < d.history.length - 1) {
      const newIndex = d.historyIndex + 1;
      const restoredSections = JSON.parse(d.history[newIndex]);
      setDrafts(drafts.map(dr => 
        dr.id === activeId ? { ...dr, sections: restoredSections, historyIndex: newIndex } : dr
      ));
    }
  };

  const updateDraft = (field: keyof DocDraft, value: any) => {
    setDrafts(drafts.map(d => d.id === activeId ? { ...d, [field]: value } : d));
  };

  // --- SECTION LOGIC ---
  const handleSectionContentEdit = (val: string) => {
    const updatedSections = activeDraft.sections.map(s => 
      s.id === activeSectionId ? { ...s, content: val } : s
    );
    updateDraft('sections', updatedSections);
  };

  const addSection = (type: 'PRELIM' | 'CHAPTER') => {
    if(!newSectionTitle.trim()) return;
    const newId = `sec_${Date.now()}`;
    const newSection: DocSection = {
      id: newId,
      title: newSectionTitle,
      type,
      content: ''
    };
    const newSections = [...activeDraft.sections, newSection];
    saveToHistory(newSections);
    setNewSectionTitle('');
    setActiveSectionId(newId);
  };

  const deleteSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeDraft.sections.length <= 1) {
      alert("Document must have at least one section.");
      return;
    }
    const filtered = activeDraft.sections.filter(s => s.id !== id);
    saveToHistory(filtered);
    
    // If we deleted the active section, switch to another one
    if(activeSectionId === id) {
      setActiveSectionId(filtered[0].id);
    }
  };

  // --- GENERATION LOGIC ---
  const handleGenerate = async () => {
    if (!activeDraft.topic || !activeDraft.course) {
      alert("Please enter a Topic and Course.");
      return;
    }
    
    setLoading(true);
    
    try {
      const appendixStr = activeDraft.appendix.map((a, i) => `Figure ${i+1}: ${a.caption}`).join('\n');
      const currentIndex = activeDraft.sections.findIndex(s => s.id === activeSectionId);
      const previousText = activeDraft.sections
        .slice(0, currentIndex)
        .map(s => `--- ${s.title} ---\n${s.content}`)
        .join('\n');

      const docResult = await generateSectionContent(
        activeSection.title,
        activeSection.type,
        activeDraft.topic,
        activeDraft.course,
        activeDraft.details,
        previousText,
        appendixStr
      );
      
      const updatedSections = activeDraft.sections.map(s => 
        s.id === activeSectionId ? { ...s, content: docResult.content } : s
      );
      saveToHistory(updatedSections);
      
      const mergedCitations = [...activeDraft.citations];
      docResult.citations.forEach(cit => {
        if (!mergedCitations.some(existing => existing.url === cit.url)) {
          mergedCitations.push(cit);
        }
      });
      updateDraft('citations', mergedCitations);

      setLoading(false);

      searchYouTubeVideos(activeDraft.topic).then(videos => {
        setDrafts(current => current.map(d => d.id === activeId ? { ...d, videos } : d));
      }).catch(err => {});
      
      setTimeout(() => {
        if (editorRef.current) {
           editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
      
    } catch (e) {
      console.error(e);
      alert("Generation failed. Please check your connection.");
      setLoading(false);
    }
  };

  const handleGenerateSlides = async () => {
     setLoading(true);
     try {
         const fullText = activeDraft.sections.map(s => `${s.title}\n${s.content}`).join('\n\n');
         const deck = await generateRapidPresentation(activeDraft.topic || "Research Project", fullText);
         updateDraft('slides', deck);
         setViewMode('SLIDES');
     } catch (e) {
         alert("Failed to generate slides.");
     }
     setLoading(false);
  };

  const handleImportDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
           const text = ev.target?.result as string;
           handleSectionContentEdit(text);
        };
        reader.readAsText(file);
     }
  };

  // --- HANDLERS ---
  const handleAddCollaborator = (user: UserSearchResult) => {
    const newCollab: Collaborator = {
      id: user.id, name: user.name, email: user.email, color: 'bg-green-500', status: 'ONLINE'
    };
    setCollaborators([...collaborators, newCollab]);
    setIsInviteModalOpen(false);
  };

  const newDraft = () => {
    const id = Date.now().toString();
    const defaultSecs = createDefaultSections();
    const newDoc: DocDraft = { 
      id, level: 'Undergraduate', course: '', topic: '', details: '', 
      sections: defaultSecs,
      videos: [], citations: [], 
      history: [JSON.stringify(defaultSecs)], 
      historyIndex: 0, 
      uploadedImages: [], appendix: []
    };
    setDrafts(prev => [...prev, newDoc]);
    setActiveId(id);
  };

  const deleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (drafts.length === 1) return;
    if (window.confirm("Delete this document?")) {
      const rem = drafts.filter(d => d.id !== id);
      setDrafts(rem);
      if (activeId === id) setActiveId(rem[0].id);
    }
  };

  const handleExport = (format: 'PDF' | 'DOCX' | 'RTF' | 'TXT') => {
    const fullContent = activeDraft.sections.map(s => `${s.title.toUpperCase()}\n\n${s.content}\n\n`).join('***\n\n');
    const filename = `${activeDraft.topic || 'Document'}.${format.toLowerCase()}`;
    let mime = 'text/plain';
    if (format === 'DOCX') mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (format === 'PDF') mime = 'application/pdf'; 
    downloadFile(fullContent, filename, mime);
  };

  const handleDriveSave = async () => {
    if (!activeDraft.topic) {
        alert("Cannot save: Document title missing.");
        return;
    }
    setDriveSaving(true);
    const fullContent = activeDraft.sections.map(s => `${s.title.toUpperCase()}\n\n${s.content}\n\n`).join('***\n\n');
    const filename = `${activeDraft.topic || 'Document'}.docx`;
    await saveToGoogleDrive(filename, fullContent, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    setDriveSaving(false);
    alert("Document saved to Google Drive!");
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{match[1]}</a>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col relative">
      <CollaborationModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} onAdd={handleAddCollaborator} existingIds={collaborators.map(c => c.id)} />

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-[var(--border-color)] pb-2 flex-shrink-0 gap-4">
         {/* Draft Tabs */}
         <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar whitespace-nowrap">
            {drafts.map(d => (
              <div key={d.id} onClick={() => setActiveId(d.id)} className={`px-4 py-2 cursor-pointer text-sm font-medium border-b-2 flex items-center transition-colors shrink-0 ${activeId === d.id ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-color)] rounded-t' : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-color)]'}`}>
                <span className="mr-2 max-w-[100px] truncate">{d.topic || 'Untitled Doc'}</span>
                <button onClick={(e) => deleteDraft(d.id, e)} className="hover:bg-red-100 hover:text-red-600 rounded-full p-1"><span className="material-icons text-[14px]">delete</span></button>
              </div>
            ))}
            <button onClick={newDraft} className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] bg-gray-50 rounded-full shadow-sm ml-2"><span className="material-icons text-xl">add</span></button>
         </div>

         {/* Toolbar Right: Undo/Redo, Collab, Export */}
         <div className="flex items-center gap-4 w-full md:w-auto justify-end flex-wrap">
             
             {/* View Toggle */}
             <div className="flex bg-[var(--bg-color)] rounded p-1 border border-[var(--border-color)]">
               <button onClick={() => setViewMode('WRITER')} className={`px-3 py-1 text-xs font-bold rounded ${viewMode === 'WRITER' ? 'bg-white shadow text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>Writer</button>
               <button onClick={() => setViewMode('SLIDES')} className={`px-3 py-1 text-xs font-bold rounded ${viewMode === 'SLIDES' ? 'bg-white shadow text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>Defense</button>
             </div>

             {/* Collaborators */}
             <div className="flex items-center -space-x-2">
                 {collaborators.map(c => (
                    <div key={c.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs ${c.color} relative group`}>
                       {c.name[0]}
                       <div className="absolute top-full mt-1 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">{c.name}</div>
                    </div>
                 ))}
                 <button onClick={() => setIsInviteModalOpen(true)} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center hover:bg-gray-200 z-10"><span className="material-icons text-sm text-gray-500">person_add</span></button>
             </div>

            <div className="relative group z-20">
              <button className="flex items-center gap-1 bg-[var(--accent)] text-white px-3 py-1.5 rounded text-sm font-bold shadow-sm">Export <span className="material-icons text-sm">expand_more</span></button>
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[var(--border-color)] shadow-xl rounded-lg hidden group-hover:block z-50">
                 <button onClick={() => handleExport('PDF')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">PDF Document (.pdf)</button>
                 <button onClick={() => handleExport('DOCX')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">Word Document (.docx)</button>
                 <button onClick={() => handleExport('TXT')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">Plain Text (.txt)</button>
                 <div className="border-t border-gray-100 my-1"></div>
                 <button onClick={handleDriveSave} disabled={driveSaving} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium flex items-center gap-2">
                    <span className="material-icons text-sm text-green-600">add_to_drive</span> 
                    {driveSaving ? 'Saving...' : 'Save to Google Drive'}
                 </button>
              </div>
            </div>
         </div>
      </div>

      {viewMode === 'WRITER' ? (
        <div className="flex flex-col md:flex-row gap-6 flex-1 h-full min-h-0 md:overflow-hidden pb-20 md:pb-0">
          
          {/* LEFT COLUMN: Controls & Outline */}
          <div className="w-full md:w-1/3 flex flex-col gap-4 md:overflow-hidden h-full">
             
             {/* Document Details Card */}
             <div className="paper-panel p-4 rounded-sm flex-shrink-0">
                <h3 className="font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2"><span className="material-icons text-sm">edit_note</span> Context</h3>
                <div className="space-y-2">
                  <input value={activeDraft.course} onChange={(e) => updateDraft('course', e.target.value)} className="w-full text-xs" placeholder="Course (e.g. Microbiology)" />
                  <input value={activeDraft.topic} onChange={(e) => updateDraft('topic', e.target.value)} className="w-full text-xs" placeholder="Research Topic" />
                  <textarea value={activeDraft.details} onChange={(e) => updateDraft('details', e.target.value)} className="w-full h-16 text-xs resize-none" placeholder="Specific Details/Instructions..."></textarea>
                  <button onClick={handleGenerateSlides} className="w-full bg-[var(--primary)] text-white text-xs font-bold py-2 rounded mt-2 hover:bg-blue-700">Generate Defense Slides</button>
                </div>
             </div>
  
             {/* Outline / Section Navigator */}
             <div className="paper-panel p-0 rounded-sm flex-1 flex flex-col overflow-hidden border-l-4 border-[var(--primary)]">
                <div className="p-3 border-b border-[var(--border-color)] bg-[var(--surface-color)] flex justify-between items-center">
                   <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-sm"><span className="material-icons text-sm">format_list_numbered</span> Outline</h3>
                   <button onClick={() => setIsOutlineOpen(!isOutlineOpen)} className="text-[var(--text-secondary)] md:hidden"><span className="material-icons">{isOutlineOpen ? 'expand_less' : 'expand_more'}</span></button>
                </div>
                
                <div className={`flex-1 overflow-y-auto p-2 space-y-1 ${!isOutlineOpen ? 'hidden md:block' : ''}`}>
                   {activeDraft.sections.map((section) => (
                      <div 
                        key={section.id} 
                        onClick={() => setActiveSectionId(section.id)}
                        className={`p-2 rounded text-xs cursor-pointer flex justify-between items-center group transition-colors ${activeSectionId === section.id ? 'bg-[var(--primary)] text-white font-bold' : 'hover:bg-gray-100 text-[var(--text-secondary)]'}`}
                      >
                         <div className="flex items-center gap-2 overflow-hidden">
                            <span className="material-icons text-[10px] opacity-70">{section.type === 'PRELIM' ? 'article' : 'book'}</span>
                            <span className="truncate">{section.title}</span>
                         </div>
                         <button 
                           onClick={(e) => deleteSection(section.id, e)} 
                           className={`hover:bg-red-500 hover:text-white rounded p-0.5 ${activeSectionId === section.id ? 'text-white opacity-100' : 'text-red-400 opacity-0 group-hover:opacity-100'}`}
                           title="Delete Section"
                         >
                           <span className="material-icons text-[12px]">close</span>
                         </button>
                      </div>
                   ))}
                </div>
  
                <div className="p-2 border-t border-[var(--border-color)] bg-gray-50">
                   <input 
                     className="w-full mb-2 text-xs p-1 border rounded" 
                     placeholder="New Section Title..." 
                     value={newSectionTitle}
                     onChange={(e) => setNewSectionTitle(e.target.value)}
                   />
                   <div className="flex gap-1">
                      <button onClick={() => addSection('PRELIM')} className="flex-1 bg-white border border-gray-300 text-[10px] py-1 rounded hover:bg-gray-50 font-bold">Add Page</button>
                      <button onClick={() => addSection('CHAPTER')} className="flex-1 bg-[var(--accent)] text-white text-[10px] py-1 rounded hover:opacity-90 font-bold">Add Chapter</button>
                   </div>
                </div>
             </div>
          </div>
  
          {/* RIGHT COLUMN: Editor Area */}
          <div ref={editorRef} className="w-full md:w-2/3 paper-panel rounded-sm overflow-hidden bg-white border border-[var(--border-color)] shadow-inner relative flex flex-col md:h-full min-h-[500px]">
             {/* Editor Toolbar */}
             <div className="h-12 bg-[var(--surface-color)] border-b border-[var(--border-color)] flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="material-icons text-[var(--accent)]">edit</span>
                  <span className="font-serif font-bold text-[var(--text-primary)] truncate max-w-[150px] md:max-w-none">{activeSection.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2 py-1 rounded cursor-pointer flex items-center gap-1">
                     <span className="material-icons text-xs">upload</span> Import
                     <input type="file" accept=".txt,.md,.json" className="hidden" onChange={handleImportDocument} />
                  </label>
                  <button onClick={() => setIsEditing(!isEditing)} className={`text-xs font-bold px-3 py-1 rounded flex items-center gap-1 ${isEditing ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'}`}>
                    <span className="material-icons text-sm">{isEditing ? 'visibility' : 'edit'}</span>
                    <span className="hidden sm:inline">{isEditing ? 'View Mode' : 'Edit Mode'}</span>
                  </button>
                  <button onClick={handleGenerate} disabled={loading} className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1 shadow-sm">
                     {loading ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">auto_awesome</span>}
                     <span className="hidden sm:inline">Write Section</span>
                  </button>
                </div>
             </div>
  
             <div className="flex-1 overflow-y-auto relative p-6 md:p-10">
                {loading && (
                   <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm">
                      <div className="text-center">
                         <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--accent)] mx-auto mb-2"></div>
                         <p className="text-xs text-[var(--text-secondary)] font-serif italic">Consulting academic repositories & writing...</p>
                      </div>
                   </div>
                )}
                
                {activeSection.content || isEditing ? (
                   isEditing ? (
                     <textarea 
                       className="w-full h-full bg-transparent resize-none outline-none font-mono text-sm leading-relaxed"
                       value={activeSection.content}
                       onChange={(e) => handleSectionContentEdit(e.target.value)}
                       placeholder="Start typing or click 'Write Section'..."
                     />
                   ) : (
                     <article className="prose prose-slate max-w-none pb-20">
                       <div className="whitespace-pre-wrap font-serif text-base text-[var(--text-primary)] font-normal leading-relaxed">
                         {renderContent(activeSection.content)}
                       </div>
                     </article>
                   )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50">
                    <span className="material-icons text-6xl mb-4">library_books</span>
                    <p className="italic">Section is empty.</p>
                    <p className="text-xs mt-2">Click <strong className="text-[var(--accent)]">Write Section</strong> to generate content using AI.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      ) : (
        /* SLIDES VIEW */
        <div className="flex-1 bg-slate-200/50 rounded-lg border-2 border-dashed border-slate-300 p-4 relative overflow-hidden">
           {!activeDraft.slides ? (
             <div className="absolute inset-0 flex items-center justify-center text-slate-400">
               <div className="text-center">
                  <span className="material-icons text-5xl mb-2">slideshow</span>
                  <p>No project defense slides generated.</p>
                  <button onClick={handleGenerateSlides} className="mt-4 bg-[var(--accent)] text-white px-6 py-2 rounded font-bold">Generate Defense</button>
               </div>
             </div>
           ) : (
             <div className="w-full h-full overflow-x-auto snap-x snap-mandatory flex gap-8 p-4 items-center">
               {activeDraft.slides.slides.map((slide, idx) => (
                 <div key={idx} className="flex-shrink-0 w-[85vw] md:w-[800px] h-[50vh] md:h-[450px] bg-white text-slate-900 rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col relative snap-center border border-slate-200">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-slate-900 border-b-4 border-slate-800 pb-4 inline-block self-start z-10">{slide.header}</h2>
                    <ul className="flex-1 space-y-4 z-10 overflow-y-auto">{slide.content.map((point, i) => <li key={i} className="text-lg md:text-xl flex items-start"><span className="mr-3 text-slate-400 font-bold">•</span>{point}</li>)}</ul>
                    <div className="absolute bottom-2 right-4 text-xs text-slate-400 font-mono">Slide {idx + 1}</div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {/* Archive Search Modal */}
      {showArchiveSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white max-w-2xl w-full rounded-lg shadow-2xl p-6 flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                 <h3 className="text-lg font-bold">Search Archives</h3>
                 <button onClick={() => setShowArchiveSearch(false)}><span className="material-icons">close</span></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                 <p className="text-center text-gray-400 p-4">Archive search allows you to pull content from previous drafts.</p>
                 <div className="space-y-2">
                   {archiveResults.map(d => (
                     <div key={d.id} className="p-3 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => { setActiveId(d.id); setShowArchiveSearch(false); }}>
                       <div className="font-bold text-sm">{d.topic || 'Untitled'}</div>
                       <div className="text-xs text-gray-500">{d.course} • {d.sections.length} Sections</div>
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
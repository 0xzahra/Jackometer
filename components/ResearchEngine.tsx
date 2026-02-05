import React, { useState, useEffect, useRef } from 'react';
import { generateResearchTitles, generateDeepResearch } from '../services/geminiService';
import { ProjectTitle } from '../types';

interface ResearchEngineProps {
  userId?: string;
}

export const ResearchEngine: React.FC<ResearchEngineProps> = ({ userId }) => {
  const STORAGE_KEY = userId ? `jackometer_research_${userId}` : 'jackometer_research_local';

  // Load state from local storage
  const [mode, setMode] = useState<'FORGE' | 'WRITER'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).mode : 'FORGE';
    } catch { return 'FORGE'; }
  });

  const [topicInput, setTopicInput] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).topicInput : '';
    } catch { return ''; }
  });

  const [titles, setTitles] = useState<ProjectTitle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).titles : [];
    } catch { return []; }
  });

  const [selectedTitle, setSelectedTitle] = useState<ProjectTitle | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).selectedTitle : null;
    } catch { return null; }
  });

  const [generatedContent, setGeneratedContent] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).generatedContent : '';
    } catch { return ''; }
  });

  // Adaptive Structure State
  const [chapters, setChapters] = useState<string[]>(() => {
    try {
       const saved = localStorage.getItem(STORAGE_KEY);
       return saved && JSON.parse(saved).chapters ? JSON.parse(saved).chapters : ['Chapter One: Introduction', 'Chapter Two: Literature Review', 'Chapter Three: Methodology', 'Chapter Four: Analysis', 'Chapter Five: Conclusion'];
    } catch {
       return ['Chapter One: Introduction', 'Chapter Two: Literature Review', 'Chapter Three: Methodology', 'Chapter Four: Analysis', 'Chapter Five: Conclusion'];
    }
  });
  const [editingStructure, setEditingStructure] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  
  const resultRef = useRef<HTMLDivElement>(null);

  // Persist State
  useEffect(() => {
    const state = {
      mode,
      topicInput,
      titles,
      selectedTitle,
      generatedContent,
      chapters
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [mode, topicInput, titles, selectedTitle, generatedContent, chapters, STORAGE_KEY]);

  const [loading, setLoading] = useState(false);

  const handleForge = async () => {
    if (!topicInput) return;
    setLoading(true);
    try {
      const results = await generateResearchTitles(topicInput);
      setTitles(results);
    } catch (e) {
      console.error(e);
      alert("Failed to forge titles. Try again.");
    }
    setLoading(false);
  };

  const handleSelectTitle = (t: ProjectTitle) => {
    setSelectedTitle(t);
    setMode('WRITER');
  };

  const handleGenerateChapter = async (chapter: string) => {
    if (!selectedTitle) return;
    setLoading(true);
    try {
      const content = await generateDeepResearch(
        selectedTitle.title, 
        chapter, 
        selectedTitle.description
      );
      setGeneratedContent(prev => prev + `\n\n${chapter.toUpperCase()}\n\n` + content);
      
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 300);
      
    } catch (e) {
      alert("Failed to generate content.");
    }
    setLoading(false);
  };

  const addChapter = () => {
    if (newChapterName.trim()) {
      setChapters([...chapters, newChapterName]);
      setNewChapterName('');
    }
  };

  const removeChapter = (index: number) => {
    const newCh = [...chapters];
    newCh.splice(index, 1);
    setChapters(newCh);
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
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col">
      {mode === 'FORGE' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
           <div className="w-full max-w-2xl paper-panel p-6 md:p-10 rounded-sm relative overflow-hidden text-center">
             <div className="absolute top-0 left-0 w-full h-1 bg-slate-800"></div>
             <h2 className="text-3xl md:text-4xl font-serif font-bold text-[var(--text-primary)] mb-2">Topic Forge</h2>
             <p className="text-[var(--text-secondary)] mb-8 italic font-serif">"Enter a concept. We will build the thesis."</p>
             
             <div className="relative mb-8">
               <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. 'Sustainable Architecture'"
                className="w-full bg-[var(--bg-color)] border-b-2 border-[var(--border-color)] text-[var(--text-primary)] p-4 text-xl md:text-2xl text-center focus:outline-none focus:border-[var(--accent)] placeholder-[var(--text-secondary)] font-serif"
               />
             </div>

             <button
              onClick={handleForge}
              disabled={loading}
              className="w-full bg-[var(--accent)] text-white font-bold py-4 rounded transition-all disabled:opacity-50 flex items-center justify-center shadow-lg"
             >
               {loading ? (
                 <span className="animate-spin material-icons">refresh</span>
               ) : (
                 <>
                   <span className="material-icons mr-2">psychology</span>
                   INITIATE FORGE
                 </>
               )}
             </button>
           </div>

           {/* Results */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 w-full pb-10">
             {titles.map((t, idx) => (
               <div key={idx} className="paper-card p-6 rounded-sm cursor-pointer group hover:border-[var(--accent)]" onClick={() => handleSelectTitle(t)}>
                 <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 font-serif leading-tight group-hover:text-[var(--accent)]">{t.title}</h3>
                 <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-3 leading-relaxed">{t.description}</p>
                 <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-color)] p-2 rounded">
                   <strong>Requires:</strong> {t.requirements.join(', ')}
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {mode === 'WRITER' && selectedTitle && (
        <div className="flex flex-col flex-1 h-full min-h-0">
          <div className="paper-panel p-6 rounded-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-20 shadow-sm gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold font-serif text-[var(--text-primary)] truncate max-w-lg">{selectedTitle.title}</h2>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-1">Dissertation Builder Active</p>
            </div>
            <button className="text-xs border border-red-200 text-red-700 px-4 py-2 rounded hover:bg-red-50 transition-colors uppercase tracking-widest font-bold self-end md:self-auto" onClick={() => setMode('FORGE')}>
              Exit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 h-full min-h-0 md:overflow-hidden">
            {/* Outline Sidebar */}
            <div className="col-span-1 md:col-span-3 paper-panel rounded-sm overflow-hidden flex flex-col md:h-full max-h-[400px] md:max-h-none">
              <div className="bg-[var(--bg-color)] p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Table of Contents</h3>
                <button onClick={() => setEditingStructure(!editingStructure)} className="text-[var(--accent)] hover:underline text-[10px] font-bold">
                  {editingStructure ? 'DONE' : 'EDIT'}
                </button>
              </div>
              
              <div className="overflow-y-auto p-2 flex-1">
                {editingStructure ? (
                   <div className="space-y-2">
                      {chapters.map((ch, i) => (
                         <div key={i} className="flex gap-1 items-center">
                            <input disabled value={ch} className="text-xs w-full bg-gray-100 p-1 rounded" />
                            <button onClick={() => removeChapter(i)} className="text-red-500"><span className="material-icons text-sm">remove_circle</span></button>
                         </div>
                      ))}
                      <div className="flex gap-1 mt-2">
                         <input 
                           className="text-xs w-full p-1 border border-gray-300 rounded" 
                           placeholder="New Chapter Name..."
                           value={newChapterName}
                           onChange={(e) => setNewChapterName(e.target.value)}
                         />
                         <button onClick={addChapter} className="text-green-600"><span className="material-icons text-sm">add_circle</span></button>
                      </div>
                   </div>
                ) : (
                  chapters.map((chapter, i) => (
                    <button 
                      key={i}
                      onClick={() => handleGenerateChapter(chapter)}
                      className="w-full text-left p-3 mb-1 rounded hover:bg-[var(--bg-color)] text-xs font-serif text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-l-2 border-transparent hover:border-[var(--accent)]"
                    >
                      {chapter}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Editor Area */}
            <div ref={resultRef} className="col-span-1 md:col-span-9 paper-panel rounded-sm p-6 md:p-12 overflow-y-auto relative bg-white shadow-inner md:h-full min-h-[500px]">
               {loading && (
                 <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm">
                   <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
                      <p className="text-[var(--text-primary)] text-sm font-serif italic">Consulting Premium Repositories...</p>
                   </div>
                 </div>
               )}
               {generatedContent ? (
                 <article className="prose prose-slate max-w-none pb-20">
                   <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-[var(--text-primary)]">
                     {renderContent(generatedContent)}
                   </div>
                 </article>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
                   <span className="material-icons text-6xl mb-4">library_books</span>
                   <p className="font-serif text-xl italic text-center">Select a chapter to begin writing.</p>
                 </div>
               )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-4 pb-6">
             <button className="bg-white border border-[var(--border-color)] hover:bg-[var(--bg-color)] text-[var(--text-primary)] px-6 py-3 rounded-sm flex items-center text-sm font-bold shadow-sm">
               <span className="material-icons mr-2 text-sm">picture_as_pdf</span>
               PDF
             </button>
             <button className="bg-[var(--accent)] text-white px-8 py-3 rounded-sm flex items-center text-sm font-bold shadow-lg">
               <span className="material-icons mr-2 text-sm">save</span>
               Save to Vault
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
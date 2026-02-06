import React, { useState, useEffect, useRef } from 'react';
import { generateResearchTitles, generateDeepResearch, generateStructuredOutline, downloadFile } from '../services/geminiService';
import { ProjectTitle } from '../types';

interface ResearchEngineProps {
  userId?: string;
}

export const ResearchEngine: React.FC<ResearchEngineProps> = ({ userId }) => {
  const STORAGE_KEY = userId ? `jackometer_research_${userId}` : 'jackometer_research_local';

  // --- WORKFLOW STAGES ---
  // 1. FORGE: User enters topic, gets titles.
  // 2. OUTLINE: User reviews generated outline (strict structure).
  // 3. WRITER: User generates chapters.
  type WorkflowStage = 'FORGE' | 'OUTLINE' | 'WRITER';

  const [stage, setStage] = useState<WorkflowStage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).stage || 'FORGE' : 'FORGE';
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

  const [chapters, setChapters] = useState<string[]>(() => {
    try {
       const saved = localStorage.getItem(STORAGE_KEY);
       return saved ? JSON.parse(saved).chapters || [] : [];
    } catch { return []; }
  });

  // Stores content per chapter
  const [chapterContent, setChapterContent] = useState<Record<string, string>>(() => {
    try {
       const saved = localStorage.getItem(STORAGE_KEY);
       return saved ? JSON.parse(saved).chapterContent || {} : {};
    } catch { return {}; }
  });

  // Track currently active chapter for writing/viewing
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const resultRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // Persist State
  useEffect(() => {
    const state = {
      stage,
      topicInput,
      titles,
      selectedTitle,
      chapters,
      chapterContent,
      activeChapterIndex
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [stage, topicInput, titles, selectedTitle, chapters, chapterContent, activeChapterIndex, STORAGE_KEY]);

  // --- Step 1: Forge Titles ---
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

  const handleSelectTitle = async (t: ProjectTitle) => {
    setSelectedTitle(t);
    setLoading(true);
    try {
       // Generate the strict outline immediately upon selection
       const outline = await generateStructuredOutline(t.title);
       setChapters(outline);
       setStage('OUTLINE');
    } catch (e) {
       alert("Failed to generate outline.");
    }
    setLoading(false);
  };

  // --- Step 2: Approve Outline ---
  const handleApproveOutline = () => {
    setStage('WRITER');
    setActiveChapterIndex(0);
  };

  const handleUpdateChapterTitle = (index: number, newVal: string) => {
    const newCh = [...chapters];
    newCh[index] = newVal;
    setChapters(newCh);
  };

  const handleAddChapter = () => {
    setChapters([...chapters, "New Chapter"]);
  };

  const handleRemoveChapter = (index: number) => {
    const newCh = [...chapters];
    newCh.splice(index, 1);
    setChapters(newCh);
  };

  // --- Step 3: Writer ---
  const handleGenerateChapter = async (index: number) => {
    if (!selectedTitle || !chapters[index]) return;
    
    // Check if already generated
    if (chapterContent[chapters[index]]) {
      if (!window.confirm("This chapter already has content. Regenerate and overwrite?")) return;
    }

    setLoading(true);
    setActiveChapterIndex(index);

    // Build context from previous chapters for continuity
    let previousContext = `Project Title: ${selectedTitle.title}\nDescription: ${selectedTitle.description}\n\n`;
    for(let i=0; i<index; i++) {
        if(chapterContent[chapters[i]]) {
            previousContext += `--- PREVIOUS SECTION: ${chapters[i]} ---\n${chapterContent[chapters[i]].substring(0, 1000)}...\n\n`;
        }
    }

    try {
      const content = await generateDeepResearch(
        selectedTitle.title, 
        chapters[index], 
        previousContext
      );
      
      setChapterContent(prev => ({
          ...prev,
          [chapters[index]]: content
      }));
      
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
      
    } catch (e) {
      alert("Failed to generate content.");
    }
    setLoading(false);
  };

  const handleStitchPDF = () => {
      // Combine all chapters
      let fullDoc = `TITLE: ${selectedTitle?.title}\n\n`;
      chapters.forEach(ch => {
          if (chapterContent[ch]) {
              fullDoc += `\n\n################################################\n${ch.toUpperCase()}\n################################################\n\n${chapterContent[ch]}`;
          }
      });
      downloadFile(fullDoc, `${selectedTitle?.title || 'Thesis'}_Full.pdf`, 'application/pdf');
  };

  // Render Logic
  const renderContent = (text: string) => {
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline bg-blue-50 px-1 rounded mx-1">
            {match[1]}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col pb-10">
      
      {/* STAGE 1: FORGE */}
      {stage === 'FORGE' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
           <div className="w-full max-w-3xl paper-panel p-10 md:p-16 rounded-2xl relative overflow-hidden text-center shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
             <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">Research Forge</h2>
             <p className="text-[var(--text-secondary)] mb-10 text-lg">Enter a research concept. We will architect the thesis.</p>
             
             <div className="relative mb-8 max-w-xl mx-auto">
               <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. 'Impact of AI on Healthcare'"
                className="w-full bg-white/50 border border-gray-200 text-[var(--text-primary)] p-5 text-xl rounded-xl shadow-inner focus:ring-4 focus:ring-blue-100 transition-all text-center"
               />
             </div>

             <button
              onClick={handleForge}
              disabled={loading}
              className="btn-primary text-lg px-10 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
             >
               {loading ? (
                 <span className="flex items-center gap-2"><span className="material-icons animate-spin">refresh</span> Processing...</span>
               ) : (
                 <span className="flex items-center gap-2"><span className="material-icons">psychology</span> Initiate Forge</span>
               )}
             </button>
           </div>

           {/* Results */}
           {titles.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
               {titles.map((t, idx) => (
                 <div 
                    key={idx} 
                    className="paper-panel p-8 rounded-xl cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all group"
                    onClick={() => handleSelectTitle(t)}
                 >
                   <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 leading-snug group-hover:text-blue-600 transition-colors">{t.title}</h3>
                   <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">{t.description}</p>
                   <div className="text-xs font-bold text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                     REQUIRES: {t.requirements.slice(0, 3).join(', ')}
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {/* STAGE 2: OUTLINE APPROVAL */}
      {stage === 'OUTLINE' && selectedTitle && (
          <div className="max-w-4xl mx-auto w-full pt-10">
             <div className="paper-panel p-8 rounded-2xl mb-8 border-l-8 border-blue-500">
                <h2 className="text-2xl font-bold mb-2">Structure Approval</h2>
                <p className="text-gray-600">Review the generated outline for <strong>"{selectedTitle.title}"</strong>. This structure mimics a strict academic standard.</p>
             </div>

             <div className="paper-panel p-8 rounded-2xl">
                <div className="space-y-3 mb-8">
                   {chapters.map((ch, idx) => (
                      <div key={idx} className="flex items-center gap-3 group">
                         <span className="text-gray-400 font-mono text-xs w-6 text-right">{idx + 1}.</span>
                         <input 
                           className="flex-1 p-3 bg-white/50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-blue-300 rounded transition-all font-medium"
                           value={ch} 
                           onChange={(e) => handleUpdateChapterTitle(idx, e.target.value)}
                         />
                         <button onClick={() => handleRemoveChapter(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-icons">close</span>
                         </button>
                      </div>
                   ))}
                   <button onClick={handleAddChapter} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded inline-flex items-center gap-1 mt-2">
                      <span className="material-icons text-sm">add</span> Add Section
                   </button>
                </div>

                <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
                   <button onClick={() => setStage('FORGE')} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Back</button>
                   <button onClick={handleApproveOutline} className="btn-primary">Approve & Start Writing</button>
                </div>
             </div>
          </div>
      )}

      {/* STAGE 3: WRITER */}
      {stage === 'WRITER' && selectedTitle && (
        <div className="flex flex-col flex-1 h-full min-h-0 pt-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 px-2">
             <div>
                <h2 className="text-xl font-bold truncate max-w-xl">{selectedTitle.title}</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Thesis Builder Active</p>
             </div>
             <div className="flex gap-2">
                <button onClick={handleStitchPDF} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-black flex items-center gap-2">
                   <span className="material-icons text-sm">picture_as_pdf</span> Stitch PDF
                </button>
                <button onClick={() => setStage('FORGE')} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg font-bold text-sm">Exit</button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 h-full min-h-0">
             
             {/* Chapter Sidebar */}
             <div className="col-span-1 md:col-span-3 paper-panel flex flex-col overflow-hidden h-full">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Table of Contents</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                   {chapters.map((ch, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveChapterIndex(idx)}
                        className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all flex justify-between items-center ${activeChapterIndex === idx ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                         <span className="truncate">{ch}</span>
                         {chapterContent[ch] && <span className="material-icons text-green-500 text-[14px]">check_circle</span>}
                      </button>
                   ))}
                </div>
             </div>

             {/* Editor Area */}
             <div className="col-span-1 md:col-span-9 paper-panel flex flex-col h-full relative overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/40">
                   <h3 className="font-bold text-lg">{chapters[activeChapterIndex]}</h3>
                   <button 
                     onClick={() => handleGenerateChapter(activeChapterIndex)}
                     disabled={loading}
                     className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-green-700 flex items-center gap-2 transition-all"
                   >
                     {loading ? <span className="material-icons animate-spin text-sm">refresh</span> : <span className="material-icons text-sm">auto_awesome</span>}
                     {chapterContent[chapters[activeChapterIndex]] ? 'Regenerate' : 'Generate Chapter'}
                   </button>
                </div>
                
                <div ref={resultRef} className="flex-1 overflow-y-auto p-8 md:p-12 bg-white/30">
                   {loading && (
                      <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in">
                         <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                         <p className="text-gray-600 font-medium">Researching & Writing...</p>
                         <p className="text-xs text-gray-400 mt-2">Consulting strict academic sources</p>
                      </div>
                   )}

                   {chapterContent[chapters[activeChapterIndex]] ? (
                      <article className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600">
                         <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
                            {renderContent(chapterContent[chapters[activeChapterIndex]])}
                         </div>
                      </article>
                   ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                         <span className="material-icons text-6xl mb-4 opacity-20">history_edu</span>
                         <p className="text-lg font-medium opacity-50">Empty Chapter</p>
                         <p className="text-sm opacity-40">Click generate to write this section.</p>
                      </div>
                   )}
                </div>
             </div>

          </div>
        </div>
      )}
    </div>
  );
};
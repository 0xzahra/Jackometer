import React, { useState } from 'react';
import { gradeEssay, synthesizeCritique, solveAssignment } from '../services/geminiService';

export const AssignmentSuite: React.FC = () => {
  const [mode, setMode] = useState<'GRADER' | 'SYNTHESIZER' | 'SOLVER'>('GRADER');
  const [input, setInput] = useState('');
  const [instruction, setInstruction] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [handwritingMode, setHandwritingMode] = useState(false);

  const handleAction = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      if (mode === 'GRADER') {
        const res = await gradeEssay(input, instruction);
        setOutput(res);
      } else if (mode === 'SYNTHESIZER') {
        const res = await synthesizeCritique(input);
        setOutput(res);
      } else {
        const res = await solveAssignment(input);
        setOutput(res);
      }
    } catch (e) {
      alert("Operation failed.");
    }
    setLoading(false);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
            {mode === 'GRADER' ? 'The Tribunal (Grader)' : mode === 'SYNTHESIZER' ? 'Reviewer 2 (Synthesizer)' : 'Assignment Solver'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {mode === 'GRADER' ? 'Strict external examination & bias decoding.' : mode === 'SYNTHESIZER' ? 'Generate critical reviews from sources.' : 'Auto-write assignments with pre-judgment.'}
          </p>
        </div>
        <div className="flex bg-[var(--surface-color)] rounded-lg p-1 border border-[var(--border-color)]">
           <button 
             onClick={() => setMode('GRADER')}
             className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'GRADER' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'}`}
           >
             Grader
           </button>
           <button 
             onClick={() => setMode('SYNTHESIZER')}
             className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'SYNTHESIZER' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'}`}
           >
             Synthesizer
           </button>
           <button 
             onClick={() => setMode('SOLVER')}
             className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'SOLVER' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'}`}
           >
             Solver
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* Input Section */}
        <div className="paper-panel p-6 rounded-sm flex flex-col">
           <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">
             {mode === 'GRADER' ? 'Paste Your Essay / Draft' : mode === 'SYNTHESIZER' ? 'Paste Source Link or Abstract' : 'Paste Assignment Question'}
           </label>
           <textarea 
             className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded outline-none resize-none font-serif text-sm leading-relaxed"
             placeholder={mode === 'GRADER' ? "Paste your text here for brutal critique..." : mode === 'SYNTHESIZER' ? "e.g. https://doi.org/10.1038/s41586-023..." : "Paste the question here. We will write and judge it."}
             value={input}
             onChange={(e) => setInput(e.target.value)}
           ></textarea>

           {mode === 'GRADER' && (
             <div className="mt-4">
               <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Bias Decoder Instructions (Optional)</label>
               <input 
                 className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-sm"
                 placeholder="e.g. 'My supervisor loves Foucault' or 'Hates passive voice'"
                 value={instruction}
                 onChange={(e) => setInstruction(e.target.value)}
               />
             </div>
           )}

           <button 
             onClick={handleAction}
             disabled={loading || !input}
             className="w-full btn-primary mt-6 flex items-center justify-center"
           >
             {loading ? <span className="material-icons animate-spin mr-2">refresh</span> : <span className="material-icons mr-2">{mode === 'SOLVER' ? 'auto_fix_high' : mode === 'GRADER' ? 'gavel' : 'history_edu'}</span>}
             {mode === 'GRADER' ? 'Judge My Work' : mode === 'SYNTHESIZER' ? 'Synthesize Critique' : 'Write & Judge'}
           </button>
        </div>

        {/* Output Section */}
        <div className="paper-panel p-8 rounded-sm overflow-y-auto bg-white border border-[var(--border-color)] relative">
           <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Human Hand Protocol</span>
              <button 
                onClick={() => setHandwritingMode(!handwritingMode)}
                className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${handwritingMode ? 'bg-[var(--accent)]' : 'bg-gray-300'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${handwritingMode ? 'translate-x-5' : ''}`}></div>
              </button>
           </div>

           {output ? (
             <article className={`prose max-w-none mt-8 ${handwritingMode ? 'font-handwriting text-blue-800' : 'font-serif text-[var(--text-primary)]'}`}>
               <div className="whitespace-pre-wrap leading-relaxed text-base">
                 {renderContent(output)}
               </div>
             </article>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50">
               <span className="material-icons text-6xl mb-4">{mode === 'GRADER' ? 'rule' : mode === 'SYNTHESIZER' ? 'history_edu' : 'assignment_turned_in'}</span>
               <p className="italic font-serif text-lg">
                 {mode === 'GRADER' ? 'Verdict pending...' : mode === 'SYNTHESIZER' ? 'Critique pending...' : 'Solution pending...'}
               </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
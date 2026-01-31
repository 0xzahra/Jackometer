import React, { useState } from 'react';
import { gradeEssay, synthesizeCritique } from '../services/geminiService';

export const AssignmentSuite: React.FC = () => {
  const [mode, setMode] = useState<'GRADER' | 'SYNTHESIZER'>('GRADER');
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
      } else {
        const res = await synthesizeCritique(input);
        setOutput(res);
      }
    } catch (e) {
      alert("Operation failed.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
            {mode === 'GRADER' ? 'The Tribunal (Grader)' : 'Reviewer 2 (Synthesizer)'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {mode === 'GRADER' ? 'Strict external examination & bias decoding.' : 'Generate critical reviews from sources.'}
          </p>
        </div>
        <div className="flex bg-[var(--surface-color)] rounded-lg p-1 border border-[var(--border-color)]">
           <button 
             onClick={() => setMode('GRADER')}
             className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'GRADER' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'}`}
           >
             Grader Mode
           </button>
           <button 
             onClick={() => setMode('SYNTHESIZER')}
             className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'SYNTHESIZER' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'}`}
           >
             Synthesizer Mode
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* Input Section */}
        <div className="paper-panel p-6 rounded-sm flex flex-col">
           <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">
             {mode === 'GRADER' ? 'Paste Your Essay / Draft' : 'Paste Source Link or Abstract'}
           </label>
           <textarea 
             className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded outline-none resize-none font-serif text-sm leading-relaxed"
             placeholder={mode === 'GRADER' ? "Paste your text here for brutal critique..." : "e.g. https://doi.org/10.1038/s41586-023..."}
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
             {loading ? <span className="material-icons animate-spin mr-2">refresh</span> : <span className="material-icons mr-2">gavel</span>}
             {mode === 'GRADER' ? 'Judge My Work' : 'Synthesize Critique'}
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
                 {output}
               </div>
             </article>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50">
               <span className="material-icons text-6xl mb-4">{mode === 'GRADER' ? 'rule' : 'history_edu'}</span>
               <p className="italic font-serif text-lg">{mode === 'GRADER' ? 'Verdict pending...' : 'Critique pending...'}</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { gradeEssay, synthesizeCritique, solveAssignment, analyzeSupervisorStyle } from '../services/geminiService';

export const AssignmentSuite: React.FC = () => {
  const [mode, setMode] = useState<'GRADER' | 'SYNTHESIZER' | 'SOLVER'>('GRADER');
  const [input, setInput] = useState('');
  const [instruction, setInstruction] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [handwritingMode, setHandwritingMode] = useState(false);

  // Supervisor Bias State
  const [showBiasPanel, setShowBiasPanel] = useState(false);
  const [supervisorText, setSupervisorText] = useState('');
  const [biasProfile, setBiasProfile] = useState('');
  const [analyzingBias, setAnalyzingBias] = useState(false);
  
  // Custom Format State
  const [customFormat, setCustomFormat] = useState('');

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
        // SOLVER Mode
        const res = await solveAssignment(input, biasProfile, customFormat);
        setOutput(res);
      }
    } catch (e) {
      alert("Operation failed.");
    }
    setLoading(false);
  };

  const handleDecodeBias = async () => {
    if (!supervisorText.trim()) return;
    setAnalyzingBias(true);
    try {
      const profile = await analyzeSupervisorStyle(supervisorText);
      setBiasProfile(profile);
    } catch (e) {
      alert("Could not analyze text.");
    }
    setAnalyzingBias(false);
  };

  const handleSupervisorFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setSupervisorText(text.substring(0, 15000)); // Limit size
      };
      reader.readAsText(file);
    }
  };

  // Enhanced Render: Rich Link Tooltips
  const renderContent = (text: string) => {
    // Simple text renderer since markdown is disabled for assignment solver
    // But we still parse links [Title](URL)
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <div key={index} className="inline-block relative group z-10 align-baseline">
            <a href={match[2]} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] font-bold bg-blue-50 px-2 py-0.5 rounded mx-1 hover:underline cursor-pointer border border-blue-100 text-sm font-sans">
              {match[1]} <span className="material-icons text-[10px] inline-block align-middle">link</span>
            </a>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Column: Input */}
        <div className={`col-span-12 ${showBiasPanel ? 'lg:col-span-4' : 'lg:col-span-6'} paper-panel p-6 rounded-sm flex flex-col transition-all duration-300`}>
           <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">
             {mode === 'GRADER' ? 'Paste Your Essay / Draft' : mode === 'SYNTHESIZER' ? 'Paste Source Link or Abstract' : 'Paste Assignment Question'}
           </label>
           <textarea 
             className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded outline-none resize-none font-serif text-sm leading-relaxed mb-4"
             placeholder={mode === 'GRADER' ? "Paste your text here for brutal critique..." : mode === 'SYNTHESIZER' ? "e.g. https://doi.org/10.1038/s41586-023..." : "Paste the question here..."}
             value={input}
             onChange={(e) => setInput(e.target.value)}
           ></textarea>

           {/* Custom Format Input for Solver */}
           {mode === 'SOLVER' && (
             <div className="mb-4">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1 block">Custom Structure (Optional)</label>
                <input 
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-2 rounded text-xs"
                  placeholder="e.g. 500 words, 3 paragraphs, include real-world examples..."
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                />
             </div>
           )}

           <div className="flex gap-2">
              <button 
                 onClick={handleAction}
                 disabled={loading || !input}
                 className="flex-1 btn-primary flex items-center justify-center text-sm"
               >
                 {loading ? <span className="material-icons animate-spin mr-2">refresh</span> : <span className="material-icons mr-2">{mode === 'SOLVER' ? 'auto_fix_high' : mode === 'GRADER' ? 'gavel' : 'history_edu'}</span>}
                 {mode === 'GRADER' ? 'Judge' : mode === 'SYNTHESIZER' ? 'Synthesize' : 'Solve'}
               </button>
               
               {mode === 'SOLVER' && (
                 <button 
                   onClick={() => setShowBiasPanel(!showBiasPanel)}
                   className={`px-4 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-blue-50 flex items-center justify-center ${showBiasPanel ? 'bg-blue-50' : ''}`}
                   title="Supervisor Bias Decoder"
                 >
                   <span className="material-icons">psychology</span>
                 </button>
               )}
           </div>
        </div>

        {/* Middle Column: Supervisor Bias Decoder (Conditional) */}
        {showBiasPanel && mode === 'SOLVER' && (
          <div className="col-span-12 lg:col-span-4 paper-panel p-6 rounded-sm flex flex-col bg-slate-50 border-l-4 border-[var(--accent)] animate-fade-in-up">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                   <span className="material-icons text-[var(--accent)]">psychology</span> Supervisor Intelligence
                </h3>
                <button onClick={() => setShowBiasPanel(false)}><span className="material-icons text-xs text-gray-400">close</span></button>
             </div>
             
             <div className="bg-white p-4 rounded border border-[var(--border-color)] mb-4 flex-1 overflow-y-auto">
               {!biasProfile ? (
                 <div className="text-center text-gray-400 py-8">
                    <span className="material-icons text-4xl mb-2">upload_file</span>
                    <p className="text-xs">Upload past papers or paste text to decode supervisor's preferred style.</p>
                 </div>
               ) : (
                 <div>
                    <label className="text-[10px] font-bold text-green-600 uppercase mb-2 block">Detected Preferences</label>
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">{biasProfile}</p>
                 </div>
               )}
             </div>

             <div className="space-y-3">
               <textarea 
                  className="w-full bg-white border border-[var(--border-color)] p-2 rounded text-xs h-20 resize-none"
                  placeholder="Paste supervisor's past paper text here..."
                  value={supervisorText}
                  onChange={(e) => setSupervisorText(e.target.value)}
               ></textarea>
               <div className="flex gap-2">
                  <label className="flex-1 bg-white border border-[var(--border-color)] text-[var(--text-secondary)] py-2 rounded text-xs font-bold text-center cursor-pointer hover:bg-gray-50">
                     Upload File
                     <input type="file" className="hidden" accept=".txt,.md" onChange={handleSupervisorFileUpload} />
                  </label>
                  <button 
                     onClick={handleDecodeBias}
                     disabled={analyzingBias || !supervisorText}
                     className="flex-1 bg-[var(--text-primary)] text-white py-2 rounded text-xs font-bold"
                  >
                     {analyzingBias ? 'Decoding...' : 'Decode Bias'}
                  </button>
               </div>
             </div>
          </div>
        )}

        {/* Right Column: Output */}
        <div className={`col-span-12 ${showBiasPanel ? 'lg:col-span-4' : 'lg:col-span-6'} paper-panel p-8 rounded-sm overflow-y-auto bg-white border border-[var(--border-color)] relative`}>
           <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Human Hand</span>
              <button 
                onClick={() => setHandwritingMode(!handwritingMode)}
                className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${handwritingMode ? 'bg-[var(--accent)]' : 'bg-gray-300'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${handwritingMode ? 'translate-x-5' : ''}`}></div>
              </button>
           </div>

           {output ? (
             <div className={`mt-8 whitespace-pre-wrap leading-relaxed text-base ${handwritingMode ? 'font-handwriting text-blue-800' : 'font-serif text-[var(--text-primary)]'}`}>
               {renderContent(output)}
               
               {/* Plain Text indicator since user requested no markdown */}
               {mode === 'SOLVER' && !handwritingMode && (
                  <div className="mt-8 pt-4 border-t border-dashed border-gray-200 text-[10px] text-gray-400 font-sans">
                     Generated as plain text. Supervisor bias {biasProfile ? 'APPLIED' : 'NOT APPLIED'}.
                  </div>
               )}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50">
               <span className="material-icons text-6xl mb-4">assignment</span>
               <p className="italic font-serif text-lg">
                 Ready to write.
               </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
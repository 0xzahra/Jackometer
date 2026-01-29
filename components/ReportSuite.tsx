import React, { useState } from 'react';
import { generateTechnicalReport, generateLabReport } from '../services/geminiService';

interface ReportSuiteProps {
  type: 'TECHNICAL' | 'LAB';
}

export const ReportSuite: React.FC<ReportSuiteProps> = ({ type }) => {
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = type === 'TECHNICAL' 
        ? await generateTechnicalReport(topic, details)
        : await generateLabReport(topic, details);
      setReport(result);
    } catch (e) {
      alert("Report generation failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
       <div className="mb-6">
         <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
           {type === 'TECHNICAL' ? 'Technical Report Generator (SIWES)' : 'Laboratory Report Builder'}
         </h2>
         <p className="text-sm text-[var(--text-secondary)]">
           {type === 'TECHNICAL' ? 'For Industrial Training, Field Experience, and Technical Essays.' : 'For Experiments, Procedures, and Observations.'}
         </p>
       </div>

       <div className="paper-panel p-6 rounded-sm mb-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           <input 
             className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] outline-none"
             placeholder={type === 'TECHNICAL' ? "Topic / Establishment Name" : "Experiment Title"}
             value={topic}
             onChange={(e) => setTopic(e.target.value)}
           />
         </div>
         <textarea 
            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] outline-none h-32 resize-none mb-4"
            placeholder={type === 'TECHNICAL' ? "Describe your experience, departments visited, and tasks performed..." : "List apparatus, procedure steps, and raw observations..."}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
         ></textarea>
         <button 
           onClick={handleGenerate}
           disabled={loading}
           className="bg-[var(--accent)] text-white font-bold px-8 py-3 rounded shadow hover:opacity-90"
         >
           {loading ? 'Compiling Report...' : 'Generate Report'}
         </button>
       </div>

       {report && (
         <div className="paper-panel p-10 rounded-sm flex-1 overflow-y-auto bg-white">
           <div className="flex justify-end mb-4">
             <button className="text-xs font-bold border border-[var(--border-color)] px-3 py-1 rounded mr-2">Download PDF</button>
             <button className="text-xs font-bold border border-[var(--border-color)] px-3 py-1 rounded">Copy Text</button>
           </div>
           <article className="prose prose-slate max-w-none">
             <pre className="whitespace-pre-wrap font-serif text-base text-[var(--text-primary)] font-normal">
               {report}
             </pre>
           </article>
         </div>
       )}
    </div>
  );
};
import React, { useState } from 'react';
import { generateAcademicDocument, searchYouTubeVideos } from '../services/geminiService';
import { YouTubeVideo } from '../types';

export const DocumentWriter: React.FC = () => {
  const [level, setLevel] = useState('Undergraduate');
  const [course, setCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);

  const handleGenerate = async () => {
    if (!topic || !course) return;
    setLoading(true);
    try {
      const [docText, fetchedVideos] = await Promise.all([
        generateAcademicDocument(level, course, topic, details),
        searchYouTubeVideos(topic)
      ]);
      setOutput(docText);
      setVideos(fetchedVideos);
    } catch (e) {
      alert("Generation failed.");
    }
    setLoading(false);
  };

  // Function to render text with clickable links
  const renderContent = (text: string) => {
    // Basic markdown link parser [Text](URL)
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
    <div className="max-w-6xl mx-auto h-full flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 space-y-6 overflow-y-auto">
        <div className="paper-panel p-6 rounded-sm">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Document Details</h3>
          
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Academic Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] mb-4 outline-none">
            <option>Diploma</option>
            <option>Undergraduate (BSc, BA)</option>
            <option>Postgraduate (MSc)</option>
            <option>PhD</option>
          </select>

          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Course of Study</label>
          <input value={course} onChange={(e) => setCourse(e.target.value)} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] mb-4 outline-none" placeholder="e.g. Microbiology" />

          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Research Topic</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] mb-4 outline-none" placeholder="Enter topic..." />

          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Specific Details / Context</label>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] mb-4 outline-none h-32" placeholder="Any specific requirements?"></textarea>

          <button onClick={handleGenerate} disabled={loading} className="w-full bg-[var(--accent)] text-white py-3 rounded font-bold shadow hover:opacity-90">
            {loading ? 'Writing Document...' : 'Generate Document'}
          </button>
        </div>

        {videos.length > 0 && (
           <div className="paper-panel p-6 rounded-sm border-l-4 border-red-500">
             <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center">
               <span className="material-icons text-red-500 mr-2">smart_display</span>
               Related Videos
             </h3>
             <div className="space-y-4">
               {videos.map((v, i) => (
                 <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-[var(--bg-color)] rounded border border-[var(--border-color)] hover:bg-[var(--shadow-color)]">
                   <p className="font-bold text-sm text-[var(--text-primary)] mb-1">{v.title}</p>
                   <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{v.description}</p>
                 </a>
               ))}
             </div>
           </div>
        )}
      </div>

      <div className="w-full md:w-2/3 paper-panel p-10 rounded-sm overflow-y-auto bg-white border border-[var(--border-color)] shadow-inner">
         {output ? (
           <article className="prose prose-slate max-w-none">
             <div className="whitespace-pre-wrap font-serif text-base text-[var(--text-primary)] font-normal leading-relaxed">
               {renderContent(output)}
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
  );
};
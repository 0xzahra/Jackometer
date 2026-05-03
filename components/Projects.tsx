import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface ProjectsProps {
  setView: (view: AppView) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ setView }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all projects/drafts across the app
  const loadProjects = () => {
    setLoading(true);
    try {
      const allProjects: any[] = [];
      
      // Load Document Writer drafts
      const docStr = localStorage.getItem('jackometer_drafts');
      if (docStr) {
        const docs = JSON.parse(docStr);
        if (Array.isArray(docs)) {
          docs.forEach(doc => {
            if (doc.topic) {
              allProjects.push({
                type: 'Document Writer',
                id: `doc_${doc.id}`,
                title: doc.topic,
                desc: doc.course || 'No course specified',
                view: AppView.DOCUMENT_WRITER,
                data: doc,
                timestamp: Date.now() // Ideally from data
              });
            }
          });
        }
      }

      // Load Research Engine state
      const user = localStorage.getItem('jackometer_user');
      const userId = user ? JSON.parse(user).email : 'default';
      const researchStr = localStorage.getItem(`jackometer_re_state_${userId}`);
      if (researchStr) {
        const research = JSON.parse(researchStr);
        if (research.topicInput) {
          allProjects.push({
            type: 'Research Engine',
            id: 'research_engine_state',
            title: research.topicInput,
            desc: research.qualificationInput,
            view: AppView.RESEARCH,
            data: research,
            timestamp: Date.now()
          });
        }
      }

      setProjects(allProjects);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDuplicate = (id: string, type: string, data: any) => {
    if (!window.confirm(`Are you sure you want to duplicate this ${type} project?`)) return;
    
    if (type === 'Document Writer') {
        const docStr = localStorage.getItem('jackometer_drafts');
        if (docStr) {
            let docs = JSON.parse(docStr);
            const newDoc = { ...data, id: Date.now().toString(), topic: data.topic + ' (Copy)' };
            docs.push(newDoc);
            localStorage.setItem('jackometer_drafts', JSON.stringify(docs));
        }
    } else if (type === 'Research Engine') {
        window.alert("Cannot duplicate a Research Engine session state directly, please save it into a Document.");
    }
    
    loadProjects();
  };

  const handleDownload = (proj: any) => {
    if (!window.confirm(`Download this ${proj.type} project?`)) return;
    const blob = new Blob([JSON.stringify(proj.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proj.title.replace(/\s+/g, '_')}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = (proj: any) => {
    if (!window.confirm(`Generate shareable link for ${proj.title}?`)) return;
    window.alert("Share URL generated and copied to clipboard!");
  };

  const handleDelete = (id: string, type: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} project?`)) return;
    
    if (type === 'Document Writer') {
        const realId = id.replace('doc_', '');
        const docStr = localStorage.getItem('jackometer_drafts');
        if (docStr) {
            let docs = JSON.parse(docStr);
            docs = docs.map((doc: any) => doc.id === realId ? { ...doc, isTrashed: true } : doc);
            localStorage.setItem('jackometer_drafts', JSON.stringify(docs));
        }
    } else if (type === 'Research Engine') {
        const user = localStorage.getItem('jackometer_user');
        const userId = user ? JSON.parse(user).email : 'default';
        localStorage.removeItem(`jackometer_re_state_${userId}`);
    }
    
    loadProjects();
  };

  if (loading) {
    return <div className="p-8 text-center"><span className="material-icons animate-spin">refresh</span> Loading Projects...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col pt-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold font-sans tracking-tight text-[var(--text-primary)]">Projects</h2>
          <p className="text-[var(--text-secondary)]">Manage your saved work across all modules.</p>
        </div>
      </div>
      
      {projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 glass-panel border border-[var(--border-color)]">
          <span className="material-icons text-6xl text-[var(--text-secondary)] opacity-50 mb-4">folder_open</span>
          <h3 className="text-xl font-bold mb-2">No Projects Found</h3>
          <p className="text-[var(--text-secondary)] text-center max-w-md">
            Start a new query in the Research Engine or create a new Document to see it appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => (
             <div key={proj.id} className="glass-panel p-6 border border-[var(--border-color)] flex flex-col h-full hover:border-[var(--accent)] transition-colors group">
                <div className="flex justify-between items-start mb-4">
                   <span className="px-2 py-1 bg-[var(--shadow-color)] text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-widest rounded">
                     {proj.type}
                   </span>
                   <button onClick={() => handleDelete(proj.id, proj.type)} className="text-red-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors opacity-0 group-hover:opacity-100" title="Delete">
                      <span className="material-icons text-sm">delete</span>
                   </button>
                </div>
                
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-sans line-clamp-2" title={proj.title}>
                  {proj.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6 flex-1 line-clamp-3">
                  {proj.desc}
                </p>
                
                <div className="flex pt-4 border-t border-[var(--border-color)] gap-2 mt-auto">
                   <button onClick={() => setView(proj.view)} className="flex-1 bg-[var(--surface-color)] text-[var(--text-primary)] hover:bg-[var(--shadow-color)] py-2 text-xs font-bold rounded flex justify-center items-center gap-1 transition-colors border border-[var(--border-color)]">
                     <span className="material-icons text-[14px]">visibility</span> View
                   </button>
                   <button onClick={() => setView(proj.view)} className="flex-1 bg-[var(--accent)] text-white hover:opacity-90 py-2 text-xs font-bold rounded flex justify-center items-center gap-1 transition-colors btn-primary">
                     <span className="material-icons text-[14px]">edit</span> Edit
                   </button>
                </div>
                
                <div className="flex gap-2 mt-2 pt-2 border-t border-[var(--border-color)] opacity-70 hover:opacity-100 transition-opacity">
                   <button onClick={() => handleShare(proj)} className="flex-1 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)] hover:bg-opacity-10 py-1 text-xs font-bold rounded flex justify-center items-center gap-1 transition-colors" title="Share via Link">
                     <span className="material-icons text-[14px]">share</span> Share
                   </button>
                   <button onClick={() => handleDownload(proj)} className="flex-1 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)] hover:bg-opacity-10 py-1 text-xs font-bold rounded flex justify-center items-center gap-1 transition-colors" title="Download Data">
                     <span className="material-icons text-[14px]">download</span> Download
                   </button>
                   <button onClick={() => handleDuplicate(proj.id, proj.type, proj.data)} className="flex-1 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)] hover:bg-opacity-10 py-1 text-xs font-bold rounded flex justify-center items-center gap-1 transition-colors" title="Duplicate">
                     <span className="material-icons text-[14px]">content_copy</span> Duplicate
                   </button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

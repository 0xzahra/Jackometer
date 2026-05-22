import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface DashboardProps {
  setView: (view: AppView) => void;
}

const StickyCard: React.FC<{ 
  title: string; 
  desc: string; 
  icon: string; 
  color?: string;
  onClick: () => void;
}> = ({ title, desc, icon, color = 'var(--surface-color)', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="sticky-card p-6 rounded-lg h-40 flex flex-col justify-between cursor-pointer select-none border border-[var(--border-color)] hover:shadow-lg transition-all bg-white"
    >
      <div className="flex justify-between items-start">
        <span className="material-icons text-3xl opacity-70 text-[var(--accent)]">{icon}</span>
      </div>
      
      <div className="mt-4 flex-1">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 font-sans leading-tight">{title}</h3>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{desc}</p>
      </div>

      <div className="flex items-center text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-2 group">
        <span>ACCESS</span>
        <span className="material-icons text-xs ml-1 transition-transform group-hover:translate-x-1">arrow_right_alt</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto px-4 md:px-8 py-10 bg-[var(--bg-color)]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 pt-8">
          <h1 className="text-4xl font-sans font-bold text-[var(--text-primary)] tracking-tight">
            {greeting}, Scholar
          </h1>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StickyCard 
            title="Start Research" 
            desc="Generate topic ideas & structured outlines."
            icon="lightbulb"
            onClick={() => setView(AppView.RESEARCH)}
          />
          <StickyCard 
            title="Write Document" 
            desc="Draft academic documents and papers."
            icon="description"
            onClick={() => setView(AppView.DOCUMENT_WRITER)}
          />
          <StickyCard 
            title="Literature Review" 
            desc="6-Stage Literature Review Assembly."
            icon="library_books"
            onClick={() => setView(AppView.LIT_REVIEW)}
          />
          <StickyCard 
            title="Defense Prep" 
            desc="Prepare for your defense presentation."
            icon="record_voice_over"
            onClick={() => setView(AppView.DEFENSE_PREP)}
          />
        </div>

        {/* Secondary Tools */}
        <div className="mb-16">
          <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">Other Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <button onClick={() => setView(AppView.DATA_CRUNCHER)} className="p-4 bg-white border border-[var(--border-color)] rounded-lg text-left hover:shadow-md transition-shadow">
                <span className="material-icons text-[var(--primary)] mb-2 block text-xl">analytics</span>
                <span className="text-sm font-bold block text-[var(--text-primary)]">Data Cruncher</span>
             </button>
             <button onClick={() => setView(AppView.PROJECTS)} className="p-4 bg-white border border-[var(--border-color)] rounded-lg text-left hover:shadow-md transition-shadow">
                <span className="material-icons text-[var(--primary)] mb-2 block text-xl">folder</span>
                <span className="text-sm font-bold block text-[var(--text-primary)]">Projects</span>
             </button>
          </div>
        </div>

        {/* Platform Stats at the bottom */}
        <details className="paper-panel p-6 rounded-xl border border-[var(--border-color)] cursor-pointer outline-none bg-white">
          <summary className="text-xs font-bold font-sans text-[var(--text-secondary)] uppercase tracking-widest outline-none list-none text-center flex items-center justify-center gap-2">
              <span className="material-icons text-sm">insights</span> Platform Stats
          </summary>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-[var(--border-color)] text-center">
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase">Today</p>
              <p className="text-xl font-bold text-[var(--primary)]">1,402</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase">Yesterday</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">1,250</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase">This Week</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">8,934</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase">This Year</p>
              <p className="text-xl font-bold text-[var(--accent)]">142K</p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};
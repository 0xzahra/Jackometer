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
      className="sticky-card p-6 rounded-sm h-48 flex flex-col justify-between cursor-pointer select-none border-t-2 border-t-[var(--primary)] hover:shadow-lg transition-all"
      style={{ backgroundColor: color }}
    >
      <div className="flex justify-between items-start">
        <span className="material-icons text-3xl opacity-70 text-[var(--text-primary)]">{icon}</span>
      </div>
      
      <div className="mt-4 flex-1">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 font-sans leading-tight">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-1">{desc}</p>
      </div>

      <div className="flex items-center text-xs font-bold text-[var(--accent)] uppercase tracking-widest mt-2 group">
        <span>Access</span>
        <span className="material-icons text-sm ml-1 transition-transform group-hover:translate-x-1">arrow_right_alt</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState({ text: '', author: '' });

  const quotes = [
    { text: "Research is creating new knowledge.", author: "Neil Armstrong" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Excellence is not an act, but a habit.", author: "Aristotle" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" }
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto pb-10 relative px-4">
        <div className="mb-20 text-center pt-16">
          <h1 className="text-5xl font-sans font-bold text-[var(--text-primary)] mb-6 tracking-tight">
            {greeting}, Scholar.
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg font-sans italic relative inline-block">
            <span className="text-4xl text-[var(--border-color)] absolute -left-6 -top-2">"</span>
            {quote.text}
            <span className="text-4xl text-[var(--border-color)] absolute -right-6 -bottom-4">"</span>
          </p>
          <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest mt-4">— {quote.author}</p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
           <div className="paper-panel p-8 rounded-xl w-full shadow-md border border-[var(--primary)] text-center relative overflow-hidden group">
              <span className="material-icons text-4xl text-[var(--accent)] mb-3 opacity-80">workspace_premium</span>
              <p className="text-[var(--text-primary)] text-sm leading-relaxed font-serif relative z-10">
                 With <strong className="text-[var(--accent)] font-sans tracking-tight">Jackometer</strong>, you do not have to worry about writing project documents, review essays, scholar assignments, journals, literature reviews, or technical reports from scratch.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2 mb-20">
          <StickyCard 
            title="Topic Ideas" 
            desc="Generate topics & structured outlines."
            icon="lightbulb"
            onClick={() => setView(AppView.RESEARCH)}
          />
          <StickyCard 
            title="Lit Review Engine" 
            desc="6-Stage Literature Review Assembly."
            icon="library_books"
            onClick={() => setView(AppView.LIT_REVIEW)}
          />
          <StickyCard 
            title="Projects" 
            desc="Manage & share all generated docs."
            icon="folder"
            onClick={() => setView(AppView.PROJECTS)}
          />
          <StickyCard 
            title="Document Writer" 
            desc="Draft academic documents."
            icon="description"
            onClick={() => setView(AppView.DOCUMENT_WRITER)}
          />
          <StickyCard 
            title="Assignment Solver" 
            desc="Solve assignments & review essays."
            icon="assignment"
            onClick={() => setView(AppView.ASSIGNMENT)}
          />
          <StickyCard 
            title="Field Trip" 
            desc="GPS & Rapid Presentation."
            icon="landscape"
            onClick={() => setView(AppView.FIELD_TRIP)}
          />
          <StickyCard 
            title="Technical Report" 
            desc="SIWES & Industrial Reports."
            icon="engineering"
            onClick={() => setView(AppView.TECHNICAL_REPORT)}
          />
          <StickyCard 
            title="Data Cruncher" 
            desc="Statistical & Bio-systematic analysis."
            icon="analytics"
            onClick={() => setView(AppView.DATA_CRUNCHER)}
          />
        </div>

        {/* Platform Stats at the bottom */}
        <div className="max-w-4xl mx-auto">
           <details className="paper-panel p-6 rounded-xl border border-[var(--border-color)] cursor-pointer outline-none">
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
    </div>
  );
};
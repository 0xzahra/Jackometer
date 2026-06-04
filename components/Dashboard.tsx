import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface DashboardProps {
  setView: (view: AppView) => void;
}

const QuickCard: React.FC<{ 
  title: string; 
  desc: string; 
  icon: string; 
  onClick: () => void;
}> = ({ title, desc, icon, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="sketch-card p-6 h-40 flex flex-col justify-between cursor-pointer select-none transition-all"
    >
      <div className="flex justify-between items-start">
        <span className="material-icons text-3xl text-[var(--accent)]">{icon}</span>
      </div>
      
      <div className="mt-4 flex-1">
        <h3 className="text-lg font-serif font-bold text-[var(--text-primary)] mb-1 leading-tight">{title}</h3>
        <p className="text-sm font-sans text-[var(--text-secondary)] line-clamp-2">{desc}</p>
      </div>

      <div className="flex items-center text-[11px] font-sans font-bold text-[var(--accent)] mt-2 group">
        <span>Open</span>
        <span className="material-icons text-xs ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [greeting, setGreeting] = useState('');
  
  // Motivational quotes
  const quotes = [
    "The beginning is the most important part of the work.",
    "By failing to prepare, you are preparing to fail.",
    "A journey of a thousand miles begins with a single step.",
    "Research is formalized curiosity.",
    "Write to be understood, speak to be heard, read to grow."
  ];
  
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);
  
  // Get projects from localStorage
  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('jackometer_stats');
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        if (parsed.generatedTopics) {
           setProjects(parsed.generatedTopics.slice(-3).reverse());
        }
      }
    } catch(e) {}
  }, []);

  return (
    <div className="w-full h-full p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-12 pt-4">
        <h1 className="text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
          {greeting}, Scholar.
        </h1>
        <p className="text-lg font-serif italic text-[var(--text-secondary)] mt-2 opacity-80">
          "{quote}"
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <QuickCard 
          title="Topic Finder" 
          desc="Stuck on what to research? Start here."
          icon="search"
          onClick={() => setView(AppView.RESEARCH)}
        />
        <QuickCard 
          title="Lit Review" 
          desc="Build your literature chapter step by step."
          icon="library_books"
          onClick={() => setView(AppView.LIT_REVIEW)}
        />
        <QuickCard 
          title="Document Writer" 
          desc="Write your full project document."
          icon="history_edu"
          onClick={() => setView(AppView.DOCUMENT_WRITER)}
        />
        <QuickCard 
          title="Technical Report" 
          desc="Lab and technical report generator."
          icon="summarize"
          onClick={() => setView(AppView.TECHNICAL_REPORT)}
        />
        <QuickCard 
          title="Assignment Solver" 
          desc="Submit structured academic answers."
          icon="assignment"
          onClick={() => setView(AppView.ASSIGNMENT)}
        />
        <QuickCard 
          title="Field Trip" 
          desc="Organize and document field observations."
          icon="terrain"
          onClick={() => setView(AppView.FIELD_TRIP)}
        />
      </div>

      {projects.length > 0 && (
        <div className="mb-16">
          <h3 className="text-[10px] font-sans font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">Recent Projects</h3>
          <ul className="space-y-3">
            {projects.map((proj, idx) => (
               <li key={idx} className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] shadow-sm">
                  <span className="font-bold">{proj.title || "Untitled"}</span>
               </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
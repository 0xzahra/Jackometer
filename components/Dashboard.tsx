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
  rotate: number;
  onClick: () => void;
}> = ({ title, desc, icon, color = 'var(--panel-bg)', rotate, onClick }) => (
  <div 
    onClick={onClick}
    className="sticky-card p-6 rounded-sm h-64 flex flex-col justify-between cursor-pointer select-none"
    style={{ backgroundColor: color }}
  >
    <div className="flex justify-between items-start">
      <span className="material-icons text-3xl opacity-70 text-[var(--text-primary)]">{icon}</span>
      <span className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest">Module</span>
    </div>
    
    <div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-serif leading-tight">{title}</h3>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">{desc}</p>
    </div>

    <div className="flex items-center text-xs font-bold text-[var(--accent)] uppercase tracking-widest mt-2 group">
      <span>Access</span>
      <span className="material-icons text-sm ml-1 transition-transform group-hover:translate-x-1">arrow_right_alt</span>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState({ text: '', author: '' });

  const quotes = [
    { text: "Research is creating new knowledge.", author: "Neil Armstrong" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Excellence is not an act, but a habit.", author: "Aristotle" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Knowledge is power.", author: "Francis Bacon" },
    { text: "What we know is a drop, what we don't know is an ocean.", author: "Isaac Newton" }
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
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-12 text-center pt-8">
        <h1 className="text-5xl font-serif font-bold text-[var(--text-primary)] mb-2">
          {greeting}, Scholar.
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg font-serif italic mb-2">
          "{quote.text}"
        </p>
        <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest">— {quote.author}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
        <StickyCard 
          title="Research Engine" 
          desc="Thesis Forge & Dissertation Builder."
          icon="school"
          rotate={0}
          onClick={() => setView(AppView.RESEARCH)}
        />
        <StickyCard 
          title="Document Writer" 
          desc="Full academic document generator for any course."
          icon="description"
          rotate={0}
          onClick={() => setView(AppView.DOCUMENT_WRITER)}
        />
        <StickyCard 
          title="Assignment / Grader" 
          desc="Essay Critique, Grading & 'Handwriting' Protocol."
          icon="gavel"
          rotate={0}
          onClick={() => setView(AppView.ASSIGNMENT)}
        />
        <StickyCard 
          title="Field Trip" 
          desc="GPS, Weather & Rapid Presentation."
          icon="landscape"
          rotate={0}
          onClick={() => setView(AppView.FIELD_TRIP)}
        />
        <StickyCard 
          title="Technical Report" 
          desc="SIWES & Industrial Reports."
          icon="engineering"
          rotate={0}
          onClick={() => setView(AppView.TECHNICAL_REPORT)}
        />
        <StickyCard 
          title="Lab Report" 
          desc="Experiment analysis & tabulation."
          icon="science"
          rotate={0}
          onClick={() => setView(AppView.LAB_REPORT)}
        />
        <StickyCard 
          title="Data Cruncher" 
          desc="Statistical & Bio-systematic analysis."
          icon="analytics"
          rotate={0}
          onClick={() => setView(AppView.DATA_CRUNCHER)}
        />
        <StickyCard 
          title="File Studio" 
          desc="Universal file compressor & optimizer."
          icon="folder_zip"
          rotate={0}
          onClick={() => setView(AppView.COMPRESSOR)}
        />
        <StickyCard 
          title="Career Studio" 
          desc="CV, Resume & Passport builder."
          icon="work_outline"
          rotate={0}
          onClick={() => setView(AppView.CAREER)}
        />
      </div>
    </div>
  );
};
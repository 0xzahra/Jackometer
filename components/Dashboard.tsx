import React from 'react';
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
    className="sticky-card p-6 rounded-sm h-64 flex flex-col justify-between cursor-pointer"
    style={{ transform: `rotate(${rotate}deg)`, backgroundColor: color }}
  >
    <div className="flex justify-between items-start">
      <span className="material-icons text-3xl opacity-70 text-[var(--text-primary)]">{icon}</span>
      <span className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest">Module</span>
    </div>
    
    <div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-serif leading-tight">{title}</h3>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">{desc}</p>
    </div>

    <div className="flex items-center text-xs font-bold text-[var(--accent)] uppercase tracking-widest mt-2">
      <span>Access</span>
      <span className="material-icons text-sm ml-1">arrow_right_alt</span>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-serif font-bold text-[var(--text-primary)] mb-4">
          Jackometer
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg font-serif italic">
          "The ultimate academic companion for the modern scholar."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        <StickyCard 
          title="Research Engine" 
          desc="Thesis Forge & Dissertation Builder."
          icon="school"
          rotate={-2}
          onClick={() => setView(AppView.RESEARCH)}
        />
        <StickyCard 
          title="Document Writer" 
          desc="Full academic document generator for any course."
          icon="description"
          rotate={1}
          onClick={() => setView(AppView.DOCUMENT_WRITER)}
        />
        <StickyCard 
          title="Field Trip" 
          desc="GPS, Weather & Rapid Presentation."
          icon="landscape"
          rotate={1}
          onClick={() => setView(AppView.FIELD_TRIP)}
        />
        <StickyCard 
          title="Technical Report" 
          desc="SIWES & Industrial Reports."
          icon="engineering"
          rotate={-1}
          onClick={() => setView(AppView.TECHNICAL_REPORT)}
        />
        <StickyCard 
          title="Lab Report" 
          desc="Experiment analysis & tabulation."
          icon="science"
          rotate={2}
          onClick={() => setView(AppView.LAB_REPORT)}
        />
        <StickyCard 
          title="Data Cruncher" 
          desc="Statistical & Bio-systematic analysis."
          icon="analytics"
          rotate={-3}
          onClick={() => setView(AppView.DATA_CRUNCHER)}
        />
        <StickyCard 
          title="Career Studio" 
          desc="CV, Resume & Passport builder."
          icon="work_outline"
          rotate={1}
          onClick={() => setView(AppView.CAREER)}
        />
        <StickyCard 
          title="Community" 
          desc="Global scholar network & support."
          icon="forum"
          rotate={2}
          onClick={() => setView(AppView.COMMUNITY)}
        />
      </div>
    </div>
  );
};
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
  // Generate random rotation on mount for realism
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    // Random rotation between -1.5 and 1.5 degrees
    setRotation((Math.random() * 3) - 1.5);
  }, []);

  return (
    <div 
      onClick={onClick}
      className="sticky-card p-6 rounded-sm h-64 flex flex-col justify-between cursor-pointer select-none border-t-2 border-t-white/50"
      style={{ 
        backgroundColor: color,
        transform: `rotate(${rotation}deg)` 
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="material-icons text-3xl opacity-70 text-[var(--text-primary)]">{icon}</span>
        <span className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest opacity-60">Module</span>
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
};

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

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

    // Check for first time visitor
    if (!localStorage.getItem('jackometer_tour_done')) {
      setShowTour(true);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem('jackometer_tour_done', 'true');
    setShowTour(false);
  };

  const tourSteps = [
    {
      title: "Welcome to Jackometer",
      text: "Your AI-powered academic fortress. Stop writing from scratch. We architect your research.",
      icon: "waving_hand",
    },
    {
      title: "Deep Draft",
      text: "Generate entire 20-page dissertations with real citations. Just input your topic in the Research Engine.",
      icon: "school",
      highlight: AppView.RESEARCH
    },
    {
      title: "Ecological Lens",
      text: "Going on a field trip? The Field Trip module tracks GPS, weather, and builds your report on the go.",
      icon: "landscape",
      highlight: AppView.FIELD_TRIP
    },
    {
      title: "Data Cruncher",
      text: "Statistical analysis without the headache. Feed it raw data, get bio-systematic results instantly. This is a tool, not a scrapbook.",
      icon: "analytics",
      highlight: AppView.DATA_CRUNCHER
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 relative">
      <div className="mb-12 text-center pt-8">
        <h1 className="text-5xl font-serif font-bold text-[var(--text-primary)] mb-2 tracking-tight">
          {greeting}, Scholar.
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg font-serif italic mb-2 relative inline-block">
          <span className="text-4xl text-[var(--border-color)] absolute -left-6 -top-2">"</span>
          {quote.text}
          <span className="text-4xl text-[var(--border-color)] absolute -right-6 -bottom-4">"</span>
        </p>
        <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest mt-4">— {quote.author}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
        <StickyCard 
          title="Research Engine" 
          desc="Thesis Forge & Dissertation Builder."
          icon="school"
          onClick={() => setView(AppView.RESEARCH)}
        />
        <StickyCard 
          title="Document Writer" 
          desc="Full academic document generator for any course."
          icon="description"
          onClick={() => setView(AppView.DOCUMENT_WRITER)}
        />
        <StickyCard 
          title="Assignment / Grader" 
          desc="Essay Critique, Grading & 'Handwriting' Protocol."
          icon="gavel"
          onClick={() => setView(AppView.ASSIGNMENT)}
        />
        <StickyCard 
          title="Field Trip" 
          desc="GPS, Weather & Rapid Presentation."
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
          title="Lab Report" 
          desc="Experiment analysis & tabulation."
          icon="science"
          onClick={() => setView(AppView.LAB_REPORT)}
        />
        <StickyCard 
          title="Data Cruncher" 
          desc="Statistical & Bio-systematic analysis."
          icon="analytics"
          onClick={() => setView(AppView.DATA_CRUNCHER)}
        />
        <StickyCard 
          title="File Studio" 
          desc="Universal file compressor & optimizer."
          icon="folder_zip"
          onClick={() => setView(AppView.COMPRESSOR)}
        />
        <StickyCard 
          title="Career Studio" 
          desc="CV, Resume & Passport builder."
          icon="work_outline"
          onClick={() => setView(AppView.CAREER)}
        />
      </div>

      {/* Onboarding Modal */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full rounded-lg shadow-2xl p-8 relative animate-fade-in-up border-t-4 border-[var(--accent)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6 text-[var(--accent)]">
                 <span className="material-icons text-3xl">{tourSteps[tourStep].icon}</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-2">{tourSteps[tourStep].title}</h3>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                {tourSteps[tourStep].text}
              </p>
              
              <div className="flex gap-2 w-full">
                {tourStep > 0 && (
                  <button 
                    onClick={() => setTourStep(tourStep - 1)}
                    className="flex-1 bg-gray-100 text-[var(--text-secondary)] py-3 rounded font-bold text-sm hover:bg-gray-200"
                  >
                    Back
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (tourStep < tourSteps.length - 1) setTourStep(tourStep + 1);
                    else completeTour();
                  }}
                  className="flex-1 bg-[var(--accent)] text-white py-3 rounded font-bold text-sm hover:opacity-90"
                >
                  {tourStep < tourSteps.length - 1 ? 'Next' : 'Get Started'}
                </button>
              </div>

              <div className="flex gap-2 mt-6">
                {tourSteps.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === tourStep ? 'bg-[var(--accent)]' : 'bg-gray-200'}`}></div>
                ))}
              </div>
            </div>
            
            <button onClick={completeTour} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <span className="material-icons text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
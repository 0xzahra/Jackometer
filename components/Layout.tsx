import React, { useState, useEffect } from 'react';
import { AppView, UserProfile } from '../types';
import { BibliographyManager } from './BibliographyManager';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: UserProfile;
  onLogout: () => void;
}

const NavButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: string; 
  label: string; 
}> = ({ active, onClick, icon, label }) => {
  return (
    <div className="relative group w-full px-4 mb-2">
      <button
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
          active 
            ? 'bg-[var(--accent)] text-white shadow-lg font-bold opacity-100 transform scale-[1.02]' 
            : 'text-[var(--text-primary)] opacity-80 hover:opacity-100 hover:bg-[rgba(139,105,20,0.05)] hover:font-semibold'
        }`}
      >
        <span className={`material-icons text-xl mr-4 relative z-10 transition-transform duration-300 ${active ? 'text-white scale-110' : 'group-hover:rotate-6'}`}>{icon}</span>
        <span className={`font-sans tracking-wide relative z-10 ${active ? 'font-bold text-sm' : 'font-medium text-[13px]'}`}>{label}</span>
      </button>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, theme, toggleTheme, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Tour State
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Badge States
  const [unreadMessages, setUnreadMessages] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(true);

  useEffect(() => {
    // Check local storage for first time visit
    if (!localStorage.getItem('jackometer_tour_done')) {
      setTourOpen(true);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem('jackometer_tour_done', 'true');
    setTourOpen(false);
    setTourStep(0);
    setView(AppView.DASHBOARD);
  };

  const toggleTour = () => {
    setTourOpen(!tourOpen);
    if (!tourOpen) setTourStep(0);
  };

  const tourSteps = [
    {
      title: "Welcome to Jackometer",
      text: "Your AI-powered academic fortress. Stop writing from scratch. We architect your research.",
      icon: "school",
    },
    {
      title: "Deep Draft",
      text: "Generate entire 20-page dissertations with real citations. Just input your topic in Topic Ideas.",
      icon: "lightbulb",
      highlight: AppView.RESEARCH
    },
    {
      title: "Ecological Lens",
      text: "Going on a field trip? The Field Trip tool tracks GPS, weather, and builds your report on the go.",
      icon: "map",
      highlight: AppView.FIELD_TRIP
    },
    {
      title: "Data Cruncher",
      text: "Statistical analysis without the headache. Feed it raw data, get bio-systematic results instantly.",
      icon: "analytics",
      highlight: AppView.DATA_CRUNCHER
    }
  ];

  const handleNextStep = () => {
    if (tourStep < tourSteps.length - 1) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      if (tourSteps[nextStep].highlight) {
        setView(tourSteps[nextStep].highlight!);
      }
    } else {
      completeTour();
    }
  };

  return (
    <div className="h-screen w-full flex flex-row bg-[var(--bg-color)] text-[var(--text-primary)] overflow-hidden">
      
      {/* Sidebar - Opaque Background to fix transparency issues */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-[var(--panel-bg)] border-r border-[var(--border-color)] flex flex-col py-8 shadow-2xl transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-72 backdrop-blur-xl md:relative md:translate-x-0 md:flex md:flex-shrink-0`}
      >
        <div className="px-8 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/jackometer-logo.svg" alt="Jackometer" className="w-8 h-8 rounded-lg" />
            <div className="text-2xl font-bold font-sans text-white tracking-tight cursor-pointer" onClick={() => { setView(AppView.DASHBOARD); setSidebarOpen(false); }}>
              Jackometer
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-emerald-100/70 hover:text-[var(--button-primary)]">
            <span className="material-icons text-black dark:text-white">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pt-2">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)] px-4 pt-4 pb-1">Write</p>
          <NavButton active={currentView === AppView.DOCUMENT_WRITER} onClick={() => { setView(AppView.DOCUMENT_WRITER); setSidebarOpen(false); }} icon="history_edu" label="Document Writer" />
          <NavButton active={currentView === AppView.TECHNICAL_REPORT} onClick={() => { setView(AppView.TECHNICAL_REPORT); setSidebarOpen(false); }} icon="summarize" label="Technical Report" />
          <NavButton active={currentView === AppView.ASSIGNMENT} onClick={() => { setView(AppView.ASSIGNMENT); setSidebarOpen(false); }} icon="assignment" label="Assignment Solver" />

          <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)] px-4 pt-4 pb-1">Research</p>
          <NavButton active={currentView === AppView.RESEARCH} onClick={() => { setView(AppView.RESEARCH); setSidebarOpen(false); }} icon="search" label="Topic Finder" />
          <NavButton active={currentView === AppView.LIT_REVIEW} onClick={() => { setView(AppView.LIT_REVIEW); setSidebarOpen(false); }} icon="library_books" label="Lit Review Engine" />
          <NavButton active={currentView === AppView.DATA_CRUNCHER} onClick={() => { setView(AppView.DATA_CRUNCHER); setSidebarOpen(false); }} icon="bar_chart" label="Data Cruncher" />
          
          <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)] px-4 pt-4 pb-1">Field</p>
          <NavButton active={currentView === AppView.FIELD_TRIP} onClick={() => { setView(AppView.FIELD_TRIP); setSidebarOpen(false); }} icon="terrain" label="Field Trip" />
          
          <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-secondary)] px-4 pt-4 pb-1">Tools</p>
          <NavButton active={currentView === AppView.PROJECTS} onClick={() => { setView(AppView.PROJECTS); setSidebarOpen(false); }} icon="folder" label="Projects" />
          <NavButton active={currentView === AppView.CAREER} onClick={() => { setView(AppView.CAREER); setSidebarOpen(false); }} icon="work" label="Career Studio" />
          <NavButton active={currentView === AppView.COMPRESSOR} onClick={() => { setView(AppView.COMPRESSOR); setSidebarOpen(false); }} icon="compress" label="File Compressor" />
        </div>

        <div className="px-6 py-4 border-t border-[var(--border-color)]">
          <NavButton active={currentView === AppView.SETTINGS} onClick={() => { setView(AppView.SETTINGS); setSidebarOpen(false); }} icon="settings" label="Settings" />
          <div 
             className="flex items-center cursor-pointer hover:bg-[rgba(139,105,20,0.05)] rounded p-2 transition-colors mb-2 mt-2" 
             onClick={() => setView(AppView.PROFILE)}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold font-sans">
              {user.avatar === 'G' ? <span className="material-icons text-xs">google</span> : user.name[0]}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate">{user.role}</p>
            </div>
          </div>
          <button 
             onClick={onLogout}
             className="w-full text-xs text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/30 p-1 py-1.5 rounded flex items-center justify-center transition-colors"
          >
             <span className="material-icons text-sm mr-1">logout</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay when sidebar open */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-transparent">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)] bg-[var(--panel-bg)] z-30 flex-shrink-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="mr-8 text-[var(--text-primary)] hover:text-[var(--accent)] flex-shrink-0">
              <span className="material-icons text-2xl">menu</span>
            </button>
            <h2 className="text-xl font-sans font-bold text-[var(--text-primary)] capitalize truncate ml-2">
              {currentView.replace(/_/g, ' ').toLowerCase()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
             {/* Back to Dashboard Navigation (RHS) - Hidden on Mobile */}
             {currentView !== AppView.DASHBOARD && (
               <button
                 onClick={() => setView(AppView.DASHBOARD)}
                 className="hidden md:flex items-center gap-1 bg-[var(--panel-bg)] hover:bg-[var(--surface-color)] text-[var(--text-primary)] px-3 py-1.5 rounded-full text-xs font-bold transition-colors mr-2 border border-[var(--border-color)]"
                 title="Back to Dashboard"
               >
                  <span className="material-icons text-sm">grid_view</span>
                  <span>Dashboard</span>
               </button>
             )}

             <button 
                onClick={toggleTheme} 
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-2" 
                title="Toggle Theme"
             >
               <span className="material-icons">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
             </button>

             <button 
                onClick={toggleTour}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${tourOpen ? 'bg-[var(--accent)] text-white' : 'bg-[var(--panel-bg)] border border-[var(--border-color)] text-[var(--text-secondary)]'}`}
                title="Interactive Tour"
             >
                <span className="material-icons text-sm">help_outline</span>
                <span className="hidden sm:inline">{tourOpen ? 'Tour On' : 'Tour Off'}</span>
             </button>

             <div className="h-6 w-px bg-[var(--border-color)] mx-2 hidden sm:block"></div>

             <button onClick={() => { setView(AppView.INBOX); setUnreadMessages(false); }} className="relative text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-2" title="Inbox">
               <span className="material-icons">mail</span>
               {unreadMessages && <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent)] rounded-full border border-[var(--panel-bg)]"></span>}
             </button>
             
             <button onClick={() => { setView(AppView.NOTIFICATIONS); setUnreadNotifications(false); }} className="relative text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-2" title="Notifications">
               <span className="material-icons">notifications</span>
               {unreadNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[var(--panel-bg)]"></span>}
             </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-20">
          {children}
          {/* Footer */}
          <footer className="text-center text-xs py-4 mt-8 border-t border-[var(--border-color)] text-[var(--text-secondary)]">
            © 2025 Jackometer. All rights reserved.
          </footer>
        </main>
      </div>

          {/* Right Sidebar - Tools Panel */}
      {currentView === AppView.DOCUMENT_WRITER && (
        <aside className="hidden xl:flex w-80 flex-col border-l border-[var(--border-color)] bg-white/90 dark:bg-[#061410] z-30 shadow-l backdrop-blur-xl">
          <div className="h-16 flex items-center px-6 border-b border-[var(--border-color)] bg-[var(--panel-bg)] flex-shrink-0">
            <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Workspace Tools</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <BibliographyManager />
          </div>
        </aside>
      )}

      {/* Interactive Tour Modal */}
      {tourOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full rounded-lg shadow-2xl p-8 relative animate-fade-in-up border-t-4 border-[var(--accent)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6 text-[var(--accent)]">
                 <span className="material-icons text-3xl">{tourSteps[tourStep].icon}</span>
              </div>
              <h3 className="text-2xl font-sans font-bold text-[var(--text-primary)] mb-2">{tourSteps[tourStep].title}</h3>
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
                  onClick={handleNextStep}
                  className="flex-1 bg-[var(--accent)] text-white py-3 rounded font-bold text-sm hover:opacity-90"
                >
                  {tourStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
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
}
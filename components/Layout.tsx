import React, { useState, useEffect } from 'react';
import { AppView, UserProfile } from '../types';

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
        className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group ${
          active 
            ? 'bg-[var(--accent)] text-white shadow-md border-l-4 border-white font-bold opacity-100' 
            : 'text-[var(--text-secondary)] hover:bg-[var(--shadow-color)] hover:text-[var(--text-primary)] hover:font-semibold'
        }`}
      >
        <span className={`material-icons text-xl mr-4 ${active ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--accent)]'}`}>{icon}</span>
        <span className={`font-serif text-sm tracking-wide ${active ? 'font-bold' : 'font-normal'}`}>{label}</span>
      </button>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, theme, toggleTheme, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Tour State
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

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
    <div className="flex h-screen w-full overflow-hidden">
      
      {/* Sidebar - Opaque Background */}
      <nav 
        className={`fixed inset-y-0 left-0 z-40 bg-[var(--surface-color)] border-r border-[var(--border-color)] flex flex-col py-8 shadow-2xl transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-72`}
      >
        <div className="px-8 mb-6 flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold font-serif text-[var(--text-primary)] tracking-tight cursor-pointer" onClick={() => { setView(AppView.DASHBOARD); setSidebarOpen(false); }}>
              Jackometer
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 uppercase tracking-widest font-sans">Academic Suite</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[var(--text-secondary)]">
            <span className="material-icons">chevron_left</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 mb-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-100">Modules</div>
          <NavButton active={currentView === AppView.RESEARCH} onClick={() => { setView(AppView.RESEARCH); setSidebarOpen(false); }} icon="school" label="Research Engine" />
          <NavButton active={currentView === AppView.DOCUMENT_WRITER} onClick={() => { setView(AppView.DOCUMENT_WRITER); setSidebarOpen(false); }} icon="description" label="Document Writer" />
          <NavButton active={currentView === AppView.ASSIGNMENT} onClick={() => { setView(AppView.ASSIGNMENT); setSidebarOpen(false); }} icon="gavel" label="Assignment / Grader" />
          <NavButton active={currentView === AppView.FIELD_TRIP} onClick={() => { setView(AppView.FIELD_TRIP); setSidebarOpen(false); }} icon="landscape" label="Field Trip" />
          <NavButton active={currentView === AppView.TECHNICAL_REPORT} onClick={() => { setView(AppView.TECHNICAL_REPORT); setSidebarOpen(false); }} icon="engineering" label="Technical Report" />
          <NavButton active={currentView === AppView.LAB_REPORT} onClick={() => { setView(AppView.LAB_REPORT); setSidebarOpen(false); }} icon="science" label="Lab Report" />
          <NavButton active={currentView === AppView.DATA_CRUNCHER} onClick={() => { setView(AppView.DATA_CRUNCHER); setSidebarOpen(false); }} icon="analytics" label="Data Cruncher" />
          <NavButton active={currentView === AppView.COMPRESSOR} onClick={() => { setView(AppView.COMPRESSOR); setSidebarOpen(false); }} icon="folder_zip" label="File Studio" />
          <NavButton active={currentView === AppView.CAREER} onClick={() => { setView(AppView.CAREER); setSidebarOpen(false); }} icon="work_outline" label="Career Studio" />
          
          <div className="px-4 mb-2 mt-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-100">Communication</div>
          <NavButton active={currentView === AppView.COMMUNITY} onClick={() => { setView(AppView.COMMUNITY); setSidebarOpen(false); }} icon="forum" label="Community Groups" />
          <NavButton active={currentView === AppView.INBOX} onClick={() => { setView(AppView.INBOX); setSidebarOpen(false); }} icon="mail" label="Inbox" />
          <NavButton active={currentView === AppView.NOTIFICATIONS} onClick={() => { setView(AppView.NOTIFICATIONS); setSidebarOpen(false); }} icon="notifications" label="Notifications" />

          <div className="px-4 mb-2 mt-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-100">System</div>
          <NavButton active={currentView === AppView.SETTINGS} onClick={() => { setView(AppView.SETTINGS); setSidebarOpen(false); }} icon="settings" label="Settings" />
        </div>

        <div className="px-6 py-4 border-t border-[var(--border-color)]">
          <div 
             className="flex items-center cursor-pointer hover:bg-[var(--shadow-color)] rounded p-2 transition-colors mb-2" 
             onClick={() => setView(AppView.PROFILE)}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold font-serif">
              {user.avatar === 'G' ? <span className="material-icons text-xs">google</span> : user.name[0]}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate">{user.role}</p>
            </div>
          </div>
          <button 
             onClick={onLogout}
             className="w-full text-xs text-red-500 font-bold hover:bg-red-50 p-1 rounded flex items-center justify-center"
          >
             <span className="material-icons text-sm mr-1">logout</span> Sign Out
          </button>
        </div>
      </nav>

      {/* Overlay when sidebar open */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden bg-transparent">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)] bg-[var(--panel-bg)] z-30 flex-shrink-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="mr-8 text-[var(--text-primary)] hover:text-[var(--accent)] flex-shrink-0">
              <span className="material-icons text-2xl">menu</span>
            </button>
            <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] capitalize truncate ml-2">
              {currentView.replace(/_/g, ' ').toLowerCase()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
             {/* Back to Dashboard Navigation (RHS) - Hidden on Mobile */}
             {currentView !== AppView.DASHBOARD && (
               <button
                 onClick={() => setView(AppView.DASHBOARD)}
                 className="hidden md:flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-[var(--text-primary)] px-3 py-1.5 rounded-full text-xs font-bold transition-colors mr-2 border border-[var(--border-color)]"
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
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${tourOpen ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-[var(--text-secondary)]'}`}
                title="Interactive Tour"
             >
                <span className="material-icons text-sm">help_outline</span>
                <span className="hidden sm:inline">{tourOpen ? 'Tour On' : 'Tour Off'}</span>
             </button>

             <div className="h-6 w-px bg-[var(--border-color)] mx-2 hidden sm:block"></div>

             <button onClick={() => setView(AppView.INBOX)} className="relative text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-2" title="Inbox">
               <span className="material-icons">mail</span>
               <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent)] rounded-full border border-[var(--panel-bg)]"></span>
             </button>
             
             <button onClick={() => setView(AppView.NOTIFICATIONS)} className="relative text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-2" title="Notifications">
               <span className="material-icons">notifications</span>
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[var(--panel-bg)]"></span>
             </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </div>

        {/* Footer */}
        <footer className="h-10 border-t border-[var(--border-color)] bg-[var(--panel-bg)] flex items-center justify-between px-8 text-xs font-serif text-[var(--text-secondary)] flex-shrink-0">
           <span>Jackometer v2050</span>
           <span className="font-bold opacity-70">Vibe coded by arewa.base.eth</span>
        </footer>
      </main>

      {/* Interactive Tour Modal */}
      {tourOpen && (
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
};
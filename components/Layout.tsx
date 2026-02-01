import React, { useState } from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
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

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, theme, toggleTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

        <div className="px-6 py-4 border-t border-[var(--border-color)] cursor-pointer hover:bg-[var(--shadow-color)]" onClick={() => setView(AppView.PROFILE)}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold font-serif">A</div>
            <div className="ml-3">
              <p className="text-sm font-bold text-[var(--text-primary)]">Academic User</p>
              <p className="text-xs text-[var(--text-secondary)]">View Profile</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay when sidebar open */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden bg-transparent">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)] bg-[var(--panel-bg)] z-30">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="mr-4 text-[var(--text-primary)] hover:text-[var(--accent)]">
              <span className="material-icons text-2xl">menu</span>
            </button>
            <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] capitalize truncate">
              {currentView.replace(/_/g, ' ').toLowerCase()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
             {/* Back to Dashboard Navigation (RHS) */}
             {currentView !== AppView.DASHBOARD && (
               <button
                 onClick={() => setView(AppView.DASHBOARD)}
                 className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-[var(--text-primary)] px-3 py-1.5 rounded-full text-xs font-bold transition-colors mr-2 border border-[var(--border-color)]"
                 title="Back to Dashboard"
               >
                  <span className="material-icons text-sm">grid_view</span>
                  <span className="hidden md:inline">Dashboard</span>
               </button>
             )}

             <button onClick={toggleTheme} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-2" title="Toggle Theme">
               <span className="material-icons">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
             </button>

             <div className="h-6 w-px bg-[var(--border-color)] mx-2"></div>

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
        <footer className="h-10 border-t border-[var(--border-color)] bg-[var(--panel-bg)] flex items-center justify-between px-8 text-xs font-serif text-[var(--text-secondary)]">
           <span>Jackometer v2050</span>
           <span className="font-bold opacity-70">Vibe coded by arewa.base.eth</span>
        </footer>
      </main>
    </div>
  );
};
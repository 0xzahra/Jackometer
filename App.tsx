import React, { useState, createContext, useContext, useEffect, ReactNode, Component } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ResearchEngine } from './components/ResearchEngine';
import { FieldTripSuite } from './components/FieldTripSuite';
import { CareerStudio } from './components/CareerStudio';
import { Community } from './components/Community';
import { Settings } from './components/Settings';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ReportSuite } from './components/ReportSuite';
import { DataCruncher } from './components/DataCruncher';
import { Inbox } from './components/Inbox';
import { Notifications } from './components/Notifications';
import { DocumentWriter } from './components/DocumentWriter';
import { AssignmentSuite } from './components/AssignmentSuite';
import { FileCompressor } from './components/FileCompressor';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { AppView, UserProfile } from './types';

// Mock Live API Context
const LiveAPIContext = createContext<any>(null);
export const useLiveAPIContext = () => useContext(LiveAPIContext);

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg-color)] text-[var(--text-primary)] p-8 text-center">
          <span className="material-icons text-6xl mb-4 text-red-500">error_outline</span>
          <h1 className="text-3xl font-serif font-bold mb-2">System Interruption</h1>
          <p className="mb-8 max-w-md mx-auto text-[var(--text-secondary)]">The application encountered an unexpected error. This may be due to corrupted session data.</p>
          <button 
            onClick={() => {
              localStorage.removeItem('jackometer_user');
              window.location.reload();
            }}
            className="bg-[var(--primary)] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-opacity"
          >
            Reset & Reboot
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Multitasking State: Track which views have been visited to keep them alive
  // Initialize with DASHBOARD to ensure it renders immediately on load
  const [visitedViews, setVisitedViews] = useState<Set<AppView>>(new Set([AppView.DASHBOARD]));

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Unified Navigation Handler: Synchronously updates visited views to prevent blank screens
  const handleSetView = (view: AppView) => {
    setVisitedViews(prev => {
      const newSet = new Set(prev);
      newSet.add(view);
      return newSet;
    });
    setCurrentView(view);
  };

  // Check for persisted session
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('jackometer_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.name) {
          setUser(parsed);
        } else {
          localStorage.removeItem('jackometer_user');
        }
      }
    } catch (e) {
      console.error("Session corrupted", e);
      localStorage.removeItem('jackometer_user');
    }
  }, []);

  const handleLogin = (userProfile: UserProfile) => {
    setUser(userProfile);
    localStorage.setItem('jackometer_user', JSON.stringify(userProfile));
  };

  const handleUpdateUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('jackometer_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('jackometer_user');
    // Clear visited views to free memory on logout
    setVisitedViews(new Set([AppView.DASHBOARD]));
    setCurrentView(AppView.DASHBOARD);
  };

  // Helper to render views with persistence (Hidden vs Unmounted)
  const renderPersistentView = (view: AppView, Component: ReactNode) => {
    // Optimization: Don't render if never visited (startup performance)
    if (!visitedViews.has(view)) return null;

    return (
      <div 
        key={view} 
        style={{ display: currentView === view ? 'block' : 'none', height: '100%' }}
        className="animate-fade-in"
      >
        {Component}
      </div>
    );
  };

  if (!user) {
    return (
      <ErrorBoundary>
        <Auth onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  return (
    <LiveAPIContext.Provider value={{}}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      
      <ErrorBoundary>
        <Layout 
          currentView={currentView} 
          setView={handleSetView} 
          theme={theme} 
          toggleTheme={toggleTheme}
          user={user}
          onLogout={handleLogout}
        >
          {renderPersistentView(AppView.DASHBOARD, <Dashboard setView={handleSetView} />)}
          {renderPersistentView(AppView.RESEARCH, <ResearchEngine userId={user.email} />)}
          {renderPersistentView(AppView.DOCUMENT_WRITER, <DocumentWriter userId={user.email} />)}
          {renderPersistentView(AppView.ASSIGNMENT, <AssignmentSuite userId={user.email} />)}
          {renderPersistentView(AppView.FIELD_TRIP, <FieldTripSuite />)}
          {renderPersistentView(AppView.CAREER, <CareerStudio />)}
          {renderPersistentView(AppView.COMMUNITY, <Community />)}
          {renderPersistentView(AppView.SETTINGS, <Settings user={user} onUpdateUser={handleUpdateUser} />)}
          {renderPersistentView(AppView.DATA_CRUNCHER, <DataCruncher />)}
          {renderPersistentView(AppView.COMPRESSOR, <FileCompressor />)}
          {renderPersistentView(AppView.TECHNICAL_REPORT, <ReportSuite type="TECHNICAL" />)}
          {renderPersistentView(AppView.LAB_REPORT, <ReportSuite type="LAB" />)}
          {renderPersistentView(AppView.INBOX, <Inbox setView={handleSetView} />)}
          {renderPersistentView(AppView.NOTIFICATIONS, <Notifications setView={handleSetView} />)}
          {renderPersistentView(AppView.PROFILE, <Profile user={user} />)}
        </Layout>

        <VoiceAssistant />
      </ErrorBoundary>
    </LiveAPIContext.Provider>
  );
}
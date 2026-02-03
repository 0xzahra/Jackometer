import React, { useState, createContext, useContext, useEffect } from 'react';
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

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<UserProfile | null>(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check for persisted session (Mock)
  useEffect(() => {
    const storedUser = localStorage.getItem('jackometer_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userProfile: UserProfile) => {
    setUser(userProfile);
    localStorage.setItem('jackometer_user', JSON.stringify(userProfile));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('jackometer_user');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <LiveAPIContext.Provider value={{}}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      
      <Layout 
        currentView={currentView} 
        setView={setCurrentView} 
        theme={theme} 
        toggleTheme={toggleTheme}
        user={user}
        onLogout={handleLogout}
      >
        {currentView === AppView.DASHBOARD && <Dashboard setView={setCurrentView} />}
        {currentView === AppView.RESEARCH && <ResearchEngine />}
        {currentView === AppView.DOCUMENT_WRITER && <DocumentWriter />}
        {currentView === AppView.ASSIGNMENT && <AssignmentSuite />}
        {currentView === AppView.FIELD_TRIP && <FieldTripSuite />}
        {currentView === AppView.CAREER && <CareerStudio />}
        {currentView === AppView.COMMUNITY && <Community />}
        {currentView === AppView.SETTINGS && <Settings />}
        {currentView === AppView.DATA_CRUNCHER && <DataCruncher />}
        {currentView === AppView.COMPRESSOR && <FileCompressor />}
        {currentView === AppView.TECHNICAL_REPORT && <ReportSuite type="TECHNICAL" />}
        {currentView === AppView.LAB_REPORT && <ReportSuite type="LAB" />}
        {currentView === AppView.INBOX && <Inbox />}
        {currentView === AppView.NOTIFICATIONS && <Notifications />}
        {currentView === AppView.PROFILE && <Profile user={user} />}
      </Layout>

      <VoiceAssistant />
    </LiveAPIContext.Provider>
  );
}
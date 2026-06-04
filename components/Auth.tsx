import React, { useState } from 'react';
import { UserProfile } from '../types';
import { googleSignIn } from '../lib/firebase';
import { customAlert } from '../lib/dialogs';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLoginStart = async () => {
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        onLogin({
          name: result.user.displayName || 'Academic User',
          email: result.user.email || '',
          institution: 'Verified User',
          role: 'Scholar',
          avatar: result.user.photoURL || 'G'
        });
      }
    } catch (error: any) {
      console.error(error);
      customAlert("Google sign-in failed or was cancelled.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex bg-[var(--bg-color)]">
      {/* Left Side - Motivation */}
      <div className="hidden lg:flex w-1/2 bg-[var(--surface-color)] border-r border-[var(--border-color)] flex-col justify-center px-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[var(--primary)]"></div>
        <div className="absolute -left-20 bottom-20 w-80 h-80 bg-[var(--primary)] rounded-full blur-3xl opacity-10"></div>
        
        <div className="relative z-10 flex flex-col items-start space-y-6">
           <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xl uppercase tracking-widest mb-4">
              <span className="material-icons">auto_stories</span>
              Jackometer
           </div>
           <h1 className="text-5xl font-sans font-bold leading-tight text-[var(--text-primary)]">
             The Jackometer <br />
             <span className="text-[var(--text-secondary)] font-serif italic text-4xl mt-2 block">Workstation & Business Engine</span>
           </h1>
           <p className="text-xl text-[var(--text-secondary)] max-w-md my-4">
             Unlock rigorous academic analysis, adaptive mocked exams, and hyper-realistic AI writing shields outperforming all market detectors directly inside your secure vault.
           </p>
           
           <div className="space-y-4 mt-8 w-full border-t border-[var(--border-color)] pt-8">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-[var(--panel-bg)] flex items-center justify-center shadow flex-shrink-0 text-[var(--primary)]">
                   <span className="material-icons">security</span>
                 </div>
                 <div>
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">Anti-Detector Shield</h4>
                    <p className="text-[var(--text-secondary)] text-sm">Intercept blocks using a built-in rewriting engine based on the 15-pattern structural framework.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-[var(--panel-bg)] flex items-center justify-center shadow flex-shrink-0 text-[var(--primary)]">
                   <span className="material-icons">school</span>
                 </div>
                 <div>
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">Adaptive Exam Testing</h4>
                    <p className="text-[var(--text-secondary)] text-sm">Build custom mock timed exams and flashcards derived solely from uploaded lectures.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Right Side - Action Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[400px] pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-[var(--primary)]/10 rounded-full blur-2xl"></div>
        </div>

        <div className="paper-panel p-10 w-full max-w-md flex flex-col justify-center relative z-10 border-t-4 border-[var(--primary)]">
          <div className="flex justify-center mb-8 lg:hidden">
             <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xl uppercase tracking-widest">
                <span className="material-icons">auto_stories</span>
                Jackometer
             </div>
          </div>

          <h2 className="text-3xl font-sans font-bold text-center text-[var(--text-primary)] mb-2">Access Portal</h2>
          <p className="text-center text-[var(--text-secondary)] mb-10 text-sm">Sign in to your encrypted academic vault.</p>

          <button 
            type="button"
            disabled={loading}
            onClick={handleGoogleLoginStart}
            className="w-full flex items-center justify-center gap-3 bg-[var(--panel-bg)] hover:bg-[var(--surface-color)] text-[var(--text-primary)] font-bold py-3 px-4 rounded-xl shadow border border-[var(--border-color)] transition-all mb-4"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span>{loading ? 'Authenticating...' : 'Sign in with Google'}</span>
          </button>
          
          <div className="text-center mt-6 text-xs text-[var(--text-secondary)]">
             <p>By signing in, you agree to the Terms of Service & Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

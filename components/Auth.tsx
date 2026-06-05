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
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[var(--bg-color)]">
      {/* Top / Left Side - Intro */}
      <div className="w-full lg:w-1/2 bg-[var(--surface-color)] lg:border-r border-[var(--border-color)] flex flex-col justify-center px-8 lg:px-20 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[var(--primary)]"></div>
        <div className="absolute -left-20 bottom-20 w-80 h-80 bg-[var(--primary)] rounded-full blur-3xl opacity-10"></div>
        
        <div className="relative z-10 flex flex-col items-start space-y-6">
           <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xl uppercase tracking-widest mb-4">
              <span className="material-icons">school</span>
              Jackometer
           </div>
           <h1 className="text-4xl lg:text-5xl font-sans font-bold leading-tight text-[var(--text-primary)]">
             Jackometer <br />
             <span className="text-[var(--text-secondary)] font-sans font-light text-2xl lg:text-3xl mt-2 block">Your Academic Assistant</span>
           </h1>
           <p className="text-lg lg:text-xl text-[var(--text-secondary)] max-w-md my-4">
             We are here to help you draft papers, review documents, and organize your academic research.
           </p>
           
           <div className="space-y-4 mt-4 lg:mt-8 w-full border-t border-[var(--border-color)] pt-6 lg:pt-8">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-[var(--panel-bg)] flex items-center justify-center shadow flex-shrink-0 text-[var(--primary)]">
                   <span className="material-icons">architecture</span>
                 </div>
                 <div>
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">Document Drafting</h4>
                    <p className="text-[var(--text-secondary)] text-sm">Draft academic papers rapidly with built-in research tools.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-[var(--panel-bg)] flex items-center justify-center shadow flex-shrink-0 text-[var(--primary)]">
                   <span className="material-icons">analytics</span>
                 </div>
                 <div>
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">Data Crunching</h4>
                    <p className="text-[var(--text-secondary)] text-sm">Analyze lab results and field trip data with easy-to-use insights.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Bottom / Right Side - Action Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[400px] pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-[var(--primary)]/10 rounded-full blur-2xl"></div>
        </div>

        <div className="paper-panel p-8 md:p-10 w-full max-w-md flex flex-col justify-center relative z-10 border-t-4 border-[var(--primary)] shadow-xl">
          <h2 className="text-3xl font-sans font-bold text-center text-[var(--text-primary)] mb-2">Welcome Back</h2>
          <p className="text-center text-[var(--text-secondary)] mb-10 text-sm">Sign in to your account.</p>

          <button 
            type="button"
            disabled={loading}
            onClick={handleGoogleLoginStart}
            className="w-full flex items-center justify-center gap-3 bg-[var(--panel-bg)] hover:bg-[var(--surface-color)] text-[var(--text-primary)] font-bold py-3 px-4 rounded-xl shadow border border-[var(--border-color)] transition-all mb-4"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
          
          <div className="text-center mt-6 text-xs text-[var(--text-secondary)]">
             <p>By signing in, you agree to the Terms of Service & Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

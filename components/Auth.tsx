import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    institution: '',
  });
  const [loading, setLoading] = useState(false);
  
  // Google Flow State: IDLE -> ACCOUNTS -> CONSENT -> PROCESSING
  const [googleStep, setGoogleStep] = useState<'IDLE' | 'ACCOUNTS' | 'CONSENT' | 'PROCESSING'>('IDLE');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<UserProfile | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Safety Timeout: Prevent infinite loading freeze
    const safetyTimer = setTimeout(() => {
        if(isMounted.current && loading) {
            setLoading(false);
            alert("Connection timed out. Please try again.");
        }
    }, 8000);
    
    // Simulate API call
    setTimeout(() => {
      clearTimeout(safetyTimer);
      if (!isMounted.current) return;
      onLogin({
        name: isSignup ? formData.fullName : 'Academic User',
        email: formData.email,
        institution: isSignup ? formData.institution : 'University of Science',
        role: 'Scholar',
        avatar: undefined
      });
    }, 1500);
  };

  // 1. Start Flow
  const handleGoogleLoginStart = () => {
    setLoading(true);
    // Simulate initial network request to auth provider
    setTimeout(() => {
       if (!isMounted.current) return;
       setLoading(false);
       setGoogleStep('ACCOUNTS');
    }, 800);
  };

  // 2. Select Account
  const handleAccountSelect = (account: UserProfile) => {
    setSelectedGoogleAccount(account);
    setGoogleStep('CONSENT');
  };

  // 3. Approve/Grant Permissions
  const handleConsent = () => {
    setGoogleStep('PROCESSING');
    
    const safetyTimer = setTimeout(() => {
        if(isMounted.current && googleStep === 'PROCESSING') {
            setGoogleStep('IDLE');
            alert("Google sign-in timed out. Please try again.");
        }
    }, 8000);

    // Simulate token exchange
    setTimeout(() => {
      clearTimeout(safetyTimer);
      if (!isMounted.current) return;
      if (selectedGoogleAccount) onLogin(selectedGoogleAccount);
    }, 1500);
  };

  const handleCancelGoogle = () => {
      setGoogleStep('IDLE');
      setSelectedGoogleAccount(null);
  };

  // --- SIMULATED GOOGLE OAUTH FLOW ---
  if (googleStep !== 'IDLE') {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center font-sans text-[#202124] animate-fade-in">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        `}</style>
        
        {googleStep === 'PROCESSING' ? (
           <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
              <p className="text-base font-medium font-sans">Signing in to Jackometer...</p>
           </div>
        ) : (
          <div className="w-full max-w-[450px] border border-[#dadce0] rounded-[8px] p-10 flex flex-col shadow-sm font-sans">
             {/* Header */}
             <div className="flex flex-col items-center mb-8">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-10 h-10 mb-4" alt="Google" />
                <h1 className="text-2xl font-medium mb-2 text-center">
                    {googleStep === 'ACCOUNTS' ? 'Sign in with Google' : 'Jackometer'}
                </h1>
                <p className="text-base text-center text-[#5f6368]">
                    {googleStep === 'ACCOUNTS' ? 'to continue to Jackometer' : 'wants access to your Google Account'}
                </p>
             </div>
             
             {/* STEP 1: CHOOSE ACCOUNT */}
             {googleStep === 'ACCOUNTS' && (
                 <div className="w-full space-y-1">
                    <div 
                      onClick={() => handleAccountSelect({
                        name: 'Scholar User',
                        email: 'scholar@gmail.com',
                        institution: 'Independent Researcher',
                        role: 'Scholar',
                        avatar: 'G'
                      })}
                      className="flex items-center gap-4 p-3 hover:bg-[#f8f9fa] rounded-sm cursor-pointer border-b border-[#f1f3f4] transition-colors"
                    >
                       <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">S</div>
                       <div className="flex-1">
                          <p className="text-sm font-medium text-[#3c4043]">Scholar User</p>
                          <p className="text-xs text-[#5f6368]">scholar@gmail.com</p>
                       </div>
                    </div>

                    <div 
                      onClick={() => handleAccountSelect({
                        name: 'Dr. Research Lead',
                        email: 'lead@university.edu',
                        institution: 'University of Science',
                        role: 'Professor',
                        avatar: 'D'
                      })}
                      className="flex items-center gap-4 p-3 hover:bg-[#f8f9fa] rounded-sm cursor-pointer border-b border-[#f1f3f4] transition-colors"
                    >
                       <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">D</div>
                       <div className="flex-1">
                          <p className="text-sm font-medium text-[#3c4043]">Dr. Research Lead</p>
                          <p className="text-xs text-[#5f6368]">lead@university.edu</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 hover:bg-[#f8f9fa] rounded-sm cursor-pointer transition-colors mt-2">
                       <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#5f6368]">
                          <span className="material-icons text-xl">person_add</span>
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-medium text-[#3c4043]">Use another account</p>
                       </div>
                    </div>
                 </div>
             )}

             {/* STEP 2: CONSENT */}
             {googleStep === 'CONSENT' && selectedGoogleAccount && (
                 <div className="w-full animate-fade-in">
                    <div className="border border-[#dadce0] rounded-full px-4 py-1 flex items-center gap-2 w-fit mx-auto mb-6 cursor-pointer hover:bg-[#f8f9fa]" onClick={() => setGoogleStep('ACCOUNTS')}>
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">{selectedGoogleAccount.name[0]}</div>
                        <span className="text-sm font-medium text-[#3c4043]">{selectedGoogleAccount.email}</span>
                        <span className="material-icons text-sm text-[#5f6368]">expand_more</span>
                    </div>

                    <div className="space-y-6 mb-8">
                        <div className="flex gap-4 items-start">
                            <span className="material-icons text-[#1a73e8] mt-1">person</span>
                            <p className="text-sm text-[#3c4043]">See your personal info, including any personal info you've made publicly available.</p>
                        </div>
                        <div className="flex gap-4 items-start">
                            <span className="material-icons text-[#1a73e8] mt-1">email</span>
                            <p className="text-sm text-[#3c4043]">See your primary Google Account email address.</p>
                        </div>
                        <div className="flex gap-4 items-start">
                             <span className="material-icons text-[#5f6368] mt-1">info</span>
                             <p className="text-xs text-[#5f6368]">Jackometer will use this to create your account and personalization.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={handleCancelGoogle} className="px-6 py-2 text-sm font-bold text-[#1a73e8] hover:bg-[#f6fafe] rounded transition-colors">Cancel</button>
                        <button onClick={handleConsent} className="px-6 py-2 text-sm font-bold text-white bg-[#1a73e8] hover:bg-[#1669d6] rounded shadow-sm transition-colors">Allow</button>
                    </div>
                 </div>
             )}

             <div className="mt-10 text-xs text-[#5f6368] w-full flex justify-between">
                <span>English (United States)</span>
                <div className="space-x-4">
                  <span>Help</span>
                  <span>Privacy</span>
                  <span>Terms</span>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // --- MAIN APP LOGIN PAGE ---
  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[var(--bg-color)]">
      {/* Left Side - Motivation */}
      <div className="hidden lg:flex w-1/2 bg-[var(--surface-color)] border-r border-[var(--border-color)] flex-col justify-center px-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[var(--primary)]"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -left-20 bottom-20 w-80 h-80 bg-purple-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative z-10">
          <h1 className="text-6xl font-serif font-bold text-[var(--text-primary)] mb-6 leading-tight">
            Stop Writing <br/> From Scratch.
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-8 leading-relaxed font-serif italic">
            "Jackometer architects your thesis, drafts your lab reports, and polishes your citations. Focus on the discovery, let AI handle the documentation."
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[var(--primary)]">
                 <span className="material-icons">auto_awesome</span>
               </div>
               <div>
                 <h3 className="font-bold text-[var(--text-primary)]">Zero-Draft Technology</h3>
                 <p className="text-sm text-[var(--text-secondary)]">Generate 100% unique starting points.</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                 <span className="material-icons">school</span>
               </div>
               <div>
                 <h3 className="font-bold text-[var(--text-primary)]">Supervisor Bias Decoder</h3>
                 <p className="text-sm text-[var(--text-secondary)]">Tailor content to your professor's style.</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                 <span className="material-icons">science</span>
               </div>
               <div>
                 <h3 className="font-bold text-[var(--text-primary)]">Real-time Lab Analysis</h3>
                 <p className="text-sm text-[var(--text-secondary)]">Analyze microscope slides instantly.</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-20 relative">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-10 relative">
            {/* Skills Submerging Symbols Animation - Enhanced Visibility */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[400px] pointer-events-none z-0">
                <style>{`
                  @keyframes submergeFloat {
                    0% { transform: translateY(20px) scale(0.8); opacity: 0; }
                    40% { opacity: 0.6; } /* Increased opacity for visibility */
                    60% { opacity: 0.6; }
                    100% { transform: translateY(-30px) scale(1.1); opacity: 0; }
                  }
                  .skill-symbol {
                    position: absolute;
                    animation: submergeFloat 6s infinite ease-in-out;
                    color: var(--accent);
                    opacity: 0;
                    user-select: none;
                  }
                `}</style>
                <span className="material-icons skill-symbol" style={{ left: '-5%', top: '60%', animationDelay: '0s', fontSize: '32px' }}>school</span>
                <span className="material-icons skill-symbol" style={{ right: '-5%', top: '20%', animationDelay: '1s', fontSize: '36px' }}>science</span>
                <span className="material-icons skill-symbol" style={{ left: '10%', top: '10%', animationDelay: '2s', fontSize: '24px' }}>psychology</span>
                <span className="material-icons skill-symbol" style={{ right: '10%', top: '80%', animationDelay: '3s', fontSize: '30px' }}>functions</span>
                <span className="material-icons skill-symbol" style={{ left: '50%', top: '-30%', animationDelay: '4s', fontSize: '28px' }}>history_edu</span>
                <span className="material-icons skill-symbol" style={{ left: '50%', bottom: '-30%', animationDelay: '2.5s', fontSize: '28px' }}>gavel</span>
                <span className="material-icons skill-symbol" style={{ right: '80%', top: '50%', animationDelay: '3.5s', fontSize: '40px' }}>biotech</span>
                <span className="material-icons skill-symbol" style={{ left: '80%', top: '40%', animationDelay: '1.5s', fontSize: '22px' }}>calculate</span>
            </div>

            <h2 className="text-4xl font-serif font-bold text-[var(--text-primary)] mb-2 relative z-10">Jackometer</h2>
            <p className="text-[var(--text-secondary)] uppercase tracking-widest text-xs font-bold relative z-10">Academic Intelligence Suite</p>
          </div>

          <div className="paper-panel p-8 rounded-xl shadow-xl bg-white relative z-10">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">
              {isSignup ? 'Start Your Research Journey' : 'Welcome Back, Scholar'}
            </h3>

            {/* Google Button */}
            <button 
              onClick={handleGoogleLoginStart}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors mb-6 shadow-sm group"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR CONTINUE WITH EMAIL</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-4 animate-fade-in-up">
                  <input 
                    name="fullName"
                    type="text" 
                    placeholder="Full Name" 
                    required={isSignup}
                    className="w-full"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  <input 
                    name="institution"
                    type="text" 
                    placeholder="University / Institution" 
                    className="w-full"
                    value={formData.institution}
                    onChange={handleChange}
                  />
                </div>
              )}
              
              <input 
                name="email"
                type="email" 
                placeholder="Email Address" 
                required
                className="w-full"
                value={formData.email}
                onChange={handleChange}
              />
              
              <input 
                name="password"
                type="password" 
                placeholder="Password" 
                required
                className="w-full"
                value={formData.password}
                onChange={handleChange}
              />

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition-all transform active:scale-95 flex justify-center items-center"
              >
                {loading ? (
                  <span className="material-icons animate-spin text-sm">refresh</span>
                ) : (
                  <span>{isSignup ? 'Create Account' : 'Login'}</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-[var(--text-secondary)]">
                {isSignup ? "Already have an account?" : "New to Jackometer?"}
                <button 
                  onClick={() => setIsSignup(!isSignup)} 
                  className="ml-2 text-[var(--accent)] font-bold hover:underline"
                >
                  {isSignup ? 'Login' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
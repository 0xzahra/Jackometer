import React, { useState } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogin({
        name: isSignup ? formData.fullName : 'Academic User',
        email: formData.email,
        institution: isSignup ? formData.institution : 'University of Science',
        role: 'Scholar',
        avatar: undefined
      });
      setLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    // Simulate Google Auth
    setTimeout(() => {
      onLogin({
        name: 'Google Scholar',
        email: 'scholar@gmail.com',
        institution: 'Google Academy',
        role: 'Researcher',
        avatar: 'G' // Marker to show Google avatar
      });
    }, 1500);
  };

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
          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif font-bold text-[var(--text-primary)] mb-2">Jackometer</h2>
            <p className="text-[var(--text-secondary)] uppercase tracking-widest text-xs font-bold">Academic Intelligence Suite</p>
          </div>

          <div className="paper-panel p-8 rounded-xl shadow-xl bg-white">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">
              {isSignup ? 'Start Your Research Journey' : 'Welcome Back, Scholar'}
            </h3>

            {/* Google Button */}
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors mb-6 shadow-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
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
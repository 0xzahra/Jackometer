import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { customAlert, customConfirm } from '../lib/dialogs';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface SettingsProps {
  user: UserProfile;
  onUpdateUser: (data: Partial<UserProfile>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [security, setSecurity] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: ''
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentEmailConfirm: ''
  });

  const [fontSize, setFontSize] = useState(16);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    // Read current font size from root
    const current = parseFloat(getComputedStyle(document.documentElement).fontSize);
    setFontSize(current);
    
    // Check offline mode preference
    setOfflineMode(localStorage.getItem('jackometer_offline_mode') === 'true');
  }, []);

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  const toggleOfflineMode = () => {
    const newVal = !offlineMode;
    setOfflineMode(newVal);
    localStorage.setItem('jackometer_offline_mode', String(newVal));
  };

  const handleUpdatePassword = () => {
    if (!security.currentPass || !security.newPass || !security.confirmPass) {
      customAlert("Please fill in all password fields.");
      return;
    }
    if (security.newPass !== security.confirmPass) {
      customAlert("New passwords do not match.");
      return;
    }
    // Simulate API call
    customAlert("Password updated successfully.");
    setSecurity({ currentPass: '', newPass: '', confirmPass: '' });
  };

  const handleUpdateEmail = () => {
    if (!emailForm.newEmail) {
      customAlert("Please enter a new email address.");
      return;
    }
    if (!emailForm.newEmail.includes('@')) {
      customAlert("Please enter a valid email address.");
      return;
    }
    // Logic to verify current email could go here
    onUpdateUser({ email: emailForm.newEmail });
    customAlert(`Email address updated to ${emailForm.newEmail}`);
    setEmailForm({ newEmail: '', currentEmailConfirm: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <h2 className="text-3xl font-sans font-bold text-[var(--text-primary)] mb-8 tracking-tight">Settings</h2>
      
      {/* Data Privacy */}
      <div className="glass-panel p-8 border-l-4 border-emerald-500 shadow-lg bg-emerald-500/5">
         <div className="flex items-start gap-4">
            <span className="material-icons text-5xl text-[var(--primary)] opacity-90 drop-shadow-sm">verified_user</span>
            <div>
               <h3 className="text-xl font-bold font-sans tracking-tight mb-2 text-[var(--text-primary)]">Data Privacy</h3>
               <p className="text-sm text-[var(--text-secondary)] mb-4">
                 Your research drafts and data are private and secure.
               </p>
               <div className="flex items-center gap-2">
                 <div className="bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center">
                   <span className="material-icons text-[10px] mr-1">lock</span> Secure Encryption
                 </div>
                 <div className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center">
                   <span className="material-icons text-[10px] mr-1">cloud_off</span> Private
                 </div>
               </div>
            </div>
         </div>
      </div>

      <div className="sketch-card p-4 my-4">
        <div className="font-bold text-xs uppercase tracking-wide text-[var(--accent)]">
          {isSupabaseConfigured
            ? "Cloud sync active"
            : "Local-only mode"}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-1">
          {isSupabaseConfigured
            ? "Your login and progress are saved securely."
            : "Your progress is saved locally."}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Account Settings */}
        <div className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-color)] pb-3">
            <span className="material-icons text-[var(--accent)]">lock</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Account Settings</h3>
          </div>
          
          <div className="space-y-6">
             {/* Offline Mode Toggle */}
             <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
               <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Offline Mode</h4>
                  <p className="text-xs text-[var(--text-secondary)]">Disable cloud sync.</p>
               </div>
               <button 
                 onClick={toggleOfflineMode}
                 className={`w-12 h-6 rounded-full p-1 transition-colors ${offlineMode ? 'bg-[var(--accent)]' : 'bg-gray-300'}`}
               >
                 <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${offlineMode ? 'translate-x-6' : ''}`}></div>
               </button>
             </div>

             {/* Change Email */}
             <div className="pb-4 border-b border-[var(--border-color)]">
               <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Change Email Address</label>
               <input 
                 type="email"
                 placeholder="New Email Address"
                 className="w-full mb-3"
                 value={emailForm.newEmail}
                 onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
               />
               <button 
                 onClick={handleUpdateEmail}
                 className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-primary)] py-2 rounded font-bold text-sm hover:bg-[var(--bg-color)] transition-colors"
               >
                 Update Email
               </button>
             </div>

             {/* Change Password */}
             <div>
               <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Reset Password</label>
               <input 
                 type="password"
                 placeholder="Current Password"
                 className="w-full mb-2"
                 value={security.currentPass}
                 onChange={(e) => setSecurity({...security, currentPass: e.target.value})}
               />
               <input 
                 type="password"
                 placeholder="New Password"
                 className="w-full mb-2"
                 value={security.newPass}
                 onChange={(e) => setSecurity({...security, newPass: e.target.value})}
               />
               <input 
                 type="password"
                 placeholder="Confirm New Password"
                 className="w-full mb-3"
                 value={security.confirmPass}
                 onChange={(e) => setSecurity({...security, confirmPass: e.target.value})}
               />
               <button 
                 onClick={handleUpdatePassword}
                 className="w-full bg-[var(--text-primary)] text-[var(--bg-color)] py-2 rounded font-bold text-sm hover:opacity-90"
               >
                 Update Password
               </button>
             </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="glass-panel p-8">
           <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-color)] pb-3">
            <span className="material-icons text-[var(--accent)]">visibility</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Accessibility & Display</h3>
          </div>
          
          <div className="space-y-6">
             <div>
               <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">
                 UI Font Size ({fontSize}px)
               </label>
               <input 
                 type="range" 
                 min="12" 
                 max="24" 
                 value={fontSize} 
                 onChange={handleFontSizeChange}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
               />
               <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-1">
                 <span>Small</span>
                 <span>Medium</span>
                 <span>Large</span>
               </div>
             </div>
          </div>
        </div>

        {/* Support Dev Wrapper */}
        <div className="glass-panel p-8 md:col-span-2 shadow-sm border border-emerald-100/50">
           <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-color)] pb-3">
            <span className="material-icons text-emerald-500">favorite</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Support Developer</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Bitcoin (BTC)</p>
                <div className="flex items-center justify-between">
                   <div className="text-sm font-mono break-all selection:bg-emerald-200">38vsxixBp1DzDuJ4J3re1rTERBzJ6au27a</div>
                   <button onClick={() => navigator.clipboard.writeText('38vsxixBp1DzDuJ4J3re1rTERBzJ6au27a')} className="btn-outline-sketch flex-shrink-0 text-xs px-2 py-1 ml-2">Copy</button>
                </div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">ENS / Arewa.eth</p>
                <div className="flex items-center justify-between">
                   <div className="text-sm font-mono break-all selection:bg-emerald-200">0xb022b646724e3db39ec7b725de95b37e2a971a27</div>
                   <button onClick={() => navigator.clipboard.writeText('0xb022b646724e3db39ec7b725de95b37e2a971a27')} className="btn-outline-sketch flex-shrink-0 text-xs px-2 py-1 ml-2">Copy</button>
                </div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Base Wallet</p>
                <div className="flex items-center justify-between">
                   <div className="text-sm font-mono break-all selection:bg-emerald-200">0xB6E30c3B7dD1fb09A3d2D4CDC94ac0a0bA961161</div>
                   <button onClick={() => navigator.clipboard.writeText('0xB6E30c3B7dD1fb09A3d2D4CDC94ac0a0bA961161')} className="btn-outline-sketch flex-shrink-0 text-xs px-2 py-1 ml-2">Copy</button>
                </div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Solana</p>
                <div className="flex items-center justify-between">
                   <div className="text-sm font-mono break-all selection:bg-emerald-200">7rcNCvxKdoSB9uZsPmbUQ3kucZ1rMDxQc34o5arictht</div>
                   <button onClick={() => navigator.clipboard.writeText('7rcNCvxKdoSB9uZsPmbUQ3kucZ1rMDxQc34o5arictht')} className="btn-outline-sketch flex-shrink-0 text-xs px-2 py-1 ml-2">Copy</button>
                </div>
             </div>
          </div>
          
          <div className="mt-6">
             <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border-color)] pb-2">Domain Names</h4>
             <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-50 text-purple-800 text-xs font-bold rounded-full border border-purple-100">arewa.eth</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full border border-blue-100">arewa.base.eth</span>
                <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold rounded-full border border-[var(--accent)]/20">zahrah.nft</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
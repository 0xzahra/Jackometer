import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

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
      alert("Please fill in all password fields.");
      return;
    }
    if (security.newPass !== security.confirmPass) {
      alert("New passwords do not match.");
      return;
    }
    // Simulate API call
    alert("Password updated successfully.");
    setSecurity({ currentPass: '', newPass: '', confirmPass: '' });
  };

  const handleUpdateEmail = () => {
    if (!emailForm.newEmail) {
      alert("Please enter a new email address.");
      return;
    }
    if (!emailForm.newEmail.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    // Logic to verify current email could go here
    onUpdateUser({ email: emailForm.newEmail });
    alert(`Email address updated to ${emailForm.newEmail}`);
    setEmailForm({ newEmail: '', currentEmailConfirm: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <h2 className="text-3xl font-sans font-bold text-[var(--text-primary)] mb-8 tracking-tight">System Configuration</h2>
      
      {/* Academic Integrity Vault */}
      <div className="glass-panel p-8 border-l-4 border-emerald-500 shadow-lg bg-emerald-500/5">
         <div className="flex items-start gap-4">
            <span className="material-icons text-5xl text-[var(--primary)] opacity-90 drop-shadow-sm">verified_user</span>
            <div>
               <h3 className="text-xl font-bold font-sans tracking-tight mb-2 text-[var(--text-primary)]">Academic Integrity Vault</h3>
               <p className="text-sm text-[var(--text-secondary)] mb-4">
                 Your research data, generated drafts, and uploaded lab results are strictly confidential. 
                 They are <strong>never</strong> used to train public AI models.
               </p>
               <div className="flex items-center gap-2">
                 <div className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center">
                   <span className="material-icons text-[10px] mr-1">lock</span> End-to-End Encryption
                 </div>
                 <div className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center">
                   <span className="material-icons text-[10px] mr-1">cloud_off</span> No Training Data
                 </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Account Security */}
        <div className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-color)] pb-3">
            <span className="material-icons text-[var(--accent)]">lock</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Account Security</h3>
          </div>
          
          <div className="space-y-6">
             {/* Offline Mode Toggle */}
             <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
               <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Offline Draft Mode</h4>
                  <p className="text-xs text-[var(--text-secondary)]">Disable cloud sync for sensitive work.</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Bitcoin (BTC)</p>
                <div className="text-sm font-mono break-all selection:bg-emerald-200">38vsxixBp1DzDuJ4J3re1rTERBzJ6au27a</div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Fractal Unisat</p>
                <div className="text-sm font-mono break-all selection:bg-emerald-200">bc1qncuzw003jsnys5fq00jx3gxsdurp740zn0vzlh</div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Arewa.eth</p>
                <div className="text-sm font-mono break-all selection:bg-emerald-200">0xb022b646724e3db39ec7b725de95b37e2a971a27</div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Zahranft1.crypto</p>
                <div className="text-sm font-mono break-all selection:bg-emerald-200">0xc5c2bc5b9f11336d8ae79bb67ba7a21d0b825457</div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Farcaster Base</p>
                <div className="text-sm font-mono break-all selection:bg-emerald-200">0xEBB6466D179bed52B00a1d186a7c26b35a635D5e</div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Base App</p>
                <div className="text-sm font-mono break-all selection:bg-emerald-200">0xB6E30c3B7dD1fb09A3d2D4CDC94ac0a0bA961161</div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Main Sol Wallet</p>
                <div className="text-sm font-mono break-all selection:bg-emerald-200">G4MdPDCZ98MApcQSFsC6AButjL7Jb4kS8mVoFqXFVsTS</div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Sol Wallets</p>
                <div className="text-sm font-mono break-all space-y-2 selection:bg-emerald-200">
                   <div>7rcNCvxKdoSB9uZsPmbUQ3kucZ1rMDxQc34o5arictht</div>
                   <div>FMNn2BdyV24imiL1GVmEBgDQe4U6UiSC8ntwGuXbAyAV</div>
                   <div>pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn</div>
                </div>
             </div>
             <div className="bg-[var(--surface-color)] p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Aptos</p>
                <div className="text-sm font-mono break-all selection:bg-emerald-200">0x5320f25f7671012e716889491affa7625797d576429134126de490d5cfee05c9</div>
             </div>
          </div>
          
          <div className="mt-6">
             <h4 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">Domain Names</h4>
             <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full border border-blue-100">zahrah.nft</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full border border-blue-100">zahranft1.crypto</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-800 text-xs font-bold rounded-full border border-purple-100">arewa.eth</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full border border-blue-100">arewa.base.eth</span>
                <span className="px-3 py-1 bg-green-50 text-green-800 text-xs font-bold rounded-full border border-green-100">zahrah.near</span>
                <span className="px-3 py-1 bg-orange-50 text-orange-800 text-xs font-bold rounded-full border border-orange-100">techbro.btc</span>
                <span className="px-3 py-1 bg-cyan-50 text-cyan-800 text-xs font-bold rounded-full border border-cyan-100">realwordasset.ton</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-100">artemis0@tether.me</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
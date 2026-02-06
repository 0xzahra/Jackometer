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
      <h2 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-8">System Configuration</h2>
      
      {/* Academic Integrity Vault */}
      <div className="paper-panel p-8 rounded-sm border-l-4 border-black">
         <div className="flex items-start gap-4">
            <span className="material-icons text-4xl text-black opacity-80">verified_user</span>
            <div>
               <h3 className="text-xl font-bold font-serif mb-2">Academic Integrity Vault</h3>
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
        <div className="paper-panel p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-color)] pb-2">
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
        <div className="paper-panel p-8 rounded-sm">
           <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-color)] pb-2">
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
      </div>
    </div>
  );
};
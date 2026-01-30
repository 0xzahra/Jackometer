import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [contact, setContact] = useState({
    email: 'scholar@university.edu',
    phone: '+1 (555) 000-0000',
    recoveryEmail: ''
  });

  const [security, setSecurity] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: ''
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <h2 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-8">System Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Account Security */}
        <div className="paper-panel p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-color)] pb-2">
            <span className="material-icons text-[var(--accent)]">lock</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Account Security</h3>
          </div>
          
          <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Reset Password</label>
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
                 className="w-full"
                 value={security.confirmPass}
                 onChange={(e) => setSecurity({...security, confirmPass: e.target.value})}
               />
             </div>
             <button className="w-full bg-[var(--text-primary)] text-[var(--bg-color)] py-2 rounded font-bold text-sm hover:opacity-90">
               Update Password
             </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="paper-panel p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-color)] pb-2">
            <span className="material-icons text-[var(--accent)]">contact_mail</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Contact Information</h3>
          </div>

          <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Primary Email</label>
               <input 
                 value={contact.email}
                 onChange={(e) => setContact({...contact, email: e.target.value})}
                 className="w-full"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Phone Number</label>
               <input 
                 value={contact.phone}
                 onChange={(e) => setContact({...contact, phone: e.target.value})}
                 className="w-full"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Recovery Email</label>
               <input 
                 value={contact.recoveryEmail}
                 onChange={(e) => setContact({...contact, recoveryEmail: e.target.value})}
                 className="w-full"
                 placeholder="Optional"
               />
             </div>
             <button className="w-full border border-[var(--border-color)] text-[var(--text-primary)] py-2 rounded font-bold text-sm hover:bg-[var(--bg-color)]">
               Save Changes
             </button>
          </div>
        </div>
      </div>

      {/* Live Support */}
      <div className="paper-panel p-8 rounded-sm border-l-4 border-green-500 flex flex-col md:flex-row items-center justify-between">
         <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-1">Live Support</h2>
            <p className="text-[var(--text-secondary)] text-sm">Encountering bugs or need research assistance? We are online.</p>
            <p className="text-[10px] text-green-600 font-bold mt-1 uppercase flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> Agents Active
            </p>
         </div>
         <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-green-700 shadow-lg flex items-center">
           <span className="material-icons mr-2">headset_mic</span>
           Start Chat
         </button>
      </div>

      {/* Refined Donation Section */}
      <div className="paper-panel p-0 rounded-sm overflow-hidden border-none shadow-xl">
         <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <span className="material-icons text-9xl">currency_bitcoin</span>
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">Support Development</h2>
            <p className="text-slate-400 text-sm max-w-lg mb-6">
               Jackometer is free and open. Your contributions power our high-performance GPU clusters for deeper research analysis.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* ETH Card */}
               <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-blue-400">ETH / BASE</span>
                     <span className="material-icons text-slate-500 group-hover:text-white">content_copy</span>
                  </div>
                  <code className="text-xs text-slate-300 break-all font-mono block bg-slate-900/50 p-2 rounded">
                     arewa.base.eth
                  </code>
               </div>

               {/* NFT Card */}
               <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-purple-400">NFT Domain</span>
                     <span className="material-icons text-slate-500 group-hover:text-white">content_copy</span>
                  </div>
                  <code className="text-xs text-slate-300 break-all font-mono block bg-slate-900/50 p-2 rounded">
                     zahrah.nft
                  </code>
               </div>
            </div>
         </div>
      </div>

      <div className="text-center text-xs text-[var(--text-secondary)] font-serif italic pt-4">
        Jackometer v2050. Enterprise Core License Active.
      </div>
    </div>
  );
};
import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [user, setUser] = useState({
    name: 'Academic User',
    university: 'Oxford University',
    role: 'PhD Candidate',
    theme: 'Paper Mode'
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-8">System Configuration</h2>
      
      <div className="paper-panel p-8 rounded-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-color)] pb-2">Profile Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Display Name</label>
            <input 
              value={user.name} 
              onChange={(e) => setUser({...user, name: e.target.value})} 
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Institution</label>
            <input 
              value={user.university} 
              onChange={(e) => setUser({...user, university: e.target.value})} 
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Support Section */}
         <div className="paper-panel p-8 rounded-sm border-l-4 border-yellow-500">
            <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-4">Support the Dev</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-4">Keep the servers alive with a donation.</p>
            <div className="space-y-2">
               <div className="bg-[var(--bg-color)] p-3 rounded text-xs flex justify-between cursor-pointer border border-[var(--border-color)]">
                  <span>ETH/BASE: arewa.base.eth</span>
                  <span className="material-icons text-[10px]">content_copy</span>
               </div>
               <div className="bg-[var(--bg-color)] p-3 rounded text-xs flex justify-between cursor-pointer border border-[var(--border-color)]">
                  <span>NFT: zahrah.nft</span>
                  <span className="material-icons text-[10px]">content_copy</span>
               </div>
            </div>
         </div>

         {/* Live Help */}
         <div className="paper-panel p-8 rounded-sm border-l-4 border-green-500">
            <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-4">Live Support</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-4">Encountering bugs?</p>
            <button className="w-full bg-green-600 text-white py-2 rounded font-bold text-sm hover:bg-green-700">Start Live Chat</button>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 text-center">Average wait: 2 mins</p>
         </div>
      </div>

      <div className="text-center text-xs text-[var(--text-secondary)] font-serif italic mt-8">
        Jackometer v2050. Enterprise Core License Active.
      </div>
    </div>
  );
};
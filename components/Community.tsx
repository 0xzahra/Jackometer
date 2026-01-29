import React from 'react';

export const Community: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Donations & Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="paper-panel p-8 rounded-sm border-l-4 border-yellow-500">
            <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-4">Donate / Support</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-4">Keep the servers alive.</p>
            <div className="space-y-2">
               <div className="bg-[var(--bg-color)] p-3 rounded text-xs flex justify-between cursor-pointer">
                  <span>ETH/BASE: arewa.base.eth</span>
                  <span className="material-icons text-[10px]">content_copy</span>
               </div>
               <div className="bg-[var(--bg-color)] p-3 rounded text-xs flex justify-between cursor-pointer">
                  <span>NFT: zahrah.nft</span>
                  <span className="material-icons text-[10px]">content_copy</span>
               </div>
            </div>
         </div>
         <div className="paper-panel p-8 rounded-sm border-l-4 border-green-500">
            <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-4">Live Support</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-4">Issues with generation?</p>
            <button className="w-full bg-green-600 text-white py-2 rounded font-bold text-sm">Start Live Chat</button>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 text-center">Average wait: 2 mins</p>
         </div>
      </div>

      {/* The Lounge */}
      <div className="paper-panel p-6 rounded-sm h-96 flex flex-col relative bg-[var(--panel-bg)]">
         <h3 className="text-xl font-bold font-serif text-[var(--text-primary)] mb-4 flex items-center pb-4 border-b border-[var(--border-color)]">
           <span className="material-icons mr-2 text-[var(--text-secondary)]">forum</span>
           The Scholar's Lounge
         </h3>
         
         <div className="flex-1 overflow-y-auto space-y-4 pr-2">
           {[1, 2, 3].map((i) => (
             <div key={i} className="flex items-start space-x-3">
               <div className="w-8 h-8 rounded-full bg-[var(--bg-color)] border border-[var(--border-color)] flex items-center justify-center font-serif text-xs font-bold text-[var(--text-secondary)]">
                 UE
               </div>
               <div className="bg-[var(--bg-color)] p-3 rounded-lg rounded-tl-none max-w-md border border-[var(--border-color)]">
                 <p className="text-xs text-[var(--text-secondary)] mb-1 font-bold">User_Elite_{i}0{i}</p>
                 <p className="text-sm text-[var(--text-primary)] font-serif">Just finished my dissertation using the new Thesis Forge. The citations are spotless.</p>
               </div>
             </div>
           ))}
         </div>

         <div className="mt-4 flex bg-[var(--bg-color)] rounded border border-[var(--border-color)] p-1">
           <input 
             type="text" 
             placeholder="Broadcast message to network..." 
             className="flex-1 bg-transparent p-3 text-[var(--text-primary)] outline-none font-serif"
           />
           <button className="bg-[var(--accent)] text-white px-6 rounded text-sm font-bold uppercase tracking-wider">
             Send
           </button>
         </div>
      </div>
    </div>
  );
};
import React from 'react';

export const Inbox: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-6">Inbox</h2>
      
      <div className="flex-1 paper-panel rounded-sm overflow-hidden flex">
        <div className="w-1/3 border-r border-[var(--border-color)] bg-[var(--bg-color)] overflow-y-auto">
          {[1,2,3].map(i => (
            <div key={i} className="p-4 border-b border-[var(--border-color)] hover:bg-[var(--panel-bg)] cursor-pointer">
              <p className="font-bold text-sm text-[var(--text-primary)]">System Admin</p>
              <p className="text-xs text-[var(--text-secondary)] truncate">Update regarding your recent Research...</p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1 opacity-60">2 hrs ago</p>
            </div>
          ))}
        </div>
        <div className="w-2/3 p-8 flex flex-col justify-center items-center text-[var(--text-secondary)]">
           <span className="material-icons text-4xl mb-2 opacity-50">mail_outline</span>
           <p>Select a message to read</p>
        </div>
      </div>
    </div>
  );
};
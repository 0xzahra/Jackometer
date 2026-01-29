import React from 'react';

export const Notifications: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-6">Notifications</h2>
      
      <div className="space-y-4">
        {[
          { icon: 'school', title: 'Research Complete', desc: 'Your topic on "Quantum Physics" has been processed.', time: '10 mins ago' },
          { icon: 'update', title: 'System Update', desc: 'Jackometer v2051 patch applied.', time: '1 hour ago' },
          { icon: 'forum', title: 'New Comment', desc: 'User_Elite replied to your thread.', time: '2 hours ago' }
        ].map((n, i) => (
          <div key={i} className="paper-panel p-4 rounded-sm flex items-start">
             <div className="w-10 h-10 rounded-full bg-[var(--bg-color)] flex items-center justify-center mr-4">
               <span className="material-icons text-[var(--accent)]">{n.icon}</span>
             </div>
             <div>
               <h4 className="font-bold text-[var(--text-primary)] text-sm">{n.title}</h4>
               <p className="text-xs text-[var(--text-secondary)]">{n.desc}</p>
               <p className="text-[10px] text-[var(--text-secondary)] mt-1 opacity-60">{n.time}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
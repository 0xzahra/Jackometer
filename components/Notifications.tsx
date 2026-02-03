import React, { useState } from 'react';
import { NotificationItem, AppView } from '../types';

interface NotificationsProps {
  setView: (view: AppView) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ setView }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', icon: 'school', title: 'Research Complete', desc: 'Your topic on "Quantum Physics" has been processed successfully. You can now view the generated chapters in the Research Engine.', time: '10 mins ago', read: false, type: 'RESEARCH', targetView: AppView.RESEARCH },
    { id: '2', icon: 'update', title: 'System Update', desc: 'Jackometer v2051 patch applied. New features include improved weather estimation and updated APA citation styles.', time: '1 hour ago', read: false, type: 'SYSTEM', targetView: AppView.SETTINGS },
    { id: '3', icon: 'forum', title: 'New Comment', desc: 'Dr. Sarah Connor replied to your thread in Global Researchers: "This is a fascinating approach..."', time: '2 hours ago', read: true, type: 'SOCIAL', targetView: AppView.COMMUNITY }
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    // Mark as read when expanded
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleRedirect = (n: NotificationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (n.targetView) {
      setView(n.targetView);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">Notifications</h2>
        <button onClick={markAllRead} className="text-xs text-[var(--accent)] font-bold hover:underline">Mark all as read</button>
      </div>
      
      <div className="space-y-4">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`paper-panel rounded-sm cursor-pointer transition-all duration-200 border-l-4 ${n.read ? 'border-transparent opacity-80' : 'border-[var(--accent)] shadow-md'}`}
            onClick={() => toggleExpand(n.id)}
          >
             <div className="p-4 flex items-start">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${n.read ? 'bg-gray-200 text-gray-500' : 'bg-[var(--bg-color)] text-[var(--accent)]'}`}>
                 <span className="material-icons">{n.icon}</span>
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-sm ${n.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>{n.title}</h4>
                    <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-color)] px-2 py-1 rounded">{n.type}</span>
                 </div>
                 <p className={`text-xs mt-1 ${expandedId === n.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] truncate'}`}>
                   {n.desc}
                 </p>
                 <div className="flex justify-between items-center mt-2">
                   <p className="text-[10px] text-[var(--text-secondary)] opacity-60">{n.time}</p>
                   {expandedId === n.id ? <span className="material-icons text-xs text-[var(--text-secondary)]">expand_less</span> : <span className="material-icons text-xs text-[var(--text-secondary)]">expand_more</span>}
                 </div>
               </div>
             </div>
             
             {/* Action Area when expanded */}
             {expandedId === n.id && n.targetView && (
               <div className="px-4 pb-4 pl-18 flex justify-end border-t border-[var(--border-color)] pt-2 bg-[var(--bg-color)]">
                  <button 
                    onClick={(e) => handleRedirect(n, e)}
                    className="text-xs font-bold text-[var(--accent)] uppercase hover:underline flex items-center gap-1"
                  >
                    Go to {n.type === 'SOCIAL' ? 'Community' : n.type === 'RESEARCH' ? 'Research' : 'Settings'} <span className="material-icons text-sm">arrow_forward</span>
                  </button>
               </div>
             )}
          </div>
        ))}

        {notifications.length === 0 && (
          <p className="text-center text-[var(--text-secondary)] italic mt-10">No new notifications.</p>
        )}
      </div>
    </div>
  );
};
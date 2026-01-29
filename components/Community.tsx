import React, { useState } from 'react';
import { Group, Message } from '../types';

export const Community: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [input, setInput] = useState('');
  
  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'Global Researchers', description: 'General academic discussion', memberCount: 1205, isJoined: false },
    { id: '2', name: 'Bio-Systematics Core', description: 'Specialized group for biology majors', memberCount: 450, isJoined: false },
    { id: '3', name: 'Thesis Survivors', description: 'Support group for final year students', memberCount: 3200, isJoined: false },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'Dr. Smith', content: 'Has anyone seen the latest paper on CRISPR?', timestamp: '10:00 AM', reactions: { '👍': 5 } },
    { id: '2', sender: 'Student_99', content: 'Yes, I linked it in the files section.', timestamp: '10:05 AM', reactions: {} }
  ]);

  const joinGroup = (id: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, isJoined: true } : g));
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simulate upload
    const file = e.target.files?.[0];
    if (file) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'You',
        content: `Uploaded: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: {},
        media: 'file_icon'
      };
      setMessages([...messages, newMsg]);
    }
  };

  const currentGroupData = groups.find(g => g.id === activeGroup);

  return (
    <div className="w-full h-full max-w-6xl mx-auto flex gap-6">
      {/* Groups List */}
      <div className="w-1/3 paper-panel flex flex-col overflow-hidden">
         <div className="p-4 border-b border-[var(--border-color)] bg-[var(--surface-color)]">
           <h2 className="text-xl font-serif font-bold text-[var(--text-primary)]">Groups</h2>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-2">
           {groups.map(g => (
             <div 
               key={g.id} 
               className={`p-4 rounded-lg cursor-pointer border transition-colors ${activeGroup === g.id ? 'bg-[var(--primary)] text-white border-transparent' : 'bg-[var(--surface-color)] border-[var(--border-color)] hover:bg-[var(--bg-color)]'}`}
               onClick={() => g.isJoined ? setActiveGroup(g.id) : null}
             >
                <div className="flex justify-between items-start">
                  <h3 className={`font-bold ${activeGroup === g.id ? 'text-white' : 'text-[var(--text-primary)]'}`}>{g.name}</h3>
                  {!g.isJoined && <span className="material-icons text-xs opacity-50">lock</span>}
                </div>
                <p className={`text-xs mt-1 ${activeGroup === g.id ? 'text-white opacity-80' : 'text-[var(--text-secondary)]'}`}>{g.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className={`text-[10px] ${activeGroup === g.id ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{g.memberCount} Members</span>
                  {!g.isJoined && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); joinGroup(g.id); }}
                      className="text-xs bg-[var(--accent)] text-white px-3 py-1 rounded font-bold hover:opacity-90"
                    >
                      Join
                    </button>
                  )}
                </div>
             </div>
           ))}
         </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 paper-panel flex flex-col overflow-hidden bg-[var(--surface-color)] relative">
         {!activeGroup ? (
           <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50 p-8 text-center">
             <span className="material-icons text-6xl mb-4">groups</span>
             <p className="font-serif text-xl">Select a joined group to view messages.</p>
           </div>
         ) : (
           <>
             {/* Chat Header */}
             <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--panel-bg)]">
               <div>
                 <h3 className="font-bold text-[var(--text-primary)]">{currentGroupData?.name}</h3>
                 <p className="text-xs text-[var(--text-secondary)]">{currentGroupData?.memberCount} scholars online</p>
               </div>
               <button className="text-[var(--text-secondary)] hover:text-[var(--primary)]">
                 <span className="material-icons">info</span>
               </button>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.map(m => (
                 <div key={m.id} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                   <div className="flex items-baseline space-x-2 mb-1">
                     <span className="text-xs font-bold text-[var(--text-primary)]">{m.sender}</span>
                     <span className="text-[10px] text-[var(--text-secondary)]">{m.timestamp}</span>
                   </div>
                   <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.sender === 'You' ? 'bg-[var(--primary)] text-white rounded-tr-none' : 'bg-[var(--bg-color)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]'}`}>
                     {m.media ? (
                       <div className="flex items-center space-x-2 italic"><span className="material-icons">attachment</span> <span>{m.content}</span></div>
                     ) : (
                       m.content
                     )}
                   </div>
                   {Object.keys(m.reactions).length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {Object.entries(m.reactions).map(([emoji, count]) => (
                          <span key={emoji} className="text-[10px] bg-[var(--bg-color)] px-1 rounded border border-[var(--border-color)]">{emoji} {count}</span>
                        ))}
                      </div>
                   )}
                 </div>
               ))}
             </div>

             {/* Input Area */}
             <div className="p-4 border-t border-[var(--border-color)] bg-[var(--panel-bg)]">
               <div className="flex items-center space-x-2">
                 <label className="cursor-pointer text-[var(--text-secondary)] hover:text-[var(--primary)]">
                   <span className="material-icons">add_photo_alternate</span>
                   <input type="file" className="hidden" onChange={handleFileUpload} />
                 </label>
                 <button className="text-[var(--text-secondary)] hover:text-[var(--primary)]">
                   <span className="material-icons">mic</span>
                 </button>
                 <input 
                   className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                   placeholder="Type a message..."
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                 />
                 <button onClick={sendMessage} className="text-[var(--primary)]">
                   <span className="material-icons">send</span>
                 </button>
               </div>
             </div>
           </>
         )}
      </div>
    </div>
  );
};
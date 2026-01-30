import React, { useState } from 'react';
import { Message } from '../types';

export const Inbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'System Admin', 
      subject: 'Research Update: Quantum Physics', 
      content: 'Your research topic "Quantum Physics" has finished processing deep analysis. The results are available in your Research Engine vault. Please review the attached chapters.', 
      timestamp: '2 hrs ago',
      read: false,
      reactions: {}
    },
    { 
      id: '2', 
      sender: 'Dr. Emily', 
      subject: 'Re: Field Trip Review', 
      content: 'I reviewed your field trip submission for the BUK trip. The data tables look solid, but the conclusion needs more citations. Can you add 3 more sources?', 
      timestamp: 'Yesterday',
      read: true,
      reactions: {}
    },
    { 
      id: '3', 
      sender: 'Community Bot', 
      subject: 'Welcome to Global Researchers', 
      content: 'Thanks for joining the Global Researchers group! Feel free to introduce yourself in the general channel.', 
      timestamp: '2 days ago',
      read: true,
      reactions: {}
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    // Mark as read
    setMessages(messages.map(m => m.id === msg.id ? { ...m, read: true } : m));
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-6">Inbox</h2>
      
      <div className="flex-1 paper-panel rounded-sm overflow-hidden flex flex-col md:flex-row border border-[var(--border-color)]">
        
        {/* Message List */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[var(--border-color)] bg-[var(--bg-color)] overflow-y-auto">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              onClick={() => handleSelectMessage(msg)}
              className={`p-4 border-b border-[var(--border-color)] cursor-pointer transition-colors hover:bg-[var(--panel-bg)] ${selectedMessage?.id === msg.id ? 'bg-[var(--surface-color)] border-l-4 border-l-[var(--accent)]' : ''} ${!msg.read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className={`text-sm ${!msg.read ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>{msg.sender}</p>
                <p className="text-[10px] text-[var(--text-secondary)] opacity-70">{msg.timestamp}</p>
              </div>
              <p className="text-xs font-bold text-[var(--text-primary)] truncate mb-1">{msg.subject}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate opacity-80">{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Message Detail */}
        <div className="w-full md:w-2/3 bg-[var(--surface-color)] flex flex-col">
           {selectedMessage ? (
             <div className="flex flex-col h-full">
               <div className="p-6 border-b border-[var(--border-color)]">
                 <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{selectedMessage.subject}</h3>
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">{selectedMessage.sender[0]}</div>
                     <div>
                       <p className="text-sm font-bold text-[var(--text-primary)]">{selectedMessage.sender}</p>
                       <p className="text-xs text-[var(--text-secondary)]">to me</p>
                     </div>
                   </div>
                   <p className="text-xs text-[var(--text-secondary)]">{selectedMessage.timestamp}</p>
                 </div>
               </div>
               
               <div className="p-8 flex-1 overflow-y-auto">
                 <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                   {selectedMessage.content}
                 </p>
               </div>

               <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-color)] flex gap-2">
                 <button className="flex-1 bg-[var(--accent)] text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90">
                   <span className="material-icons text-sm">reply</span> Reply
                 </button>
                 <button className="px-4 border border-[var(--border-color)] rounded hover:bg-red-50 text-red-500">
                   <span className="material-icons">delete</span>
                 </button>
               </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col justify-center items-center text-[var(--text-secondary)]">
                <span className="material-icons text-6xl mb-4 opacity-30">mail_outline</span>
                <p className="font-serif italic">Select a message to read</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Message, AppView } from '../types';

interface InboxProps {
  setView: (view: AppView) => void;
}

export const Inbox: React.FC<InboxProps> = ({ setView }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'System Admin', 
      subject: 'Research Update: Quantum Physics', 
      content: 'Your research topic "Quantum Physics" has finished processing deep analysis. The results are available in your Research Engine vault. Please review the attached chapters.', 
      timestamp: '2 hrs ago',
      read: false,
      reactions: {},
      targetView: AppView.RESEARCH
    },
    { 
      id: '2', 
      sender: 'Dr. Emily', 
      subject: 'Re: Field Trip Review', 
      content: 'I reviewed your field trip submission for the BUK trip. The data tables look solid, but the conclusion needs more citations. Can you add 3 more sources?', 
      timestamp: 'Yesterday',
      read: true,
      reactions: {},
      targetView: AppView.FIELD_TRIP
    },
    { 
      id: '3', 
      sender: 'Community Bot', 
      subject: 'Welcome to Global Researchers', 
      content: 'Thanks for joining the Global Researchers group! Feel free to introduce yourself in the general channel.', 
      timestamp: '2 days ago',
      read: true,
      reactions: {},
      targetView: AppView.COMMUNITY
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // Compose State
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    // Mark as read
    setMessages(messages.map(m => m.id === msg.id ? { ...m, read: true } : m));
    setReplyMode(false);
    setReplyText('');
  };

  const handleRedirect = (view: AppView) => {
    setView(view);
  };

  const handleDelete = (msgId: string) => {
    setMessages(messages.filter(m => m.id !== msgId));
    if (selectedMessage?.id === msgId) {
      setSelectedMessage(null);
    }
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    // Simulate sending reply
    alert(`Reply sent to ${selectedMessage.sender} successfully.`);
    setReplyMode(false);
    setReplyText('');
  };

  const handleSendCompose = () => {
    if (!composeData.to || !composeData.subject) return;
    
    alert(`Message sent to ${composeData.to}`);
    setComposeOpen(false);
    setComposeData({ to: '', subject: '', body: '' });
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">Inbox</h2>
        <button 
          onClick={() => setComposeOpen(true)}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded font-bold text-sm shadow hover:opacity-90 flex items-center gap-2"
        >
          <span className="material-icons text-sm">edit</span> Compose
        </button>
      </div>
      
      <div className="flex-1 paper-panel rounded-sm overflow-hidden flex flex-col md:flex-row border border-[var(--border-color)]">
        
        {/* Message List */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[var(--border-color)] bg-[var(--bg-color)] overflow-y-auto">
          {messages.length === 0 && (
             <div className="p-8 text-center text-[var(--text-secondary)] italic">Inbox is empty.</div>
          )}
          {messages.map(msg => (
            <div 
              key={msg.id} 
              onClick={() => handleSelectMessage(msg)}
              className={`p-4 border-b border-[var(--border-color)] cursor-pointer transition-colors hover:bg-[var(--panel-bg)] ${selectedMessage?.id === msg.id ? 'bg-[var(--surface-color)] border-l-4 border-l-[var(--accent)]' : ''} ${!msg.read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className={`text-sm ${!msg.read ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>{msg.sender}</p>
                <p className="text-xs text-[var(--text-secondary)] opacity-70">{msg.timestamp}</p>
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
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedMessage.subject}</h3>
                    {selectedMessage.targetView && (
                      <button 
                        onClick={() => handleRedirect(selectedMessage.targetView!)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold hover:bg-blue-200 flex items-center gap-1"
                      >
                         Open Context <span className="material-icons text-xs">open_in_new</span>
                      </button>
                    )}
                 </div>
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

               {/* Action Area */}
               <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-color)]">
                 {replyMode ? (
                   <div className="animate-fade-in-up">
                      <textarea 
                        className="w-full p-3 border border-[var(--border-color)] rounded mb-2 text-sm focus:border-[var(--accent)] outline-none"
                        rows={4}
                        placeholder={`Reply to ${selectedMessage.sender}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        autoFocus
                      ></textarea>
                      <div className="flex justify-end gap-2">
                         <button onClick={() => setReplyMode(false)} className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3">Cancel</button>
                         <button onClick={handleSendReply} className="bg-[var(--accent)] text-white px-4 py-2 rounded text-xs font-bold hover:opacity-90">Send Reply</button>
                      </div>
                   </div>
                 ) : (
                   <div className="flex gap-2">
                     <button 
                       onClick={() => setReplyMode(true)}
                       className="flex-1 bg-[var(--accent)] text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90"
                     >
                       <span className="material-icons text-sm">reply</span> Reply
                     </button>
                     <button 
                       onClick={() => handleDelete(selectedMessage.id)}
                       className="px-4 border border-[var(--border-color)] rounded hover:bg-red-50 text-red-500"
                       title="Delete Message"
                     >
                       <span className="material-icons">delete</span>
                     </button>
                   </div>
                 )}
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

      {/* Compose Modal */}
      {composeOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-gray-200 bg-[var(--panel-bg)] flex justify-between items-center">
                 <h3 className="font-bold text-[var(--text-primary)]">New Message</h3>
                 <button onClick={() => setComposeOpen(false)} className="hover:bg-gray-200 rounded-full p-1"><span className="material-icons text-sm">close</span></button>
              </div>
              <div className="p-6 space-y-4">
                 <input 
                   className="w-full border-b border-gray-300 p-2 text-sm outline-none focus:border-[var(--accent)]"
                   placeholder="To: (e.g. Dr. Sarah)"
                   value={composeData.to}
                   onChange={(e) => setComposeData({...composeData, to: e.target.value})}
                 />
                 <input 
                   className="w-full border-b border-gray-300 p-2 text-sm outline-none focus:border-[var(--accent)]"
                   placeholder="Subject"
                   value={composeData.subject}
                   onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                 />
                 <textarea 
                   className="w-full border border-gray-300 rounded p-3 text-sm h-40 resize-none outline-none focus:border-[var(--accent)]"
                   placeholder="Write your message here..."
                   value={composeData.body}
                   onChange={(e) => setComposeData({...composeData, body: e.target.value})}
                 ></textarea>
                 <div className="flex justify-end">
                    <button 
                      onClick={handleSendCompose}
                      className="bg-[var(--accent)] text-white px-6 py-2 rounded font-bold text-sm hover:opacity-90 flex items-center gap-2"
                    >
                       <span className="material-icons text-sm">send</span> Send
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
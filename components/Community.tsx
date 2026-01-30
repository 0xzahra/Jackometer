import React, { useState } from 'react';
import { Group, Message, Member } from '../types';

export const Community: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'CHAT' | 'MEMBERS'>('CHAT');
  
  // Profile Modal State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalTab, setModalTab] = useState<'PROFILE' | 'PAPERS' | 'DM'>('PROFILE');
  const [dmInput, setDmInput] = useState('');
  
  // Chat State
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [groups, setGroups] = useState<Group[]>([
    { 
      id: '1', name: 'Global Researchers', description: 'General academic discussion', memberCount: 1205, isJoined: false,
      members: [
        { 
          id: 'm1', name: 'Dr. Sarah Connor', role: 'Admin', university: 'MIT', status: 'Online', bio: 'AI Research Specialist.',
          papers: [
             { title: 'Neural Networks in Aquatic Life', abstract: 'Analyzing fish behavior using CNNs.', citations: 124, year: '2023' },
             { title: 'The Future of Ethical AI', abstract: 'A study on machine morality.', citations: 89, year: '2022' }
          ]
        },
        { 
          id: 'm2', name: 'John Doe', role: 'Student', university: 'Oxford', status: 'Researching', bio: 'PhD Candidate in Physics.',
          papers: [
             { title: 'Quantum Entanglement Basics', abstract: 'Introduction to qubits.', citations: 12, year: '2024' }
          ]
        }
      ]
    },
    { 
      id: '2', name: 'Bio-Systematics Core', description: 'Specialized group for biology majors', memberCount: 450, isJoined: false,
      members: [
        { 
          id: 'm3', name: 'Jane Goodall', role: 'Expert', university: 'Cambridge', status: 'Offline', bio: 'Primatology.',
          papers: []
        }
      ]
    },
    { 
      id: '3', name: 'Thesis Survivors', description: 'Support group for final year students', memberCount: 3200, isJoined: false,
      members: []
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'Dr. Sarah Connor', content: 'Has anyone seen the latest paper on CRISPR?', timestamp: '10:00 AM', read: true, reactions: { '👍': 5 } },
    { id: '2', sender: 'John Doe', content: 'Yes, I linked it in the files section.', timestamp: '10:05 AM', read: true, reactions: {} }
  ]);

  const joinGroup = (id: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, isJoined: true } : g));
  };

  const handleSendMessage = () => {
    if ((!input.trim() && !isRecording) || isRecording) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      reactions: {},
      replyTo: replyingTo ? { id: replyingTo.id, sender: replyingTo.sender, content: replyingTo.content } : undefined
    };
    
    setMessages([...messages, newMsg]);
    setInput('');
    setReplyingTo(null);
  };

  const handleVoiceNote = () => {
     if (!isRecording) {
       setIsRecording(true);
     } else {
       setIsRecording(false);
       const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'You',
        content: 'Voice Note (0:14)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
        reactions: {},
        isVoice: true
      };
      setMessages([...messages, newMsg]);
     }
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setMessages(messages.map(m => {
       if (m.id === msgId) {
          const newReactions = { ...m.reactions };
          newReactions[emoji] = (newReactions[emoji] || 0) + 1;
          return { ...m, reactions: newReactions };
       }
       return m;
    }));
  };

  const sendDM = () => {
     if(!dmInput.trim()) return;
     alert(`Message sent to ${selectedMember?.name}`);
     setDmInput('');
     setModalTab('PROFILE');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'You',
        content: `Uploaded: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
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
               onClick={() => { if(g.isJoined) { setActiveGroup(g.id); setViewMode('CHAT'); } }}
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

      {/* Main Content Area */}
      <div className="w-2/3 paper-panel flex flex-col overflow-hidden bg-[var(--surface-color)] relative">
         {!activeGroup ? (
           <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50 p-8 text-center">
             <span className="material-icons text-6xl mb-4">groups</span>
             <p className="font-serif text-xl">Select a joined group to view messages.</p>
           </div>
         ) : (
           <>
             {/* Header */}
             <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--panel-bg)]">
               <div>
                 <h3 className="font-bold text-[var(--text-primary)]">{currentGroupData?.name}</h3>
                 <p className="text-xs text-[var(--text-secondary)]">{currentGroupData?.memberCount} scholars online</p>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('CHAT')}
                    className={`p-2 rounded ${viewMode === 'CHAT' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'}`}
                  >
                    <span className="material-icons">chat</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('MEMBERS')}
                    className={`p-2 rounded ${viewMode === 'MEMBERS' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'}`}
                  >
                    <span className="material-icons">people</span>
                  </button>
               </div>
             </div>

             {/* Content */}
             {viewMode === 'CHAT' ? (
               <>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {messages.map(m => (
                     <div key={m.id} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'} group relative`}>
                       
                       {/* Reply Header */}
                       {m.replyTo && (
                         <div className={`text-[10px] text-[var(--text-secondary)] mb-1 p-1 border-l-2 border-[var(--accent)] ${m.sender === 'You' ? 'mr-1 text-right' : 'ml-1'}`}>
                           Replying to <strong>{m.replyTo.sender}</strong>: {m.replyTo.content.substring(0, 30)}...
                         </div>
                       )}

                       <div className="flex items-baseline space-x-2 mb-1">
                         <span className="text-xs font-bold text-[var(--text-primary)]">{m.sender}</span>
                         <span className="text-[10px] text-[var(--text-secondary)]">{m.timestamp}</span>
                       </div>
                       
                       <div className={`max-w-[80%] p-3 rounded-lg text-sm relative ${m.sender === 'You' ? 'bg-[var(--primary)] text-white rounded-tr-none' : 'bg-[var(--bg-color)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]'}`}>
                         {m.isVoice ? (
                           <div className="flex items-center gap-2">
                             <span className="material-icons">mic</span>
                             <span>{m.content}</span>
                             <span className="material-icons text-xs animate-pulse">play_circle</span>
                           </div>
                         ) : m.media ? (
                           <div className="flex items-center space-x-2 italic"><span className="material-icons">attachment</span> <span>{m.content}</span></div>
                         ) : (
                           m.content
                         )}
                       </div>

                       {/* Hover Actions */}
                       <div className={`absolute top-0 ${m.sender === 'You' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} hidden group-hover:flex items-center gap-1 p-1`}>
                          <button onClick={() => setReplyingTo(m)} className="p-1 hover:text-[var(--accent)] text-[var(--text-secondary)]"><span className="material-icons text-sm">reply</span></button>
                          <button onClick={() => handleReaction(m.id, '👍')} className="p-1 hover:scale-125 transition-transform text-xs">👍</button>
                          <button onClick={() => handleReaction(m.id, '❤️')} className="p-1 hover:scale-125 transition-transform text-xs">❤️</button>
                          <button onClick={() => handleReaction(m.id, '💡')} className="p-1 hover:scale-125 transition-transform text-xs">💡</button>
                       </div>

                       {Object.keys(m.reactions).length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {Object.entries(m.reactions).map(([emoji, count]) => (
                              <span key={emoji} className="text-[10px] bg-[var(--bg-color)] px-1 rounded border border-[var(--border-color)] cursor-pointer hover:bg-white">{emoji} {count}</span>
                            ))}
                          </div>
                       )}
                     </div>
                   ))}
                 </div>
                 
                 {/* Input Area */}
                 <div className="p-4 border-t border-[var(--border-color)] bg-[var(--panel-bg)]">
                   {replyingTo && (
                     <div className="flex justify-between items-center bg-[var(--bg-color)] p-2 rounded mb-2 text-xs border-l-4 border-[var(--accent)]">
                        <span>Replying to <strong>{replyingTo.sender}</strong>: {replyingTo.content}</span>
                        <button onClick={() => setReplyingTo(null)} className="text-[var(--text-secondary)] hover:text-red-500"><span className="material-icons text-sm">close</span></button>
                     </div>
                   )}
                   <div className="flex items-center space-x-2">
                     <label className="cursor-pointer text-[var(--text-secondary)] hover:text-[var(--primary)]">
                       <span className="material-icons">add_photo_alternate</span>
                       <input type="file" className="hidden" onChange={handleFileUpload} />
                     </label>
                     <input 
                       className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                       placeholder={isRecording ? "Recording audio..." : "Type a message..."}
                       value={input}
                       disabled={isRecording}
                       onChange={(e) => setInput(e.target.value)}
                       onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                     />
                     <button 
                       onClick={handleVoiceNote} 
                       className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-[var(--text-secondary)] hover:bg-gray-200'}`}
                     >
                       <span className="material-icons">{isRecording ? 'stop' : 'mic'}</span>
                     </button>
                     <button onClick={handleSendMessage} className="text-[var(--primary)]">
                       <span className="material-icons">send</span>
                     </button>
                   </div>
                 </div>
               </>
             ) : (
               /* Members List View */
               <div className="flex-1 overflow-y-auto p-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {currentGroupData?.members?.map(m => (
                     <div 
                       key={m.id} 
                       className="p-4 border border-[var(--border-color)] rounded bg-[var(--bg-color)] hover:shadow-md cursor-pointer flex items-center gap-4 transition-transform hover:-translate-y-1"
                       onClick={() => { setSelectedMember(m); setModalTab('PROFILE'); }}
                     >
                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                         {m.name[0]}
                       </div>
                       <div>
                         <h4 className="font-bold text-[var(--text-primary)]">{m.name}</h4>
                         <p className="text-xs text-[var(--text-secondary)]">{m.role} • {m.university}</p>
                         <p className={`text-[10px] mt-1 font-bold ${m.status === 'Online' ? 'text-green-500' : 'text-gray-400'}`}>● {m.status}</p>
                       </div>
                     </div>
                   ))}
                   {(!currentGroupData?.members || currentGroupData.members.length === 0) && (
                     <p className="text-center text-[var(--text-secondary)] col-span-2 italic">No members visible.</p>
                   )}
                 </div>
               </div>
             )}
           </>
         )}
         
         {/* Enhanced Member Interaction Modal */}
         {selectedMember && (
           <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
             <div className="bg-white rounded-lg p-0 max-w-sm w-full relative animate-fade-in-up overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
               {/* Modal Header */}
               <div className="bg-[var(--primary)] p-4 text-white flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{selectedMember.name}</h3>
                    <p className="text-xs opacity-80">{selectedMember.university}</p>
                  </div>
                  <button onClick={() => setSelectedMember(null)} className="text-white hover:bg-white/20 rounded-full p-1"><span className="material-icons text-sm">close</span></button>
               </div>
               
               {/* Modal Tabs */}
               <div className="flex border-b border-gray-200">
                  <button onClick={() => setModalTab('PROFILE')} className={`flex-1 py-3 text-xs font-bold ${modalTab === 'PROFILE' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-gray-500'}`}>PROFILE</button>
                  <button onClick={() => setModalTab('PAPERS')} className={`flex-1 py-3 text-xs font-bold ${modalTab === 'PAPERS' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-gray-500'}`}>PAPERS</button>
                  <button onClick={() => setModalTab('DM')} className={`flex-1 py-3 text-xs font-bold ${modalTab === 'DM' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-gray-500'}`}>MESSAGE</button>
               </div>

               {/* Modal Content */}
               <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                  {modalTab === 'PROFILE' && (
                     <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-[var(--accent)] text-white text-4xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg">
                           {selectedMember.name[0]}
                        </div>
                        <p className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-1">{selectedMember.role}</p>
                        <div className="bg-white p-4 rounded shadow-sm border border-gray-100 text-left">
                           <p className="text-sm text-gray-600 italic">"{selectedMember.bio}"</p>
                        </div>
                        <div className="mt-4 flex justify-between text-xs text-gray-500 px-4">
                           <span>Status: <span className={selectedMember.status === 'Online' ? 'text-green-500 font-bold' : 'text-gray-400'}>{selectedMember.status}</span></span>
                           <span>ID: {selectedMember.id.toUpperCase()}</span>
                        </div>
                     </div>
                  )}

                  {modalTab === 'PAPERS' && (
                     <div className="space-y-3">
                        {selectedMember.papers && selectedMember.papers.length > 0 ? (
                           selectedMember.papers.map((p, i) => (
                              <div key={i} className="bg-white p-3 rounded border border-gray-200 shadow-sm hover:border-[var(--accent)] cursor-pointer">
                                 <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">{p.title}</h4>
                                 <p className="text-xs text-gray-500 mb-2">{p.abstract}</p>
                                 <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                                    <span>Year: {p.year}</span>
                                    <span>Citations: {p.citations}</span>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="text-center text-gray-400 italic mt-8">
                              <span className="material-icons text-4xl mb-2">article</span>
                              <p>No published papers found.</p>
                           </div>
                        )}
                     </div>
                  )}

                  {modalTab === 'DM' && (
                     <div className="flex flex-col h-full">
                        <textarea 
                           className="flex-1 w-full bg-white border border-gray-300 rounded p-3 text-sm focus:border-[var(--primary)] outline-none resize-none mb-4"
                           placeholder={`Write a private message to ${selectedMember.name}...`}
                           value={dmInput}
                           onChange={(e) => setDmInput(e.target.value)}
                        ></textarea>
                        <button 
                           onClick={sendDM}
                           className="w-full bg-[var(--primary)] text-white py-3 rounded font-bold shadow hover:opacity-90 flex items-center justify-center gap-2"
                        >
                           <span className="material-icons text-sm">send</span> Send Message
                        </button>
                     </div>
                  )}
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};
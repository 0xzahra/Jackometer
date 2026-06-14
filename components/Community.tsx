import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { SpeechButton } from './SpeechButton';

interface Group {
  id: string;
  name: string;
  desc: string;
  icon: string;
  subject: string;
}

interface Scholar {
  id: string;
  name: string;
  course: string;
  school: string;
  bio: string;
}

interface Post {
  id: string;
  groupId: string;
  authorName: string;
  authorInitial: string;
  content: string;
  imageData?: string;
  fileName?: string;
  timestamp: string;
  likes: string[];
  replies: any[];
}

const GROUPS: Group[] = [
  { id: 'sci', name: 'Natural Sciences', desc: 'Field observations, lab results, specimen data.', icon: 'science', subject: 'Biology · Zoology · Chemistry' },
  { id: 'eng', name: 'Engineering & Tech', desc: 'SIWES discussions, technical project help, code sharing.', icon: 'engineering', subject: 'Engineering · Computer Science' },
  { id: 'soc', name: 'Social Sciences', desc: 'Research methods, survey templates, data tips.', icon: 'groups', subject: 'Sociology · Psychology · Economics' },
  { id: 'law', name: 'Law & Humanities', desc: 'Case studies, essay structure, citation help.', icon: 'gavel', subject: 'Law · History · Literature' },
  { id: 'fin', name: 'Final Year Corner', desc: 'Thesis tips, defense prep, examiner horror stories.', icon: 'school', subject: 'All departments' },
  { id: 'car', name: 'Career & Jobs', desc: 'Internship leads, CV feedback, interview tips.', icon: 'work', subject: 'Career' },
];

const SCHOLARS: Scholar[] = [
  { id: 's1', name: 'Amina Bello', course: 'BSc Computer Science', school: 'Ahmadu Bello University', bio: 'Final year, focusing on ML applications in agriculture.' },
  { id: 's2', name: 'Emeka Okafor', course: 'BSc Mechanical Engineering', school: 'UNIBEN', bio: 'SIWES at Dangote Cement. Ask me about industrial reports.' },
  { id: 's3', name: 'Fatima Al-Hassan', course: 'LLB Law', school: 'Bayero University Kano', bio: 'Constitutional law enthusiast. Moot court champion 2024.' },
  { id: 's4', name: 'David Osei', course: 'BSc Biochemistry', school: 'UNILAG', bio: 'Researching antimicrobial resistance in West African plants.' },
  { id: 's5', name: 'Ngozi Eze', course: 'BSc Economics', school: 'OAU', bio: 'Thesis: Effect of fintech adoption on rural savings behavior.' },
];

export const Community: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'groups'|'feed'|'scholars'>('groups');
  const [joinedGroups, setJoinedGroups] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('community_joined') || '[]'); }
    catch { return []; }
  });
  const [posts, setPosts] = useState<Post[]>(() => {
    try { return JSON.parse(localStorage.getItem('community_posts') || '[]'); }
    catch { return []; }
  });
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedScholar, setSelectedScholar] = useState<Scholar | null>(null);
  const [newPostText, setNewPostText] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const [following, setFollowing] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('community_following') || '[]'); }
    catch { return []; }
  });
  
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const toggleJoinGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (joinedGroups.includes(id)) {
      updated = joinedGroups.filter((g) => g !== id);
    } else {
      updated = [...joinedGroups, id];
    }
    setJoinedGroups(updated);
    localStorage.setItem('community_joined', JSON.stringify(updated));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const publishPost = () => {
    if (!selectedGroup) return;
    if (!newPostText.trim() && !pendingImage) return;

    const post: Post = {
      id: Date.now().toString(),
      groupId: selectedGroup,
      authorName: user?.name || 'Scholar',
      authorInitial: (user?.name || 'S').charAt(0).toUpperCase(),
      content: newPostText.trim(),
      imageData: pendingImage || undefined,
      fileName: pendingFileName || undefined,
      timestamp: new Date().toISOString(),
      likes: [],
      replies: [],
    };
    
    const updated = [post, ...posts];
    setPosts(updated);
    localStorage.setItem('community_posts', JSON.stringify(updated));
    setNewPostText('');
    setPendingImage(null);
    setPendingFileName(null);
  };

  const toggleLike = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likes.includes(user.id);
        const newLikes = hasLiked ? p.likes.filter(id => id !== user.id) : [...p.likes, user.id];
        return { ...p, likes: newLikes };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem('community_posts', JSON.stringify(updated));
  };

  const sendReply = (postId: string) => {
    if (!replyText.trim()) return;
    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [...p.replies, {
            id: Date.now().toString(),
            authorName: user.name,
            authorInitial: user.name.charAt(0).toUpperCase(),
            content: replyText.trim(),
          }]
        };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem('community_posts', JSON.stringify(updated));
    setReplyText('');
  };

  const toggleFollow = (scholar: Scholar) => {
    let updated;
    if (following.includes(scholar.id)) {
      updated = following.filter(id => id !== scholar.id);
    } else {
      updated = [...following, scholar.id];
      window.dispatchEvent(new CustomEvent('jackometer-notification', {
        detail: {
          type: 'COMMUNITY',
          title: 'New follower',
          message: `You are now following ${scholar.name}.`,
          timestamp: new Date().toISOString()
        }
      }));
    }
    setFollowing(updated);
    localStorage.setItem('community_following', JSON.stringify(updated));
  };
  
  const formatDate = (isoStr: string) => {
     try {
       const date = new Date(isoStr);
       return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
     } catch {
       return isoStr;
     }
  };

  const renderPost = (post: Post) => (
    <div key={post.id} className="sketch-card-soft bg-white p-4 mb-3 border border-[var(--border-color)] rounded shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex flex-shrink-0 items-center justify-center font-bold">
           {post.authorInitial}
        </div>
        <div>
           <div className="font-bold font-sans text-sm">{post.authorName}</div>
           <div className="text-xs text-[var(--text-secondary)]">{formatDate(post.timestamp)}</div>
        </div>
      </div>
      
      <p className="font-serif text-sm leading-relaxed mb-3">{post.content}</p>
      
      {post.imageData && post.fileName && post.imageData.startsWith('data:image') && (
        <img src={post.imageData} className="w-full rounded-lg mt-2 max-h-48 object-cover mb-3 border border-[var(--border-color)]" alt="Attachment" />
      )}
      {post.imageData && post.fileName && !post.imageData.startsWith('data:image') && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded mt-2 mb-3">
           <span className="material-icons text-[var(--accent)]">insert_drive_file</span>
           <span className="text-sm font-medium flex-1 truncate">{post.fileName}</span>
           <a href={post.imageData} download={post.fileName} className="text-xs text-blue-600 hover:underline font-bold">Download</a>
        </div>
      )}
      
      <div className="flex gap-4 pt-2 border-t border-[var(--border-color)]">
         <button onClick={() => toggleLike(post.id)} className={`text-sm flex items-center gap-1 font-bold ${post.likes.includes(user.id) ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}>
            <span className="material-icons text-[16px]">{post.likes.includes(user.id) ? 'favorite' : 'favorite_border'}</span> {post.likes.length}
         </button>
         <button onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)} className="text-sm flex items-center gap-1 font-bold text-[var(--text-secondary)] hover:text-[var(--primary)]">
            <span className="material-icons text-[16px]">chat_bubble_outline</span> {post.replies.length} replies
         </button>
      </div>

      {expandedPost === post.id && (
        <div className="mt-4 pt-3 border-t border-gray-100 pl-4 border-l-2 border-l-gray-200">
           {post.replies.map(r => (
             <div key={r.id} className="flex gap-2 mb-3">
               <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex flex-shrink-0 items-center justify-center text-[10px] font-bold">
                 {r.authorInitial}
               </div>
               <div className="flex-1 bg-gray-50 p-2 rounded text-xs">
                 <span className="font-bold block mb-1">{r.authorName}</span>
                 {r.content}
               </div>
             </div>
           ))}
           <div className="flex gap-2 mt-2 items-center bg-white border border-[var(--border-color)] rounded pr-1">
             <input type="text" className="flex-1 text-xs px-3 py-1.5 outline-none rounded bg-transparent" placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply(post.id)} />
             <SpeechButton onTranscript={(text) => setReplyText((prev) => (prev || '') + (prev && !prev.endsWith(' ') ? ' ' : '') + text)} />
             <button onClick={() => sendReply(post.id)} className="bg-[var(--accent)] text-white px-3 py-1 rounded text-xs font-bold mr-0.5">Send</button>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 max-w-5xl mx-auto flex flex-col pt-12 pb-24 lg:pt-8 min-h-[100dvh]">
       <div className="flex bg-[var(--surface-color)] p-1 rounded-lg border border-[var(--border-color)] w-full mb-6 max-w-md mx-auto relative z-10 shadow-sm">
         <button onClick={() => {setActiveTab('groups'); setSelectedGroup(null);}} className={`flex-1 py-2 text-sm font-bold rounded-md ${activeTab==='groups' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>Groups</button>
         <button onClick={() => {setActiveTab('feed'); setSelectedGroup(null);}} className={`flex-1 py-2 text-sm font-bold rounded-md ${activeTab==='feed' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>Feed</button>
         <button onClick={() => {setActiveTab('scholars'); setSelectedGroup(null);}} className={`flex-1 py-2 text-sm font-bold rounded-md ${activeTab==='scholars' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>Scholars</button>
       </div>
       
       <div className="flex-1 flex flex-col min-h-0 bg-transparent lg:bg-white lg:shadow lg:border lg:border-[var(--border-color)] lg:rounded-2xl lg:p-6 relative z-0">
          
          {activeTab === 'groups' && selectedGroup === null && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
               {GROUPS.map(group => {
                  const numPosts = posts.filter(p => p.groupId === group.id).length;
                  const membersCount = (numPosts * 3) + 12;
                  const isJoined = joinedGroups.includes(group.id);
                  return (
                    <div key={group.id} className="sketch-card p-5 cursor-pointer flex flex-col h-full bg-white transition hover:shadow-md border border-[var(--border-color)]" onClick={() => setSelectedGroup(group.id)}>
                      <div className="mb-3"><span className="material-icons text-2xl text-[var(--accent)]">{group.icon}</span></div>
                      <h3 className="font-serif font-bold text-base text-[var(--text-primary)] mb-1">{group.name}</h3>
                      <p className="font-sans text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2">{group.subject}</p>
                      <p className="font-sans text-sm text-[var(--text-primary)] mb-4 flex-1">{group.desc}</p>
                      <div className="mt-auto flex justify-between items-center pt-3 border-t border-[var(--border-color)]">
                         <span className="text-[10px] font-bold text-[var(--text-secondary)]">{membersCount} members</span>
                         <button 
                           onClick={(e) => toggleJoinGroup(group.id, e)}
                           className={`text-xs px-3 py-1 font-bold ${isJoined ? 'btn-outline-sketch' : 'btn-3d'}`}
                         >
                           {isJoined ? 'Joined' : 'Join'}
                         </button>
                      </div>
                    </div>
                  );
               })}
            </div>
          )}

          {activeTab === 'groups' && selectedGroup !== null && (() => {
             const group = GROUPS.find(g => g.id === selectedGroup);
             if (!group) return null;
             const isJoined = joinedGroups.includes(group.id);
             const groupPosts = posts.filter(p => p.groupId === group.id);
             return (
                <div className="flex flex-col h-full overflow-y-auto w-full max-w-2xl mx-auto custom-scrollbar">
                   <button onClick={() => setSelectedGroup(null)} className="self-start text-[var(--text-secondary)] hover:text-[var(--primary)] flex items-center gap-1 font-bold mb-4">
                     <span className="material-icons text-sm">arrow_back</span> Back to Groups
                   </button>
                   <h2 className="font-serif font-bold text-2xl mb-1 text-[var(--text-primary)]">{group.name}</h2>
                   <p className="text-sm text-[var(--text-secondary)] mb-6">{group.desc}</p>

                   {isJoined ? (
                     <div className="bg-[var(--surface-color)] p-4 rounded-xl border border-[var(--border-color)] mb-6 shadow-sm">
                        <div className="relative">
                          <textarea 
                            className="w-full bg-white border border-[var(--border-color)] rounded p-3 pr-8 text-sm resize-none outline-none focus:border-[var(--accent)]" 
                            rows={3} 
                            placeholder="Share something with this group..."
                            value={newPostText}
                            onChange={e => setNewPostText(e.target.value)}
                          />
                          <div className="absolute right-1 top-1">
                             <SpeechButton onTranscript={(text) => setNewPostText((prev) => (prev || '') + (prev && !prev.endsWith(' ') ? ' ' : '') + text)} />
                          </div>
                        </div>
                        {pendingImage && (
                          <div className="relative inline-flex items-center gap-2 mt-2 p-2 bg-gray-50 border border-gray-200 rounded pr-8">
                             {pendingImage.startsWith('data:image') ? (
                               <img src={pendingImage} className="h-10 rounded" alt="Preview"/>
                             ) : (
                               <span className="material-icons text-gray-500">description</span>
                             )}
                             <span className="text-xs truncate max-w-[200px]">{pendingFileName}</span>
                             <button onClick={() => {setPendingImage(null); setPendingFileName(null);}} className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full"><span className="material-icons text-[14px]">close</span></button>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-3">
                           <label className="text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer flex items-center gap-1 font-bold text-xs">
                             <span className="material-icons text-sm">attach_file</span> Attach File
                             <input type="file" accept="*/*" className="hidden" onChange={handleFileUpload} />
                           </label>
                           <button onClick={publishPost} disabled={!newPostText.trim() && !pendingImage} className="btn-3d px-6 py-2 text-sm disabled:opacity-50">Post to Group</button>
                        </div>
                     </div>
                   ) : (
                     <div className="text-center p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl mb-6">
                        <p className="text-sm font-bold text-[var(--text-primary)] mb-3">Join this group to post and see the feed.</p>
                        <button onClick={(e) => toggleJoinGroup(group.id, e)} className="btn-3d px-6 py-2">Join Group</button>
                     </div>
                   )}

                   {isJoined && (
                     <div className="flex flex-col gap-4">
                        {groupPosts.length > 0 ? (
                          groupPosts.map(renderPost)
                        ) : (
                          <div className="text-center p-10 text-[var(--text-secondary)] opacity-60">
                             No posts in this group yet. Be the first to share!
                          </div>
                        )}
                     </div>
                   )}
                </div>
             );
          })()}

          {activeTab === 'feed' && (
             <div className="flex flex-col h-full overflow-y-auto w-full max-w-2xl mx-auto custom-scrollbar">
                {joinedGroups.length === 0 ? (
                   <div className="text-center p-10 mt-10">
                      <span className="material-icons text-5xl text-[var(--text-secondary)] opacity-40 mb-3">dynamic_feed</span>
                      <h3 className="font-serif font-bold text-xl mb-2 text-[var(--text-primary)]">Your Feed is Empty</h3>
                      <p className="text-[var(--text-secondary)] text-sm mb-6">Join groups to see posts in your feed.</p>
                      <button onClick={() => setActiveTab('groups')} className="btn-3d px-6 py-2">Explore Groups</button>
                   </div>
                ) : (
                   <div className="flex flex-col gap-4">
                      {posts.filter(p => joinedGroups.includes(p.groupId)).length > 0 ? (
                        posts.filter(p => joinedGroups.includes(p.groupId)).map(renderPost)
                      ) : (
                        <div className="text-center p-10 mt-10 text-[var(--text-secondary)] opacity-60">
                           <span className="material-icons text-4xl mb-2">history_toggle_off</span>
                           <p>No posts yet in your groups. Check back soon!</p>
                        </div>
                      )}
                   </div>
                )}
             </div>
          )}

          {activeTab === 'scholars' && selectedScholar === null && (
             <div className="flex flex-col h-full overflow-y-auto w-full max-w-2xl mx-auto custom-scrollbar">
                <div className="bg-[var(--surface-color)] p-6 rounded-xl border border-[var(--border-color)] mb-8 flex items-center gap-4 shadow-sm">
                   <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white text-xl font-bold flex items-center justify-center shrink-0">
                      {(user?.name || 'S').charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <h3 className="font-bold text-lg text-[var(--text-primary)]">{user?.name || 'Scholar'}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">{user?.course || 'Scholar Profile'}</p>
                      <div className="inline-block bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] px-2 py-0.5 rounded uppercase font-bold">This is you</div>
                   </div>
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Suggested Connections</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {SCHOLARS.map(scholar => (
                      <div key={scholar.id} className="sketch-card-soft bg-white p-4 flex flex-col border border-[var(--border-color)] rounded shadow-sm hover:shadow transition">
                         <div className="flex justify-between items-start mb-3 cursor-pointer" onClick={() => setSelectedScholar(scholar)}>
                            <div className="flex gap-3">
                               <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center shrink-0">{scholar.name.charAt(0)}</div>
                               <div>
                                  <h4 className="font-bold text-sm text-[var(--text-primary)] hover:text-[var(--accent)]">{scholar.name}</h4>
                                  <p className="text-[10px] text-[var(--text-secondary)] uppercase">{scholar.course}</p>
                                  <p className="text-[10px] text-[var(--text-secondary)]">{scholar.school}</p>
                               </div>
                            </div>
                         </div>
                         <p className="text-xs text-[var(--text-primary)] mb-4 flex-1 italic cursor-pointer m-0 line-clamp-2" onClick={() => setSelectedScholar(scholar)}>"{scholar.bio}"</p>
                         <button onClick={() => toggleFollow(scholar)} className={`w-full py-1.5 rounded text-xs font-bold transition-all flex items-center justify-center gap-1 ${following.includes(scholar.id) ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            {following.includes(scholar.id) ? 'Following' : 'Follow'}
                         </button>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'scholars' && selectedScholar !== null && (
             <div className="flex flex-col h-full overflow-y-auto w-full max-w-3xl mx-auto custom-scrollbar pt-2">
                <button onClick={() => setSelectedScholar(null)} className="self-start text-[var(--text-secondary)] hover:text-[var(--primary)] flex items-center gap-1 font-bold mb-4">
                   <span className="material-icons text-sm">arrow_back</span> Back to Scholars
                </button>
                <div className="bg-white p-8 rounded-xl border border-[var(--border-color)] shadow-sm">
                   <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 rounded-full bg-gray-200 text-gray-800 text-3xl font-bold flex items-center justify-center shrink-0 shadow-inner">
                         {selectedScholar.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                         <h2 className="font-serif font-bold text-3xl text-[var(--text-primary)] mb-1">{selectedScholar.name}</h2>
                         <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1 flex items-center gap-2"><span className="material-icons text-[16px]">school</span> {selectedScholar.course}</p>
                         <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2"><span className="material-icons text-[16px]">location_on</span> {selectedScholar.school}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                         <button onClick={() => toggleFollow(selectedScholar)} className={`px-6 py-2 rounded font-bold shadow-sm transition-colors ${following.includes(selectedScholar.id) ? 'bg-gray-200 text-gray-800' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}>
                            {following.includes(selectedScholar.id) ? 'Following' : 'Follow'}
                         </button>
                         <button onClick={() => {
                            window.dispatchEvent(new CustomEvent('jackometer-notification', { detail: { type: 'COMMUNITY', title: 'Message Sent', message: `Message request sent to ${selectedScholar.name}.` } }));
                         }} className="px-6 py-2 rounded border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                            <span className="material-icons text-[16px]">mail</span> Message
                         </button>
                      </div>
                   </div>
                   
                   <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg mb-8">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">About</h4>
                      <p className="text-sm italic pl-2 border-l-2 border-[var(--accent)]">{selectedScholar.bio}</p>
                   </div>
                   
                   <div className="mb-4 text-[var(--text-primary)]">
                       <h4 className="font-bold border-b border-[var(--border-color)] pb-2 mb-4 text-lg">Shared Documents</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="border border-[var(--border-color)] p-4 rounded bg-[var(--surface-color)] hover:shadow-sm">
                               <div className="flex gap-3 mb-2">
                                  <span className="material-icons text-blue-500 rounded p-1 bg-blue-50">description</span>
                                  <div>
                                     <h5 className="font-bold text-sm">Research_Proposal_2024.docx</h5>
                                     <p className="text-xs text-[var(--text-secondary)]">2.1 MB • 4 days ago</p>
                                  </div>
                               </div>
                               <button className="text-xs font-bold text-[var(--accent)] mt-2 hover:underline">Download file</button>
                           </div>
                           <div className="border border-[var(--border-color)] p-4 rounded bg-[var(--surface-color)] hover:shadow-sm">
                               <div className="flex gap-3 mb-2">
                                  <span className="material-icons text-red-500 rounded p-1 bg-red-50">picture_as_pdf</span>
                                  <div>
                                     <h5 className="font-bold text-sm">Literature_Review_Notes.pdf</h5>
                                     <p className="text-xs text-[var(--text-secondary)]">1.5 MB • 2 wks ago</p>
                                  </div>
                               </div>
                               <button className="text-xs font-bold text-[var(--accent)] mt-2 hover:underline">Download file</button>
                           </div>
                       </div>
                   </div>
                </div>
             </div>
          )}

       </div>
    </div>
  );
};

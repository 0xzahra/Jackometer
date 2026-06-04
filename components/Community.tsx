import React, { useState, useEffect } from 'react';
import { customAlert } from '../lib/dialogs';

interface ScholarProfile {
  id: string;
  name: string;
  initial: string;
  institution: string;
  course: string;
  bio: string;
  followers: string[];
  following: string[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  subject: string;
  memberCount: number;
  isMember: boolean;
  icon: string;
}

interface ForumReply {
  id: string;
  authorId: string;
  authorName: string;
  authorInitial: string;
  content: string;
  timestamp: string;
}

interface ForumPost {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorInitial: string;
  content: string;
  imageData?: string;
  timestamp: string;
  likes: string[];
  replies: ForumReply[];
}

const DEFAULT_GROUPS: Group[] = [
  { id: 'g1', name: 'Computer Science Hub', description: 'Algorithms, AI, and Software Engineering.', subject: 'Computer Science', memberCount: 1420, isMember: false, icon: 'computer' },
  { id: 'g2', name: 'Thesis Writers', description: 'Support group for final year defenses.', subject: 'General', memberCount: 3200, isMember: false, icon: 'school' },
  { id: 'g3', name: 'Biomedical Research', description: 'Clinical trials and data analysis.', subject: 'Biology', memberCount: 850, isMember: false, icon: 'biotech' }
];

export const Community: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<ScholarProfile>(() => {
    const saved = localStorage.getItem('jackometer_scholar_profile');
    if (saved) return JSON.parse(saved);
    return {
      id: 'me',
      name: 'Dr. Scholar',
      initial: 'D',
      institution: 'University of Knowledge',
      course: 'Research',
      bio: 'Lifelong learner.',
      followers: [],
      following: []
    };
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('jackometer_forum_groups');
    return saved ? JSON.parse(saved) : DEFAULT_GROUPS;
  });

  const [posts, setPosts] = useState<ForumPost[]>(() => {
    const saved = localStorage.getItem('jackometer_forum_posts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('jackometer_scholar_profile', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('jackometer_forum_groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('jackometer_forum_posts', JSON.stringify(posts)); }, [posts]);

  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | undefined>(undefined);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [selectedProfile, setSelectedProfile] = useState<ScholarProfile | null>(null);

  const activeGroupData = groups.find(g => g.id === activeGroup);
  const activePosts = posts.filter(p => p.groupId === activeGroup);

  const toggleJoinGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return { ...g, isMember: !g.isMember, memberCount: g.isMember ? g.memberCount - 1 : g.memberCount + 1 };
      }
      return g;
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPostImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submitPost = () => {
    if (!postContent.trim() && !postImage) return;
    if (!activeGroup) return;

    const newPost: ForumPost = {
      id: `p_${Date.now()}`,
      groupId: activeGroup,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorInitial: currentUser.initial,
      content: postContent,
      imageData: postImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      likes: [],
      replies: []
    };

    setPosts([newPost, ...posts]);
    setPostContent('');
    setPostImage(undefined);
  };

  const submitReply = (postId: string) => {
    const content = replyInputs[postId];
    if (!content?.trim()) return;

    const newReply: ForumReply = {
      id: `r_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorInitial: currentUser.initial,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, replies: [...p.replies, newReply] };
      }
      return p;
    }));

    setReplyInputs({ ...replyInputs, [postId]: '' });
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likes.includes(currentUser.id);
        const newLikes = hasLiked ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id];
        return { ...p, likes: newLikes };
      }
      return p;
    }));
  };

  const showProfile = (authorId: string, authorName: string, authorInitial: string) => {
    if (authorId === currentUser.id) {
       setSelectedProfile(currentUser);
    } else {
       // Mock other users based on authorId for now
       setSelectedProfile({
         id: authorId,
         name: authorName,
         initial: authorInitial,
         institution: 'External Institution',
         course: 'Scholar',
         bio: 'Automated profile generated from post history.',
         followers: ['me'],
         following: []
       });
    }
  };

  return (
    <div className="w-full h-full max-w-7xl mx-auto flex gap-6 p-4 md:p-6 overflow-hidden">
      {/* Left Sidebar - Groups & Navigation */}
      <div className="w-full md:w-1/3 paper-panel flex flex-col rounded-xl overflow-hidden shadow-lg border border-[var(--border-color)] hidden md:flex shrink-0">
         <div className="p-4 border-b border-[var(--border-color)] bg-[var(--surface-color)]">
            <h2 className="text-xl font-serif font-bold text-[var(--text-primary)]">Scholar Network</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Connect, share, and collaborate</p>
         </div>

         <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3 cursor-pointer hover:bg-[rgba(139,105,20,0.05)]" onClick={() => setSelectedProfile(currentUser)}>
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg">{currentUser.initial}</div>
            <div>
               <h3 className="font-bold text-sm text-[var(--text-primary)]">{currentUser.name}</h3>
               <p className="text-[10px] text-[var(--text-secondary)]">View your profile</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest px-2 mb-2 mt-2">Study Groups</h3>
            {groups.map(g => (
               <div 
                 key={g.id} 
                 onClick={() => { if(g.isMember) setActiveGroup(g.id); }}
                 className={`p-3 rounded-lg border cursor-pointer transition-colors ${activeGroup === g.id ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md' : 'bg-transparent border-[var(--border-color)] hover:border-[var(--primary)]'}`}
               >
                  <div className="flex justify-between items-start mb-1">
                     <div className="flex items-center gap-2">
                        <span className={`material-icons text-sm ${activeGroup === g.id ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{g.icon}</span>
                        <h4 className={`font-bold text-sm ${activeGroup === g.id ? 'text-white' : 'text-[var(--text-primary)]'}`}>{g.name}</h4>
                     </div>
                     {!g.isMember && <span className="material-icons text-xs opacity-50">lock</span>}
                  </div>
                  <p className={`text-xs pl-6 line-clamp-1 mb-2 ${activeGroup === g.id ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>{g.description}</p>
                  <div className="flex justify-between items-center pl-6">
                     <span className={`text-[10px] ${activeGroup === g.id ? 'text-white/90' : 'text-[var(--text-secondary)]'}`}>{g.memberCount} members</span>
                     <button 
                        onClick={(e) => toggleJoinGroup(g.id, e)}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${g.isMember ? (activeGroup === g.id ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-200 text-gray-700 hover:bg-gray-300') : 'bg-[var(--accent)] text-white hover:opacity-90'}`}
                     >
                        {g.isMember ? 'Leave' : 'Join'}
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Main Feed Area */}
      <div className="flex-1 paper-panel rounded-xl flex flex-col overflow-hidden shadow-lg border border-[var(--border-color)] bg-[var(--surface-color)] min-h-0">
          {!activeGroupData ? (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[var(--text-secondary)] opacity-50">
               <span className="material-icons text-6xl mb-4">forum</span>
               <h2 className="text-xl font-serif">Join a Group to see discussions</h2>
               <p className="text-sm mt-2">Connect with scholars globally to share knowledge.</p>
             </div>
          ) : (
             <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-[var(--border-color)] bg-white shrink-0">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                         <span className="material-icons">{activeGroupData.icon}</span>
                      </div>
                      <div>
                         <h2 className="font-bold text-lg text-[var(--text-primary)]">{activeGroupData.name}</h2>
                         <p className="text-sm text-[var(--text-secondary)]">{activeGroupData.description}</p>
                      </div>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
                   {/* Create Post Block */}
                   <div className="bg-white border border-[var(--border-color)] rounded-xl p-4 mb-6 shadow-sm">
                      <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shrink-0">{currentUser.initial}</div>
                         <div className="flex-1">
                            <textarea 
                               className="w-full bg-transparent border-none outline-none resize-none min-h-[60px] text-sm text-[var(--text-primary)]"
                               placeholder="Share a research finding, ask a question, or upload media..."
                               value={postContent}
                               onChange={(e) => setPostContent(e.target.value)}
                            />
                            {postImage && (
                               <div className="relative inline-block mt-2">
                                  <img src={postImage} alt="Upload" className="h-32 rounded-lg border border-gray-200" />
                                  <button onClick={() => setPostImage(undefined)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><span className="material-icons text-xs">close</span></button>
                               </div>
                            )}
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                               <label className="cursor-pointer text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1 text-xs font-bold">
                                  <span className="material-icons text-base">image</span> Add Media
                                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                               </label>
                               <button 
                                  onClick={submitPost}
                                  disabled={!postContent.trim() && !postImage}
                                  className="bg-[var(--accent)] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow hover:opacity-90 disabled:opacity-50"
                               >
                                  Post
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Threads */}
                   <div className="space-y-6">
                      {activePosts.length === 0 ? (
                         <div className="text-center py-10 opacity-50">No posts in this group yet. Be the first!</div>
                      ) : activePosts.map(post => (
                         <div key={post.id} className="bg-white border border-[var(--border-color)] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                               <div className="flex items-center gap-3 cursor-pointer" onClick={() => showProfile(post.authorId, post.authorName, post.authorInitial)}>
                                  <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm shrink-0 hover:ring-2 ring-[var(--accent)] transition-all">
                                     {post.authorInitial}
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-sm text-[var(--text-primary)] hover:underline">{post.authorName}</h4>
                                     <p className="text-[10px] text-[var(--text-secondary)]">{post.timestamp}</p>
                                  </div>
                               </div>
                            </div>
                            
                            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed mb-3">{post.content}</p>
                            
                            {post.imageData && (
                               <img src={post.imageData} alt="Attachment" className="max-h-64 rounded-lg border border-gray-100 mb-3 object-contain" />
                            )}
                            
                            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
                               <button 
                                 onClick={() => toggleLike(post.id)}
                                 className={`flex items-center gap-1 text-xs font-bold transition-colors ${post.likes.includes(currentUser.id) ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'}`}
                               >
                                  <span className="material-icons text-base">{post.likes.includes(currentUser.id) ? 'favorite' : 'favorite_border'}</span>
                                  {post.likes.length}
                               </button>
                               <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)]">
                                  <span className="material-icons text-base">chat_bubble_outline</span>
                                  {post.replies.length} Replies
                               </div>
                            </div>

                            {/* Replies Section */}
                            <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                               {post.replies.map(reply => (
                                  <div key={reply.id} className="flex gap-2 items-start mt-2">
                                     <div 
                                       className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-[10px] shrink-0 cursor-pointer"
                                       onClick={() => showProfile(reply.authorId, reply.authorName, reply.authorInitial)}
                                     >
                                        {reply.authorInitial}
                                     </div>
                                     <div className="bg-gray-50 rounded-lg p-2 flex-1 border border-gray-100">
                                        <div className="flex justify-between items-baseline mb-1">
                                           <span className="font-bold text-[11px] text-[var(--text-primary)] cursor-pointer hover:underline" onClick={() => showProfile(reply.authorId, reply.authorName, reply.authorInitial)}>{reply.authorName}</span>
                                           <span className="text-[9px] text-[var(--text-secondary)]">{reply.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-[var(--text-primary)]">{reply.content}</p>
                                     </div>
                                  </div>
                               ))}
                               <div className="flex gap-2 items-center mt-3">
                                  <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-[10px] shrink-0">{currentUser.initial}</div>
                                  <input 
                                     type="text" 
                                     placeholder="Write a reply..." 
                                     className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                                     value={replyInputs[post.id] || ''}
                                     onChange={(e) => setReplyInputs({ ...replyInputs, [post.id]: e.target.value })}
                                     onKeyPress={(e) => e.key === 'Enter' && submitReply(post.id)}
                                  />
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          )}
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
               <div className="h-24 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] relative">
                  <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-full p-1 border border-gray-200">
                     <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-700">
                        {selectedProfile.initial}
                     </div>
                  </div>
                  <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 text-white bg-black/20 rounded-full p-1 hover:bg-black/40"><span className="material-icons text-sm">close</span></button>
               </div>
               <div className="pt-12 px-6 pb-6">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">{selectedProfile.name}</h2>
                  <p className="text-sm font-bold text-[var(--accent)] mt-1">{selectedProfile.course} @ {selectedProfile.institution}</p>
                  
                  <div className="flex gap-4 my-4 font-sans text-sm">
                     <div className="flex flex-col items-center"><span className="font-bold text-[var(--text-primary)]">{selectedProfile.followers.length}</span><span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Followers</span></div>
                     <div className="flex flex-col items-center"><span className="font-bold text-[var(--text-primary)]">{selectedProfile.following.length}</span><span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Following</span></div>
                     <div className="flex flex-col items-center"><span className="font-bold text-[var(--text-primary)]">{posts.filter(p => p.authorId === selectedProfile.id).length}</span><span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Posts</span></div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg mt-2 mb-4">
                     <p className="text-sm italic text-gray-600">"{selectedProfile.bio}"</p>
                  </div>
                  
                  {selectedProfile.id !== currentUser.id && (
                     <button className="w-full bg-[var(--accent)] text-white py-2 rounded-full font-bold shadow-md hover:bg-[var(--accent-deep)] transition flex items-center justify-center gap-2">
                        <span className="material-icons text-sm">person_add</span> Follow Scholar
                     </button>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

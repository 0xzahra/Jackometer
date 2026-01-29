import React, { useState } from 'react';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState({
    firstName: 'Academic',
    lastName: 'User',
    email: 'scholar@university.edu',
    institution: 'Oxford University',
    course: 'Bio-Systematics',
    level: 'PhD Candidate',
    bio: 'Specializing in aquatic ecosystems and microbial analysis.',
    password: ''
  });

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'SUPPORT'>('DETAILS');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header Profile Card - Google Style */}
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-8 mb-6 flex items-center shadow-sm relative overflow-hidden">
         <div className="w-20 h-20 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center text-3xl font-bold mr-6">
           {profile.firstName[0]}
         </div>
         <div>
           <h1 className="text-2xl font-bold text-[var(--text-primary)]">{profile.firstName} {profile.lastName}</h1>
           <p className="text-[var(--text-secondary)]">{profile.level} • {profile.institution}</p>
         </div>
         <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[var(--bg-color)] to-transparent opacity-20"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--border-color)] mb-6">
        <button 
          onClick={() => setActiveTab('DETAILS')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'DETAILS' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Profile Details
        </button>
        <button 
          onClick={() => setActiveTab('SUPPORT')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'SUPPORT' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Live Support & Help
        </button>
      </div>

      {activeTab === 'DETAILS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="paper-panel p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">First Name</label>
                  <input name="firstName" value={profile.firstName} onChange={handleChange} className="w-full mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Last Name</label>
                  <input name="lastName" value={profile.lastName} onChange={handleChange} className="w-full mt-1" />
                </div>
              </div>
              <div>
                 <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Email Address</label>
                 <input name="email" value={profile.email} onChange={handleChange} className="w-full mt-1" />
              </div>
              <div>
                 <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Bio / Summary</label>
                 <textarea name="bio" value={profile.bio} onChange={handleChange} className="w-full mt-1 h-20 resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="paper-panel p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-4">Academic Credentials</h3>
              <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Institution</label>
                   <input name="institution" value={profile.institution} onChange={handleChange} className="w-full mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Course</label>
                    <input name="course" value={profile.course} onChange={handleChange} className="w-full mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Level</label>
                    <input name="level" value={profile.level} onChange={handleChange} className="w-full mt-1" />
                  </div>
                </div>
              </div>
            </div>

            <div className="paper-panel p-6 border-red-100">
               <h3 className="font-bold text-[var(--text-primary)] mb-4">Security</h3>
               <div>
                 <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Reset Password</label>
                 <div className="flex gap-2 mt-1">
                   <input type="password" placeholder="New Password" className="flex-1" />
                   <button className="bg-[var(--text-secondary)] text-white px-4 rounded font-bold text-sm">Update</button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SUPPORT' && (
        <div className="paper-panel p-8 flex flex-col h-96 items-center justify-center text-center">
           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
             <span className="material-icons text-3xl">support_agent</span>
           </div>
           <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">How can we help you, {profile.firstName}?</h2>
           <p className="text-[var(--text-secondary)] max-w-md mb-6">
             Our dedicated academic support team is available 24/7 to assist with research generation issues, account settings, or bug reports.
           </p>
           <div className="flex gap-4">
             <button className="btn-primary flex items-center">
               <span className="material-icons mr-2">chat</span>
               Start Live Chat
             </button>
             <button className="bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-primary)] px-6 py-2 rounded-full font-medium">
               Email Support
             </button>
           </div>
        </div>
      )}
    </div>
  );
};
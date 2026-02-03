import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    institution: '',
    course: 'Academic Research',
    level: 'Scholar',
    bio: 'Academic researcher leveraging AI to accelerate discovery.',
  });

  useEffect(() => {
    // Split name
    const names = user.name.split(' ');
    const firstName = names[0] || 'Academic';
    const lastName = names.slice(1).join(' ') || 'User';

    setProfile(prev => ({
      ...prev,
      firstName,
      lastName,
      institution: user.institution || prev.institution,
      level: user.role || prev.level
    }));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header Profile Card - Google Style */}
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-8 mb-6 flex items-center shadow-sm relative overflow-hidden">
         <div className="w-20 h-20 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center text-3xl font-bold mr-6 shadow-md">
           {user.avatar === 'G' ? <span className="material-icons text-4xl">google</span> : profile.firstName[0]}
         </div>
         <div className="relative z-10">
           <h1 className="text-2xl font-bold text-[var(--text-primary)]">{profile.firstName} {profile.lastName}</h1>
           <p className="text-[var(--text-secondary)] flex items-center gap-1">
             {profile.level} • {profile.institution} 
             {user.avatar === 'G' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 rounded-full font-bold ml-2">Verified Google Account</span>}
           </p>
         </div>
         <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[var(--bg-color)] to-transparent opacity-20"></div>
      </div>

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
                 <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Bio / Summary</label>
                 <textarea name="bio" value={profile.bio} onChange={handleChange} className="w-full mt-1 h-32 resize-none"></textarea>
              </div>
              <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Email Address</label>
                  <input value={user.email} disabled className="w-full mt-1 bg-gray-100 text-gray-500 cursor-not-allowed" />
              </div>
            </div>
          </div>

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
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="text-sm font-bold text-yellow-800 mb-1 flex items-center"><span className="material-icons text-sm mr-1">auto_awesome</span> Premium Features</h4>
                  <p className="text-xs text-yellow-700">Your scholar status grants you access to Deep Research (Gemini Pro) and Unlimited Cloud Storage.</p>
                </div>
              </div>
            </div>
      </div>
    </div>
  );
};
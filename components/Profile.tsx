import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (data: Partial<UserProfile>) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateUser({ avatar: event.target.result as string });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header Profile Card - Emerald Style */}
      <div className="glass-panel p-8 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
         
         {/* Avatar Upload Container */}
         <div className="relative group cursor-pointer z-10 w-28 h-28 flex-shrink-0">
           <div className="w-full h-full rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center text-4xl font-bold shadow-md overflow-hidden ring-4 ring-emerald-500/20">
             {user.avatar && user.avatar !== 'G' && user.avatar.length > 10 ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
             ) : user.avatar === 'G' ? (
                <span className="material-icons text-5xl">google</span>
             ) : (
                profile.firstName[0]
             )}
           </div>
           
           {/* Hover Overlay for Upload */}
           <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-icons text-white">camera_alt</span>
           </div>
           <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
         </div>

         <div className="relative z-10 text-center md:text-left">
           <h1 className="text-4xl font-bold font-sans text-[var(--text-primary)] mb-2 tracking-tight">{profile.firstName} {profile.lastName}</h1>
           <p className="text-[var(--text-secondary)] flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
             <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">{profile.level}</span> • {profile.institution} 
             {user.avatar === 'G' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 rounded-full font-bold ml-1 flex items-center"><span className="material-icons text-[10px] mr-1">verified</span>Verified Google</span>}
           </p>
         </div>
         <div className="absolute right-0 top-0 h-full w-full md:w-1/2 bg-gradient-to-l from-[var(--primary)]/10 to-transparent pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8">
            <h3 className="text-lg font-bold font-sans tracking-tight text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3 mb-6">Personal Information</h3>
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

          <div className="glass-panel p-8">
              <h3 className="text-lg font-bold font-sans tracking-tight text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3 mb-6">Academic Credentials</h3>
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
                
                <div className="mt-8 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center"><span className="material-icons text-sm mr-2">auto_awesome</span> Premium Scholar Features</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">Your scholar status grants you full access to Deep Research (Gemini Advanced Protocol), Vision Extractors, and Unlimited Compression Tools.</p>
                </div>
              </div>
            </div>
      </div>
    </div>
  );
};
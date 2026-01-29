import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [user, setUser] = useState({
    name: 'Academic User',
    university: 'Oxford University',
    role: 'PhD Candidate',
    theme: 'Paper Mode'
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8">System Configuration</h2>
      
      <div className="paper-panel p-8 rounded-sm mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Profile Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Name</label>
            <input 
              value={user.name} 
              onChange={(e) => setUser({...user, name: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded text-slate-900 outline-none focus:border-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Institution</label>
            <input 
              value={user.university} 
              onChange={(e) => setUser({...user, university: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded text-slate-900 outline-none focus:border-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Academic Role</label>
            <select 
              value={user.role} 
              onChange={(e) => setUser({...user, role: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded text-slate-900 outline-none focus:border-slate-800"
            >
              <option>Undergraduate</option>
              <option>MSc Student</option>
              <option>PhD Candidate</option>
              <option>Professor</option>
              <option>Researcher</option>
            </select>
          </div>
        </div>
      </div>

      <div className="paper-panel p-8 rounded-sm mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Application Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded">
            <div>
              <p className="font-bold text-slate-800">Interface Theme</p>
              <p className="text-xs text-slate-500">Current: {user.theme}</p>
            </div>
            <button className="text-xs font-bold text-slate-900 border border-slate-300 px-3 py-1 rounded bg-white">
              Locked to Paper
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded">
            <div>
              <p className="font-bold text-slate-800">Academic Integrity Mode</p>
              <p className="text-xs text-slate-500">Filters non-academic sources</p>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full flex items-center px-1">
              <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded">
            <div>
              <p className="font-bold text-slate-800">Local Vault Storage</p>
              <p className="text-xs text-slate-500">Clear local cache</p>
            </div>
            <button className="text-red-500 text-xs font-bold hover:underline">Clear Data</button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 font-serif italic">
        Jackometer v2050. Enterprise Core License Active.
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { UserSearchResult, Collaborator } from '../types';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: UserSearchResult) => void;
  existingIds: string[];
}

// Mock Database of Scholars
const MOCK_DB: UserSearchResult[] = [
  { id: 'u1', name: 'Dr. Sarah Connor', username: 'sconnor_ai', email: 'sarah.c@mit.edu', university: 'MIT' },
  { id: 'u2', name: 'Emily Chen', username: 'emily_c', email: 'echen@stanford.edu', university: 'Stanford' },
  { id: 'u3', name: 'James T. Kirk', username: 'starship_capt', email: 'j.kirk@fleet.academy', university: 'Starfleet Academy' },
  { id: 'u4', name: 'Jane Goodall', username: 'primate_jane', email: 'jane@cambridge.uk', university: 'Cambridge' },
  { id: 'u5', name: 'Neo Anderson', username: 'the_one', email: 'neo@matrix.sys', university: 'Unknown' },
  { id: 'u6', name: 'Alan Turing', username: 'enigma_breaker', email: 'alan@bletchley.park', university: 'Cambridge' },
  { id: 'u7', name: 'Marie Curie', username: 'rad_marie', email: 'marie@sorbonne.fr', university: 'Sorbonne' },
  { id: 'u8', name: 'Student 01', username: 'stud_01', email: 'student@uni.edu', university: 'Local University' },
];

export const CollaborationModal: React.FC<CollaborationModalProps> = ({ isOpen, onClose, onAdd, existingIds }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.length > 1) {
      setSearching(true);
      const timer = setTimeout(() => {
        const lowerQ = query.toLowerCase();
        const filtered = MOCK_DB.filter(u => 
          !existingIds.includes(u.id) && 
          (u.name.toLowerCase().includes(lowerQ) || 
           u.username.toLowerCase().includes(lowerQ) || 
           u.email.toLowerCase().includes(lowerQ))
        );
        setResults(filtered);
        setSearching(false);
      }, 500); // Simulate network delay
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setSearching(false);
    }
  }, [query, existingIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 bg-[var(--primary)] text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <span className="material-icons">person_add</span> Invite Collaborators
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1"><span className="material-icons text-sm">close</span></button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">Search by name, @username, or email address to add them to this document session.</p>
          
          <div className="relative mb-6">
            <span className="material-icons absolute left-3 top-3 text-gray-400">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:border-[var(--primary)] outline-none"
              placeholder="e.g. 'Sarah' or 'sarah@mit.edu'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
            {searching ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <span className="material-icons animate-spin mb-2">refresh</span>
                <span className="text-xs">Searching Global Database...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-100 rounded hover:bg-blue-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">@{user.username} • {user.university}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onAdd(user)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold shadow hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ADD
                    </button>
                  </div>
                ))}
              </div>
            ) : query.length > 1 ? (
              <div className="text-center text-gray-400 mt-10">
                <span className="material-icons text-4xl mb-2">person_off</span>
                <p className="text-sm">No scholars found matching "{query}"</p>
              </div>
            ) : (
              <div className="text-center text-gray-300 mt-10">
                <p className="text-sm">Start typing to search...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
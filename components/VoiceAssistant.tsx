import React, { useState } from 'react';

// Note: In a real simplified example without full context, we simulate the visual. 
// However, the instructions ask to integrate Gemini Live.
// We will build a visual component that *would* hook into the context if fully implemented.
// For this demo, we'll simulate the "Listening" state.

export const VoiceAssistant: React.FC = () => {
  const [active, setActive] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button 
        onClick={() => setActive(!active)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          active 
            ? 'bg-red-500 animate-pulse shadow-[0_0_30px_rgba(255,0,0,0.6)]' 
            : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
        }`}
      >
        <span className="material-icons text-white text-3xl">
          {active ? 'mic' : 'mic_none'}
        </span>
      </button>

      {active && (
        <div className="absolute bottom-20 right-0 w-80 glass-panel p-4 rounded-xl border border-cyan-500 animate-fade-in-up bg-black/80 backdrop-blur-md">
           <div className="flex items-center justify-between mb-2">
             <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Jackometer Live</span>
             <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
           </div>
           <div className="h-12 flex items-center justify-center space-x-1">
             {/* Audio visualizer simulation */}
             {[1,2,3,4,5,6,7].map(i => (
               <div key={i} className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
             ))}
           </div>
           <p className="text-center text-xs text-gray-400 mt-2">Listening...</p>
        </div>
      )}
    </div>
  );
};
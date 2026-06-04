import React, { useState, useEffect, useRef } from 'react';
import { AppView } from '../types';
import { showToast } from '../lib/dialogs';

interface VoiceAssistantProps {
  setView?: (view: AppView) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ setView }) => {
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);
        
        if (event.results[event.results.length - 1].isFinal) {
           handleCommand(event.results[event.results.length - 1][0].transcript);
        }
      };

      recognitionRef.current.onerror = (e: any) => {
        console.error("Speech Error:", e);
        showToast("Voice recognition error: " + e.error, "error");
        setActive(false);
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if it was intended to be active
        if (active) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                setActive(false);
            }
        }
      };
    }
    
    return () => {
       if (recognitionRef.current) {
         recognitionRef.current.stop();
       }
    };
  }, [active, setView]);

  const handleCommand = (text: string) => {
     const lowerText = text.toLowerCase();
     
     if (!setView) return;

     // Stop command
     if (lowerText.includes('stop listening') || lowerText.includes('cancel voice')) {
        showToast("Voice assistant deactivated", "success");
        toggle();
        return;
     }

     // Navigation commands
     if (lowerText.includes('go to ') || lowerText.includes('open ') || lowerText.includes('show ')) {
       if (lowerText.includes('research')) setView(AppView.RESEARCH);
       else if (lowerText.includes('literature') || lowerText.includes('review')) setView(AppView.LIT_REVIEW);
       else if (lowerText.includes('project') || lowerText.includes('draft')) setView(AppView.PROJECTS);
       else if (lowerText.includes('document') || lowerText.includes('writer')) setView(AppView.DOCUMENT_WRITER);
       else if (lowerText.includes('essay')) setView(AppView.ESSAY_REVIEWER);
       else if (lowerText.includes('dojo') || lowerText.includes('study')) setView(AppView.STUDY_DOJO);
       else if (lowerText.includes('field trip')) setView(AppView.FIELD_TRIP);
       else if (lowerText.includes('technical report')) setView(AppView.TECHNICAL_REPORT);
       else if (lowerText.includes('lab report')) setView(AppView.LAB_REPORT);
       else if (lowerText.includes('career') || lowerText.includes('resume') || lowerText.includes('cv')) setView(AppView.CAREER);
       else if (lowerText.includes('data') || lowerText.includes('cruncher')) setView(AppView.DATA_CRUNCHER);
       else if (lowerText.includes('community') || lowerText.includes('scholar hub')) setView(AppView.COMMUNITY);
       else if (lowerText.includes('inbox') || lowerText.includes('message')) setView(AppView.INBOX);
       else if (lowerText.includes('notification')) setView(AppView.NOTIFICATIONS);
       else if (lowerText.includes('setting')) setView(AppView.SETTINGS);
       else if (lowerText.includes('profile') || lowerText.includes('account')) setView(AppView.PROFILE);
       else if (lowerText.includes('assignment') || lowerText.includes('homework')) setView(AppView.ASSIGNMENT);
       else if (lowerText.includes('compress')) setView(AppView.COMPRESSOR);
       else if (lowerText.includes('defense prep')) setView(AppView.DEFENSE_PREP);
       else if (lowerText.includes('slop shield')) setView(AppView.SLOP_SHIELD);
       else if (lowerText.includes('statistic') || lowerText.includes('stats')) setView(AppView.STATISTICS);
       else if (lowerText.includes('dashboard') || lowerText.includes('home')) setView(AppView.DASHBOARD);
       
       showToast("Navigating via voice...", "success");
     }
  };

  const toggle = () => {
    if (!recognitionRef.current) {
        showToast("Speech recognition is not supported in this browser.", "error");
        return;
    }

    if (active) {
       recognitionRef.current.stop();
       setActive(false);
       setTranscript('');
    } else {
       try {
           recognitionRef.current.start();
           setActive(true);
           setTranscript('');
           showToast("Voice assistant listening. Say 'open research' or 'stop listening'.", "success");
       } catch (e) {
           console.error("Start error", e);
           setActive(false);
       }
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button 
        onClick={toggle}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          active 
            ? 'bg-red-500 animate-pulse shadow-[0_0_30px_rgba(255,0,0,0.6)]' 
            : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
        }`}
        title="Voice Navigation Assistant"
      >
        <span className="material-icons text-white text-3xl">
          {active ? 'mic' : 'mic_none'}
        </span>
      </button>

      {active && (
        <div className="absolute bottom-20 right-0 w-80 glass-panel p-4 rounded-xl border border-cyan-500 animate-fade-in-up bg-black/80 backdrop-blur-md">
           <div className="flex items-center justify-between mb-2">
             <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Jackometer Voice</span>
             <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
           </div>
           <div className="h-12 flex items-center justify-center space-x-1">
             {/* Audio visualizer simulation */}
             {[1,2,3,4,5,6,7].map(i => (
               <div key={i} className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
             ))}
           </div>
           <p className="text-center text-xs text-gray-400 mt-2 min-h-[20px] italic">
               {transcript || "Listening for commands..."}
           </p>
           <p className="text-center text-[10px] text-gray-500 mt-1">Try: "Open Research" or "Go to Community"</p>
        </div>
      )}
    </div>
  );
};

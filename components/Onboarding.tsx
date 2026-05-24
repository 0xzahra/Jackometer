import React, { useState, useEffect } from 'react';

export const Onboarding = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial_seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem('tutorial_seen', 'true');
    setIsOpen(false);
  };

  const steps = [
    {
      title: "Welcome to Jackometer",
      text: "Your Academic Intelligence Suite. We are here to help you draft, review, and crunch data.",
      icon: "school"
    },
    {
      title: "Document Writer",
      text: "Draft papers rapidly. Includes draft history so nothing is ever lost.",
      icon: "history_edu"
    },
    {
      title: "Slop Shield",
      text: "Run your text through our filter to remove unnecessary filler text.",
      icon: "security"
    },
    {
      title: "Ready to Explore!",
      text: "Click around, discover tools, and elevate your academic work.",
      icon: "rocket_launch"
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg p-8 animate-fade-in text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-6">
           <span className="material-icons text-3xl text-[var(--accent)]">{steps[step].icon}</span>
        </div>
        <h2 className="text-2xl font-bold font-serif mb-4 text-[var(--text-primary)]">{steps[step].title}</h2>
        <p className="text-[var(--text-secondary)] mb-8 min-h-[60px]">{steps[step].text}</p>
        
        <div className="flex w-full items-center justify-between mt-auto pt-4 border-t border-[var(--border-color)]">
          <button onClick={close} className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors">Skip</button>
          
          <div className="flex gap-2">
             {steps.map((_, i) => (
               <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-[var(--accent)]' : 'bg-[var(--text-secondary)]/30'}`} />
             ))}
          </div>

          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="btn-primary py-2 px-4 text-xs">Next</button>
          ) : (
            <button onClick={close} className="btn-primary py-2 px-4 text-xs">Get Started</button>
          )}
        </div>
      </div>
    </div>
  );
};

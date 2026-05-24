import React, { useState } from 'react';
import { SlopShield } from './SlopShield';

export const SlopShieldPage: React.FC = () => {
  const [text, setText] = useState('');

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-[var(--text-primary)]">Slop Shield</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2">Paste generated text here to detect and strip out academic filler text.</p>
      </div>
      
      <div className="sketch-card p-6 flex-1 flex flex-col min-h-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here..."
          className="w-full flex-1 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-[var(--text-primary)] min-h-[300px] border border-[var(--border-color)] rounded-lg p-4"
        />
        
        {text && (
          <div className="mt-4 border-t border-[var(--border-color)] pt-4">
             <SlopShield text={text} onSharpened={setText} />
          </div>
        )}
      </div>
    </div>
  );
};

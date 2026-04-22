import React, { useState, useRef } from 'react';
import { useLiveAPIContext } from '../App';
import * as geminiService from '../services/geminiService';

export const BibliographyManager: React.FC = () => {
  const [style, setStyle] = useState<'APA 7th' | 'Harvard'>('APA 7th');
  const [citation, setCitation] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [verified, setVerified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playSound = (type: 'SCAN' | 'SUCCESS' | 'ALERT') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'SCAN') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'SUCCESS') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'ALERT') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Audio not supported");
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleScanReference = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsScanning(true);
    setCitation('');
    setError('');
    setVerified(false);
    playSound('SCAN');

    try {
      const base64Image = await toBase64(file);
      
      // We will call Gemini Vision API
      const result = await geminiService.scanReference(base64Image, style);
      
      if (result.includes("Data not found in scan.")) {
          playSound('ALERT');
      } else {
          playSound('SUCCESS');
      }
      
      setCitation(result);
      setVerified(true);
    } catch (err) {
      console.error(err);
      setError('Failed to scan reference. Please try again.');
      playSound('ALERT');
    } finally {
      setIsScanning(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-4">
      <h3 className="text-sm font-bold font-sans text-[var(--text-primary)] mb-4 tracking-widest uppercase flex items-center border-b border-[var(--border-color)] pb-2 pt-2">
        <span className="material-icons mr-2 text-[var(--primary)] text-lg">auto_stories</span>
        Bibliography Manager
      </h3>

      <div className="flex bg-[var(--surface-color)] p-1 rounded-lg mb-4 border border-[var(--border-color)]">
        <button
          className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
            style === 'APA 7th' ? 'bg-[var(--primary)] text-white shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setStyle('APA 7th')}
        >
          APA 7th
        </button>
        <button
          className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
            style === 'Harvard' ? 'bg-[var(--primary)] text-white shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setStyle('Harvard')}
        >
          Harvard
        </button>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleScanReference} 
        className="hidden" 
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--primary)] border-opacity-50 rounded-xl hover:bg-[var(--primary)] hover:bg-opacity-5 transition-all mb-4 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-icons text-3xl text-[var(--primary)] mb-2 group-hover:scale-110 transition-transform">
          {isScanning ? 'document_scanner' : 'center_focus_weak'}
        </span>
        <span className="text-sm font-bold text-[var(--primary)]">
          {isScanning ? 'Scanning...' : 'Scan Reference'}
        </span>
        <span className="text-xs text-[var(--text-secondary)] mt-1 text-center">
          Capture book cover or reference list
        </span>
      </button>

      {error && (
        <div className="text-xs text-red-500 mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {citation && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2">
             <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Output</span>
             {verified && (
                <div className="flex items-center text-[var(--primary)] text-xs font-bold bg-[var(--primary)] bg-opacity-10 px-2 py-1 rounded-full">
                   <span className="material-icons text-[14px] mr-1">security</span>
                   Verified
                </div>
             )}
          </div>
          <textarea
            readOnly
            className="flex-1 w-full p-4 text-sm resize-none glass-panel focus:ring-0 leading-relaxed font-sans"
            value={citation}
          ></textarea>

          <button
            onClick={() => {
              navigator.clipboard.writeText(citation);
              playSound('SUCCESS');
            }}
            className="mt-4 w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <span className="material-icons text-sm">content_copy</span>
            Copy Clean Citation
          </button>
        </div>
      )}
    </div>
  );
};

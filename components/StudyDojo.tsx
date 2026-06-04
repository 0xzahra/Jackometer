import React, { useState, useEffect } from 'react';
import { listDrivePdfs, DriveFile } from '../lib/drive';
import { customAlert } from '../lib/dialogs';

export const StudyDojo = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<{role: 'user' | 'ai', msg: string}[]>([
    { role: 'ai', msg: 'Welcome to the Study Dojo. Upload a PDF or import from Google Drive to begin adaptive exam prep.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState('');
  
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPdfUrl(url);
      setChatLog(prev => [...prev, { role: 'ai', msg: `I have analyzed "${e.target.files![0].name}". I'm ready to generate mock exams, flashcards, or answer your questions. What would you like to do?` }]);
    }
  };

  const handleOpenDrive = async () => {
    setIsDriveModalOpen(true);
    setDriveLoading(true);
    try {
      const files = await listDrivePdfs();
      setDriveFiles(files);
    } catch (error: any) {
      customAlert(error.message || "Failed to load Drive files.");
      setIsDriveModalOpen(false);
    } finally {
      setDriveLoading(false);
    }
  };

  const handleSelectDriveFile = (file: DriveFile) => {
    // For PDFs, we can embed the Google Drive webViewLink in an iframe if we replace /view with /preview
    const previewUrl = file.webViewLink.replace(/\/view.*$/, '/preview');
    setPdfUrl(previewUrl);
    setIsDriveModalOpen(false);
    setChatLog(prev => [...prev, { role: 'ai', msg: `I have analyzed "${file.name}". I'm ready to generate mock exams, flashcards, or answer your questions.` }]);
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;
    setChatLog(prev => [...prev, { role: 'user', msg: inputVal }]);
    setInputVal('');
    setLoading(true);

    setTimeout(() => {
      setChatLog(prev => [...prev, { role: 'ai', msg: "I'm analyzing the requested section of the document..." }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full p-4 gap-4 max-w-[1600px] mx-auto min-h-full">
       {/* Drive Modal */}
       {isDriveModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-[var(--panel-bg)] border border-[var(--border-color)] max-w-lg w-full rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
             <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--surface-color)]">
                <h3 className="font-bold flex items-center gap-2"><span className="material-icons text-blue-400">add_to_drive</span> Select PDF from Google Drive</h3>
                <button onClick={() => setIsDriveModalOpen(false)} className="text-[var(--text-secondary)] hover:text-red-400"><span className="material-icons">close</span></button>
             </div>
             <div className="p-4 max-h-[60vh] overflow-y-auto">
                {driveLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-60">
                     <span className="material-icons animate-spin text-3xl mb-2 text-blue-400">refresh</span>
                     <p>Loading your files...</p>
                  </div>
                ) : driveFiles.length > 0 ? (
                  <ul className="space-y-2">
                    {driveFiles.map(file => (
                       <li key={file.id} 
                           onClick={() => handleSelectDriveFile(file)}
                           className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--surface-color)] border border-transparent hover:border-[var(--border-color)] cursor-pointer transition-colors">
                          <span className="material-icons text-red-400 text-2xl">picture_as_pdf</span>
                          <span className="font-medium truncate flex-1 text-sm">{file.name}</span>
                       </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10 opacity-60 text-sm">
                     No PDF files found in your Google Drive.
                  </div>
                )}
             </div>
           </div>
         </div>
       )}

       {/* Left Side: Upload / PDF Viewer */}
       <div className="w-full md:w-1/2 flex flex-col paper-panel h-full">
         <div className="p-4 border-b border-[var(--border-color)] bg-[var(--surface-color)] flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><span className="material-icons text-[var(--primary)] text-sm">picture_as_pdf</span> Document Viewer</h3>
            <div className="flex gap-2">
               <button onClick={handleOpenDrive} className="bg-[var(--panel-bg)] hover:bg-[var(--surface-color)] text-[var(--text-primary)] text-xs border border-[var(--border-color)] px-3 py-1.5 rounded flex items-center gap-1 transition-all shadow-sm">
                  <span className="material-icons text-[14px] text-blue-400">add_to_drive</span>
                  Drive Focus
               </button>
               <label className="bg-[var(--primary)] hover:bg-[var(--accent-deep)] text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-all shadow">
                  <span className="material-icons text-[14px]">upload_file</span>
                  Upload PDF
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
               </label>
            </div>
         </div>
         
         <div className="flex-1 bg-[#1a1a1c] relative min-h-[300px]">
           {pdfUrl ? (
             <iframe src={pdfUrl} className="w-full h-full border-none" title="PDF Viewer" />
           ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-60 pointer-events-none p-6 text-center">
                <span className="material-icons text-6xl mb-4 text-[var(--border-color)]">cloud_upload</span>
                <p className="font-sans font-medium">No document loaded.</p>
                <p className="text-xs mt-2 max-w-sm">Upload a PDF or select from Google Drive to enable Active Recall Testing, Flashcards, and split-screen analysis.</p>
             </div>
           )}
         </div>
       </div>

       {/* Right Side: AI Assistant & Chat */}
       <div className="w-full md:w-1/2 flex flex-col paper-panel h-full">
          <div className="p-4 border-b border-[var(--border-color)] bg-[var(--surface-color)] flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><span className="material-icons text-[var(--primary)] text-sm">smart_toy</span> Diagnostic Assistant</h3>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded border border-[var(--primary)]/20 shadow-sm">
                   <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse mr-1"></span>
                   SHIELD ACTIVE
                </span>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {chatLog.map((log, i) => (
                <div key={i} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${log.role === 'user' ? 'bg-[var(--primary)] text-emerald-950 font-medium' : 'bg-[var(--panel-bg)] border border-[var(--border-color)] text-[var(--text-primary)]'}`}>
                      {log.msg}
                   </div>
                </div>
             ))}
             {loading && (
               <div className="flex justify-start">
                   <div className="max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed bg-[var(--panel-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-2">
                      <span className="material-icons animate-spin text-sm">refresh</span> Processing...
                   </div>
               </div>
             )}
          </div>
          
          <div className="p-4 bg-[var(--surface-color)] border-t border-[var(--border-color)]">
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for summaries, mock exams, or flashcards..." 
                  className="flex-1 text-sm bg-[var(--panel-bg)]"
                />
                <button onClick={handleSend} className="bg-[var(--primary)] hover:bg-[var(--accent-deep)] text-white w-12 h-[46px] rounded-xl flex items-center justify-center transition-all shadow">
                   <span className="material-icons text-lg">send</span>
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

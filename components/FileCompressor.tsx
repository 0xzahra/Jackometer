import React, { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

interface CompressedFile {
  id: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  blob: Blob;
  type: string;
  status: 'DONE' | 'PROCESSING' | 'ERROR';
  savings: number;
}

export const FileCompressor: React.FC = () => {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState(0.6); // For images
  const [targetSizeKB, setTargetSizeKB] = useState<string>(''); // Target size input

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = async (file: File) => {
    const id = Date.now().toString() + Math.random();
    
    // Initial State
    const newFileEntry: CompressedFile = {
      id,
      originalName: file.name,
      originalSize: file.size,
      compressedSize: 0,
      blob: new Blob(),
      type: file.type,
      status: 'PROCESSING',
      savings: 0
    };

    setFiles(prev => [newFileEntry, ...prev]);

    try {
      let resultBlob: Blob;

      if (file.type.startsWith('image/')) {
        // IMAGE COMPRESSION USING browser-image-compression
        let options = {
          maxSizeMB: targetSizeKB && !isNaN(parseFloat(targetSizeKB)) && parseFloat(targetSizeKB) > 0 
                     ? parseFloat(targetSizeKB) / 1024 
                     : undefined,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: targetSizeKB ? 0.8 : compressionLevel,
          alwaysKeepResolution: !targetSizeKB
        };
        
        resultBlob = await imageCompression(file, options);
      } else {
        // GENERIC COMPRESSION USING JSZip
        const zip = new JSZip();
        zip.file(file.name, file);
        resultBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: {
            level: 6 // standard compression level
          }
        });
      }

      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          const savings = ((file.size - resultBlob.size) / file.size) * 100;
          return {
            ...f,
            compressedSize: resultBlob.size,
            blob: resultBlob,
            type: resultBlob.type, 
            status: 'DONE',
            savings: savings > 0 ? savings : 0
          };
        }
        return f;
      }));

    } catch (e) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'ERROR' } : f));
      console.error(e);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  }, [compressionLevel, targetSizeKB]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
    }
  };

  const downloadFile = (file: CompressedFile) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Determine extension based on ACTUAL output type
    let ext = '';
    if (file.type === 'image/jpeg') ext = '.jpg';
    else if (file.type === 'image/png') ext = '.png';
    else if (file.type === 'image/webp') ext = '.webp';
    else if (file.type === 'application/zip' || file.type.includes('zip') || file.originalName.endsWith('.zip')) ext = '.zip';
    else ext = '.zip'; // Default for JSZip generated content

    let downloadName = file.originalName;
    if (file.originalName.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
       // Remove original extension and replace
       const namePart = downloadName.substring(0, downloadName.lastIndexOf('.')) || downloadName;
       downloadName = `min_${namePart}${ext}`;
    } else {
       // It's a zip archive
       const namePart = downloadName.substring(0, downloadName.lastIndexOf('.')) || downloadName;
       downloadName = `${namePart}.zip`;
    }

    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col pt-4">
      <div className="mb-6 px-4">
        <h2 className="text-3xl font-sans font-bold text-[var(--text-primary)]">File Compressor</h2>
        <p className="text-[var(--text-secondary)] tracking-tight">Universal file compressor & media optimizer. Supports any file sizes without freezing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 overflow-y-auto px-4 pb-8">
        
        {/* Controls */}
        <div className="md:col-span-1 space-y-6 flex flex-col h-full">
          <div className="glass-panel p-6 shadow-xl sticky top-0">
            <h3 className="font-bold font-sans text-lg text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <span className="material-icons text-[var(--accent)]">tune</span> Settings
            </h3>
            
            {/* Target Size Input */}
            <div className="mb-6 pb-6 border-b border-[var(--border-color)]">
               <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2 block">Target File Size (KB)</label>
               <input 
                 type="number"
                 placeholder="e.g. 500"
                 min="1"
                 value={targetSizeKB}
                 onChange={(e) => setTargetSizeKB(e.target.value)}
                 className="w-full bg-white/50 dark:bg-black/20 border border-[var(--border-color)] p-3 rounded-lg text-sm focus:border-[var(--primary)] outline-none shadow-inner"
               />
               <p className="text-[10px] text-[var(--text-secondary)] mt-2 leading-tight">
                 Auto-resizes images iteratively to fit strictly using Web Workers. <br/>
                 <span className="text-emerald-600 font-bold">Applies only to Images.</span>
               </p>
            </div>

            <div className={`mb-6 transition-opacity ${targetSizeKB ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
               <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-3 block">Image Quality</label>
               <input 
                 type="range" 
                 min="0.1" 
                 max="1" 
                 step="0.1" 
                 value={compressionLevel}
                 onChange={(e) => setCompressionLevel(parseFloat(e.target.value))}
                 className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
               />
               <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-2 font-bold">
                 <span>Max Compression</span>
                 <span className="text-[var(--primary)]">{(compressionLevel * 100).toFixed(0)}% Quality</span>
                 <span>Best Quality</span>
               </div>
            </div>

            <div className="bg-[var(--surface-color)] p-4 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-primary)] shadow-sm">
               <p className="font-bold mb-2 flex items-center"><span className="material-icons text-sm align-middle mr-1 text-[var(--primary)]">info</span> How it works:</p>
               <ul className="list-disc pl-5 space-y-2 opacity-80">
                 <li><strong>Images (JPG, PNG, WebP):</strong> Compressed seamlessly in the background (Web Workers) without freezing the UI.</li>
                 <li><strong>Documents (PDF, DOCX) & Other:</strong> Losslessly archived into ZIP format for optimal delivery.</li>
               </ul>
            </div>
          </div>
        </div>

        {/* Drop Zone & List */}
        <div className="md:col-span-2 flex flex-col h-full">
           <div 
             className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer mb-8 relative overflow-hidden group shadow-md ${isDragging ? 'border-[var(--primary)] bg-[var(--primary)]/10 scale-[1.02]' : 'border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-[var(--primary)]/5'}`}
             onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
             onDragLeave={() => setIsDragging(false)}
             onDrop={handleDrop}
             onClick={() => document.getElementById('fileInput')?.click()}
           >
             <input type="file" id="fileInput" multiple className="hidden" onChange={handleFileSelect} />
             
             <div className="w-20 h-20 bg-[var(--bg-color)] rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-icons text-4xl text-[var(--primary)]">cloud_upload</span>
             </div>
             <p className="font-sans text-xl font-bold text-[var(--text-primary)] tracking-tight">Drop files here or click to upload</p>
             <p className="text-sm text-[var(--text-secondary)] mt-2 opacity-80">Supports PDF, JPG, PNG, MP4, DOCX...</p>
             
             {isDragging && <div className="absolute inset-0 border-4 border-[var(--primary)] rounded-2xl opacity-50"></div>}
           </div>

           <div className="flex-1 space-y-4">
             {files.length === 0 && (
               <div className="text-center text-[var(--text-secondary)] opacity-50 italic mt-12 bg-[var(--surface-color)]/30 rounded-xl p-8 border border-dashed border-[var(--border-color)]">
                 No files queued for compression.
               </div>
             )}
             
             {files.map(file => (
               <div key={file.id} className="glass-panel p-5 flex items-center justify-between animate-fade-in-up border-l-4 border-l-[var(--primary)]">
                 <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md ${file.status === 'DONE' ? 'bg-emerald-500' : file.status === 'ERROR' ? 'bg-red-500' : 'bg-[var(--primary)] animate-pulse'}`}>
                      <span className="material-icons">{file.status === 'DONE' ? 'check' : file.status === 'ERROR' ? 'error' : 'hourglass_empty'}</span>
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="font-bold text-base text-[var(--text-primary)] truncate font-sans tracking-tight">{file.originalName}</p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1">
                        <span className="font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{formatSize(file.originalSize)}</span>
                        {file.status === 'DONE' && (
                          <>
                             <span className="material-icons text-[12px] text-gray-400">arrow_forward</span> 
                             <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{formatSize(file.compressedSize)}</span>
                             <span className="bg-emerald-500 text-white font-bold px-2 py-0.5 rounded shadow-sm text-[10px]">-{file.savings.toFixed(1)}%</span>
                             {targetSizeKB && file.compressedSize <= parseFloat(targetSizeKB) * 1024 && file.type.startsWith('image/') && (
                               <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold text-[10px] flex items-center shadow-sm" title="Target Met"><span className="material-icons text-[10px] mr-1">gps_fixed</span>Target Met</span>
                             )}
                          </>
                        )}
                      </div>
                    </div>
                 </div>

                 {file.status === 'DONE' && (
                   <button 
                     onClick={() => downloadFile(file)}
                     className="ml-4 bg-[var(--text-primary)] text-[var(--bg-color)] px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 whitespace-nowrap shadow-md flex items-center gap-2 transition-transform hover:scale-105"
                   >
                     <span className="material-icons text-sm">download</span>
                     Download
                   </button>
                 )}
                 {file.status === 'PROCESSING' && (
                   <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs ml-4">
                      <span className="material-icons animate-spin text-sm">refresh</span>
                      Compressing...
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};
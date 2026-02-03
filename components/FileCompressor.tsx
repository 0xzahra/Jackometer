import React, { useState, useRef, useCallback } from 'react';

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
        // IMAGE COMPRESSION
        if (targetSizeKB && !isNaN(parseFloat(targetSizeKB)) && parseFloat(targetSizeKB) > 0) {
            const targetBytes = parseFloat(targetSizeKB) * 1024;
            // Use robust iterative approach
            resultBlob = await compressImageToTarget(file, targetBytes);
        } else {
            // Use simple slider approach
            resultBlob = await compressImage(file, compressionLevel);
        }
      } else {
        // GENERIC GZIP COMPRESSION
        resultBlob = await compressGeneric(file);
      }

      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          const savings = ((file.size - resultBlob.size) / file.size) * 100;
          return {
            ...f,
            compressedSize: resultBlob.size,
            blob: resultBlob,
            type: resultBlob.type, // Update type in case of format change (PNG -> JPEG)
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

  const compressGeneric = async (file: File): Promise<Blob> => {
    if ('CompressionStream' in window) {
      const stream = file.stream().pipeThrough(new CompressionStream('gzip'));
      const response = new Response(stream);
      return await response.blob();
    } else {
      throw new Error("Browser does not support CompressionStream");
    }
  };

  // Standard compression using slider value
  const compressImage = async (file: File, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject("No Canvas Context"); return; }
        
        // Resize logic
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1920; 
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        // Force JPEG for PNGs to ensure compression (unless WebP/other)
        // Canvas toBlob ignores quality for PNG.
        const outputType = file.type === 'image/png' ? 'image/jpeg' : file.type;

        if (file.type === 'image/png' && outputType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Canvas blob error");
        }, outputType, quality); 
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * ROBUST COMPRESSION ALGORITHM
   * 1. Binary searches quality (0.01 - 1.0)
   * 2. If quality reduction isn't enough, strictly scales down dimensions (resolution)
   * 3. Converts PNG to JPEG to ensure compression settings actually work
   */
  const compressImageToTarget = async (file: File, targetBytes: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = async () => {
        let width = img.width;
        let height = img.height;
        
        // Output format: prefer jpeg for compression ratio control.
        // If file is PNG, we switch to JPEG because canvas.toBlob ignores quality param for PNGs.
        const outputType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';

        // Helper to draw and compress
        const attemptCompression = async (w: number, h: number, q: number): Promise<Blob> => {
             const canvas = document.createElement('canvas');
             canvas.width = w;
             canvas.height = h;
             const ctx = canvas.getContext('2d');
             if (!ctx) throw new Error("No context");
             
             // If converting PNG to JPEG, fill background white to avoid black transparency
             if (file.type === 'image/png' && outputType === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, w, h);
             }

             ctx.drawImage(img, 0, 0, w, h);
             return new Promise(res => canvas.toBlob(b => res(b!), outputType, q));
        };

        // 1. Initial max dimension cap (Optimization)
        const MAX_WIDTH = 2500; 
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        // Optimization Loop
        // Limit iterations to prevent freezing, but allow enough to shrink huge images
        for (let step = 0; step < 15; step++) {
            
            // Phase A: Binary Search Quality for Current Resolution
            let minQ = 0.01;
            let maxQ = 1.0;
            let bestBlob: Blob | null = null;

            for (let i = 0; i < 6; i++) { // 6 steps gives ~1.5% precision on quality
                const midQ = (minQ + maxQ) / 2;
                const blob = await attemptCompression(width, height, midQ);
                
                if (blob.size <= targetBytes) {
                    bestBlob = blob;
                    minQ = midQ; // It fits! Try to get higher quality
                } else {
                    maxQ = midQ; // Too big, need lower quality
                }
            }

            // If we found a fit in this dimension (even at low quality), return it
            if (bestBlob) {
                resolve(bestBlob);
                return;
            }

            // Phase B: If quality reduction failed, try absolute minimum quality
            const minBlob = await attemptCompression(width, height, 0.01);
            if (minBlob.size <= targetBytes) {
                resolve(minBlob);
                return;
            }

            // Phase C: Still too big? Reduce dimensions and loop
            // Reduce by ~30% area each step
            width = Math.floor(width * 0.85);
            height = Math.floor(height * 0.85);

            // Safety break for tiny images
            if (width < 50 || height < 50) {
                resolve(minBlob); // Return whatever we have, can't go smaller practically
                return;
            }
        }
        
        // Fallback
        const fallback = await attemptCompression(width, height, 0.5);
        resolve(fallback);
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
    else ext = '.gz'; 

    let downloadName = file.originalName;
    if (file.type.startsWith('image/')) {
       // Remove original extension
       const namePart = downloadName.substring(0, downloadName.lastIndexOf('.')) || downloadName;
       downloadName = `min_${namePart}${ext}`;
    } else {
       downloadName = `${file.originalName}.gz`;
    }

    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-[var(--text-primary)]">File Studio</h2>
        <p className="text-[var(--text-secondary)]">Universal file compressor & media optimizer. Supports any file size.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        
        {/* Controls */}
        <div className="md:col-span-1 space-y-6">
          <div className="paper-panel p-6 rounded-sm">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
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
                 className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-2 rounded text-sm focus:border-[var(--accent)] outline-none"
               />
               <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                 Auto-resizes images to fit strictly. <br/>
                 <span className="text-orange-600 font-bold">Applies only to Images.</span>
               </p>
            </div>

            <div className={`mb-4 transition-opacity ${targetSizeKB ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
               <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1 block">Image Quality (Lossy)</label>
               <input 
                 type="range" 
                 min="0.1" 
                 max="1" 
                 step="0.1" 
                 value={compressionLevel}
                 onChange={(e) => setCompressionLevel(parseFloat(e.target.value))}
                 className="w-full accent-[var(--accent)]"
               />
               <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                 <span>Max Compression</span>
                 <span>{(compressionLevel * 100).toFixed(0)}% Quality</span>
                 <span>Best Quality</span>
               </div>
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-100 text-xs text-blue-800">
               <p className="font-bold mb-1"><span className="material-icons text-xs align-middle">info</span> How it works:</p>
               <ul className="list-disc pl-4 space-y-1">
                 <li><strong>Strict Target:</strong> Compresses aggressively by reducing dimensions if needed.</li>
                 <li><strong>Docs/Videos:</strong> GZIP archived (.gz) for efficient transfer.</li>
               </ul>
            </div>
          </div>
        </div>

        {/* Drop Zone & List */}
        <div className="md:col-span-2 flex flex-col">
           <div 
             className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer mb-6 ${isDragging ? 'border-[var(--accent)] bg-blue-50' : 'border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-[var(--bg-color)]'}`}
             onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
             onDragLeave={() => setIsDragging(false)}
             onDrop={handleDrop}
             onClick={() => document.getElementById('fileInput')?.click()}
           >
             <input type="file" id="fileInput" multiple className="hidden" onChange={handleFileSelect} />
             <span className="material-icons text-5xl text-[var(--text-secondary)] mb-4">cloud_upload</span>
             <p className="font-bold text-[var(--text-primary)]">Drop files here or click to upload</p>
             <p className="text-xs text-[var(--text-secondary)] mt-2">Supports PDF, JPG, PNG, MP4, DOCX...</p>
           </div>

           <div className="flex-1 overflow-y-auto space-y-3">
             {files.length === 0 && (
               <div className="text-center text-[var(--text-secondary)] opacity-50 italic mt-10">
                 No files processed yet.
               </div>
             )}
             
             {files.map(file => (
               <div key={file.id} className="paper-panel p-4 rounded-sm flex items-center justify-between animate-fade-in-up">
                 <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${file.status === 'DONE' ? 'bg-green-500' : file.status === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'}`}>
                      <span className="material-icons">{file.status === 'DONE' ? 'check' : file.status === 'ERROR' ? 'error' : 'hourglass_empty'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[var(--text-primary)] truncate">{file.originalName}</p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>{formatSize(file.originalSize)}</span>
                        {file.status === 'DONE' && (
                          <>
                             <span className="material-icons text-[10px]">arrow_forward</span> 
                             <span className="font-bold text-green-600">{formatSize(file.compressedSize)}</span>
                             <span className="bg-green-100 text-green-800 px-1 rounded text-[10px]">-{file.savings.toFixed(1)}%</span>
                             {targetSizeKB && file.compressedSize <= parseFloat(targetSizeKB) * 1024 && (
                               <span className="bg-blue-100 text-blue-800 px-1 rounded text-[10px] flex items-center" title="Target Met"><span className="material-icons text-[10px] mr-1">gps_fixed</span>Target Met</span>
                             )}
                          </>
                        )}
                      </div>
                    </div>
                 </div>

                 {file.status === 'DONE' && (
                   <button 
                     onClick={() => downloadFile(file)}
                     className="ml-4 bg-[var(--text-primary)] text-[var(--bg-color)] px-3 py-1 rounded text-xs font-bold hover:opacity-80 whitespace-nowrap"
                   >
                     Download {file.type.includes('image') ? '' : '.gz'}
                   </button>
                 )}
                 {file.status === 'PROCESSING' && (
                   <span className="text-xs text-[var(--accent)] animate-pulse font-bold ml-4">Compressing...</span>
                 )}
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};
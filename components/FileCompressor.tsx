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
      if (file.size < 5120) { // < 5KB warning but still process
        // Just passthrough or minimal processing
      }

      let resultBlob: Blob;

      if (file.type.startsWith('image/')) {
        // IMAGE COMPRESSION via Canvas
        resultBlob = await compressImage(file, compressionLevel);
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
    // Use native CompressionStream
    if ('CompressionStream' in window) {
      const stream = file.stream().pipeThrough(new CompressionStream('gzip'));
      const response = new Response(stream);
      return await response.blob();
    } else {
      throw new Error("Browser does not support CompressionStream");
    }
  };

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
        
        // Resize logic (optional, keeping aspect ratio)
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1920; 
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Canvas blob error");
        }, file.type, quality); // quality 0-1
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
  }, [compressionLevel]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
    }
  };

  const downloadFile = (file: CompressedFile) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    // If it's generic gzip, append .gz, otherwise keep original name (for images)
    a.download = file.type.startsWith('image/') ? `min_${file.originalName}` : `${file.originalName}.gz`;
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
            
            <div className="mb-4">
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
                 <li><strong>Images:</strong> Intelligently resized & re-encoded.</li>
                 <li><strong>Docs/Videos:</strong> GZIP archived (.gz) for efficient transfer.</li>
                 <li><strong>Size:</strong> Supports > 5KB to GBs (Streaming).</li>
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
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatSize(file.originalSize)} 
                        {file.status === 'DONE' && (
                          <>
                             <span className="mx-1">→</span> 
                             <span className="font-bold text-green-600">{formatSize(file.compressedSize)}</span>
                             <span className="ml-2 bg-green-100 text-green-800 px-1 rounded text-[10px]">-{file.savings.toFixed(1)}%</span>
                          </>
                        )}
                      </p>
                    </div>
                 </div>

                 {file.status === 'DONE' && (
                   <button 
                     onClick={() => downloadFile(file)}
                     className="ml-4 bg-[var(--text-primary)] text-[var(--bg-color)] px-3 py-1 rounded text-xs font-bold hover:opacity-80 whitespace-nowrap"
                   >
                     Download {file.type.startsWith('image/') ? '' : '.gz'}
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
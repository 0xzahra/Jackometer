import React, { useState } from 'react';
import { generatePassportEdit, generateOptimizedCV, generateResume, reviewCareerDocument } from '../services/geminiService';
import { CVData } from '../types';

export const CareerStudio: React.FC = () => {
  const [tool, setTool] = useState<'PASSPORT' | 'CV' | 'RESUME' | 'REVIEW'>('PASSPORT');
  
  // Passport State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [passportLoading, setPassportLoading] = useState(false);

  // CV/Resume State
  const [docLoading, setDocLoading] = useState(false);
  const [docOutput, setDocOutput] = useState('');
  const [formData, setFormData] = useState<CVData>({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    experience: '',
    skills: ''
  });

  // Review State
  const [reviewInput, setReviewInput] = useState('');
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [reviewOutput, setReviewOutput] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Passport Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
      setProcessedImage(null);
    }
  };

  const processPassport = async (bg: 'white' | 'red') => {
    if (!selectedImage) return;
    setPassportLoading(true);
    try {
      const base64 = selectedImage.split(',')[1];
      const result = await generatePassportEdit(base64, bg);
      setProcessedImage(`data:image/png;base64,${result}`);
    } catch (e) {
      alert("Passport generation failed.");
    }
    setPassportLoading(false);
  };

  // Doc Logic
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateDoc = async () => {
    if (!formData.fullName) { alert("Name required"); return; }
    setDocLoading(true);
    try {
      const result = tool === 'CV' 
        ? await generateOptimizedCV(formData)
        : await generateResume(formData);
      setDocOutput(result);
    } catch (e) {
      alert("Generation failed.");
    }
    setDocLoading(false);
  };

  // Review Logic
  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result as string);
        setReviewInput(''); // Clear text input if image is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const processReview = async () => {
    if (!reviewInput && !reviewImage) return;
    setReviewLoading(true);
    try {
      let result = '';
      if (reviewImage) {
        result = await reviewCareerDocument({ image: reviewImage.split(',')[1] });
      } else {
        result = await reviewCareerDocument({ text: reviewInput });
      }
      setReviewOutput(result);
    } catch (e) {
      alert("Review failed.");
    }
    setReviewLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex mb-8 border-b border-[var(--border-color)] overflow-x-auto">
        {['PASSPORT', 'CV', 'RESUME', 'REVIEW'].map((t) => (
          <button 
            key={t}
            className={`px-8 py-4 font-serif font-bold text-sm transition-colors whitespace-nowrap ${tool === t ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent)] bg-[var(--panel-bg)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            onClick={() => setTool(t as any)}
          >
            {t === 'PASSPORT' ? 'Passport Builder' : t === 'CV' ? 'CV Builder' : t === 'RESUME' ? 'Resume Builder' : 'Review & Edit'}
          </button>
        ))}
      </div>

      {tool === 'PASSPORT' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="paper-panel p-8 rounded-sm">
            <h3 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-6">Upload Raw Photo</h3>
            <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg h-80 flex flex-col items-center justify-center bg-[var(--bg-color)] mb-6 relative overflow-hidden group hover:bg-[var(--panel-bg)] transition-colors">
              {selectedImage ? (
                <img src={selectedImage} className="h-full object-contain" alt="Upload" />
              ) : (
                <div className="text-center text-[var(--text-secondary)]">
                  <span className="material-icons text-5xl mb-2">add_a_photo</span>
                  <p className="font-serif">Click to upload image</p>
                </div>
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => processPassport('red')} disabled={passportLoading || !selectedImage} className="flex-1 bg-red-700 text-white py-3 rounded text-sm font-bold disabled:opacity-50">Red Background</button>
              <button onClick={() => processPassport('white')} disabled={passportLoading || !selectedImage} className="flex-1 bg-white border border-gray-300 text-black py-3 rounded text-sm font-bold disabled:opacity-50">White Background</button>
            </div>
          </div>

          <div className="paper-panel p-8 rounded-sm">
             <h3 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-6">Output</h3>
             <div className="border border-[var(--border-color)] rounded-lg h-80 flex items-center justify-center bg-white mb-6 relative shadow-inner">
               {passportLoading ? (
                 <div className="flex flex-col items-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--accent)] mb-2"></div><p className="text-xs text-[var(--text-secondary)]">Processing...</p></div>
               ) : processedImage ? (
                 <img src={processedImage} className="h-full object-contain shadow-lg" alt="Processed" />
               ) : (
                 <span className="text-[var(--text-secondary)] font-serif italic">Output will appear here</span>
               )}
             </div>
          </div>
        </div>
      )}

      {(tool === 'CV' || tool === 'RESUME') && (
        <div className="grid grid-cols-12 gap-8 h-full">
           <div className="col-span-5 paper-panel p-8 rounded-sm overflow-y-auto">
             <h3 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-6">{tool} Inputs</h3>
             <div className="space-y-4">
               <input name="fullName" value={formData.fullName} onChange={handleDataChange} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] outline-none" placeholder="Full Name" />
               <input name="email" value={formData.email} onChange={handleDataChange} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] outline-none" placeholder="Email" />
               <input name="phone" value={formData.phone} onChange={handleDataChange} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] outline-none" placeholder="Phone" />
               <textarea name="education" value={formData.education} onChange={handleDataChange} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] outline-none h-24" placeholder="Education"></textarea>
               <textarea name="experience" value={formData.experience} onChange={handleDataChange} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] outline-none h-32" placeholder="Experience"></textarea>
               <textarea name="skills" value={formData.skills} onChange={handleDataChange} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded text-[var(--text-primary)] outline-none h-20" placeholder="Skills"></textarea>
               <button onClick={generateDoc} disabled={docLoading} className="w-full bg-[var(--accent)] text-white py-4 rounded font-bold mt-4 shadow-lg">{docLoading ? 'Generating...' : `Generate ${tool}`}</button>
             </div>
           </div>

           <div className="col-span-7 paper-panel p-12 rounded-sm overflow-y-auto bg-white border border-[var(--border-color)] shadow-2xl relative min-h-[600px]">
              {docOutput ? (
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-black">{docOutput}</pre>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-30"><span className="material-icons text-6xl mb-4">description</span><p className="font-serif text-xl">Preview Canvas</p></div>
              )}
           </div>
        </div>
      )}

      {tool === 'REVIEW' && (
         <div className="grid grid-cols-12 gap-8 h-full">
            <div className="col-span-12 md:col-span-5 paper-panel p-8 rounded-sm overflow-y-auto">
               <h3 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-2">Upload Existing</h3>
               <p className="text-xs text-[var(--text-secondary)] mb-6">Upload a photo of your CV or paste the text directly for an AI critique & rewrite.</p>
               
               <div className="space-y-6">
                  {/* Image Upload */}
                  <div className={`border-2 border-dashed border-[var(--border-color)] rounded-lg h-40 flex flex-col items-center justify-center relative transition-colors ${reviewImage ? 'bg-blue-50 border-blue-300' : 'bg-[var(--bg-color)] hover:bg-[var(--panel-bg)]'}`}>
                     {reviewImage ? (
                        <div className="relative w-full h-full p-2">
                           <img src={reviewImage} className="w-full h-full object-contain" alt="Preview" />
                           <button onClick={() => setReviewImage(null)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow"><span className="material-icons text-xs">close</span></button>
                        </div>
                     ) : (
                        <>
                           <span className="material-icons text-3xl text-[var(--text-secondary)] mb-2">add_a_photo</span>
                           <p className="font-bold text-xs text-[var(--text-primary)]">Upload Photo / Screenshot</p>
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleReviewImageUpload} accept="image/*" />
                        </>
                     )}
                  </div>

                  <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-[var(--border-color)]"></div>
                      <span className="flex-shrink-0 mx-2 text-[var(--text-secondary)] text-[10px] font-bold">OR PASTE TEXT</span>
                      <div className="flex-grow border-t border-[var(--border-color)]"></div>
                  </div>

                  {/* Text Input */}
                  <textarea 
                     className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded text-sm text-[var(--text-primary)] outline-none h-40 resize-none font-mono"
                     placeholder="Paste your existing resume content here..."
                     value={reviewInput}
                     onChange={(e) => { setReviewInput(e.target.value); setReviewImage(null); }}
                     disabled={!!reviewImage}
                  ></textarea>

                  <button 
                     onClick={processReview} 
                     disabled={reviewLoading || (!reviewInput && !reviewImage)} 
                     className="w-full bg-[var(--accent)] text-white py-4 rounded font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                     {reviewLoading ? <span className="material-icons animate-spin">refresh</span> : <span className="material-icons">auto_fix_high</span>}
                     {reviewLoading ? 'Analyzing...' : 'Proofread & Edit'}
                  </button>
               </div>
            </div>

            <div className="col-span-12 md:col-span-7 paper-panel p-12 rounded-sm overflow-y-auto bg-white border border-[var(--border-color)] shadow-2xl relative min-h-[600px]">
               {reviewOutput ? (
                 <article className="prose prose-sm max-w-none">
                   <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-black">
                     {reviewOutput}
                   </div>
                 </article>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-30">
                   <span className="material-icons text-6xl mb-4">rate_review</span>
                   <p className="font-serif text-xl">Review Output Canvas</p>
                   <p className="text-xs mt-2">Improved version will appear here.</p>
                 </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
};
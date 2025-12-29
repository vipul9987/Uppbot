
import React, { useState } from 'react';
import { DesignerProfile } from '../types';
import { DESIGN_DOMAINS, DESIGN_TOOLS } from '../constants';
import { db } from '../services/mockDatabase';

interface OnboardingFormProps {
  userId: string;
  email: string;
  onComplete: () => void;
  initialData?: DesignerProfile;
  isEditing?: boolean;
  onCancel?: () => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ userId, email, onComplete, initialData, isEditing, onCancel }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(initialData?.credentialUrl?.split('|')[0] || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Omit<DesignerProfile, 'status'>>({
    userId,
    fullName: initialData?.fullName || '',
    country: initialData?.country || '',
    yearsExperience: initialData?.yearsExperience || 0,
    primarySkill: initialData?.primarySkill || DESIGN_DOMAINS[0],
    secondarySkills: initialData?.secondarySkills || [],
    tools: initialData?.tools || [],
    portfolioLinks: initialData?.portfolioLinks || { dribbble: '', behance: '', website: '' },
    credentialUrl: initialData?.credentialUrl || '',
    preferredProjectTypes: initialData?.preferredProjectTypes || [],
    availability: initialData?.availability || 20,
    bio: initialData?.bio || ''
  });

  const toggleTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        // Store filename and data separated by pipe
        const storageValue = `${file.name}|${base64String}`;
        setUploadedFileName(file.name);
        setFormData(prev => ({ ...prev, credentialUrl: storageValue }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tools.length === 0) {
      setErrors({ tools: "Required: Select tools." });
      return;
    }
    db.completeProfile(formData);
    onComplete();
  };

  const labelStyle = "text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2 block";
  const inputStyle = "w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 focus:border-orange-500 focus:bg-white rounded-lg outline-none transition-all font-bold text-slate-900 shadow-sm placeholder:text-slate-300";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
           {isEditing && (
             <button onClick={onCancel} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-orange-500 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
             </button>
           )}
           <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                {isEditing ? 'Sync Credentials' : 'Profile Initialization'}
              </h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 italic">Creative Core v4.8</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 01 */}
        <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
           <div className="flex items-center space-x-3 mb-8">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-md flex items-center justify-center text-[10px] font-black italic">01</span>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Basic Identity</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                 <label className={labelStyle}>Full Name</label>
                 <input type="text" required className={inputStyle} placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div className="space-y-1">
                 <label className={labelStyle}>Country Base</label>
                 <input type="text" required className={inputStyle} placeholder="United Kingdom" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              </div>
           </div>
        </div>

        {/* Section 02 */}
        <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
           <div className="flex items-center space-x-3 mb-8">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-md flex items-center justify-center text-[10px] font-black italic">02</span>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Expertise Deck</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-1">
                 <label className={labelStyle}>Primary Focus</label>
                 <select className={inputStyle} value={formData.primarySkill} onChange={(e) => setFormData({ ...formData, primarySkill: e.target.value })}>
                    {DESIGN_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>
              <div className="space-y-1">
                 <label className={labelStyle}>Tenure (Yrs)</label>
                 <input type="number" required className={inputStyle} value={formData.yearsExperience || ''} onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })} />
              </div>
           </div>
        </div>

        {/* Section 03 - Tools Mastery */}
        <div className="bg-slate-900 rounded-lg p-8 border border-slate-800 shadow-xl">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                 <span className="w-8 h-8 bg-orange-500 text-white rounded-md flex items-center justify-center text-[10px] font-black italic">03</span>
                 <h2 className="text-xs font-black text-white uppercase tracking-widest">Software Proficiency</h2>
              </div>
              {errors.tools && <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">{errors.tools}</span>}
           </div>
           <div className="flex flex-wrap gap-2">
              {DESIGN_TOOLS.map(tool => (
                <button 
                  key={tool} type="button" onClick={() => toggleTool(tool)} 
                  className={`px-5 py-3 rounded-md text-[9px] font-black border-2 transition-all uppercase tracking-widest ${
                    formData.tools.includes(tool) 
                    ? 'bg-orange-500 text-white border-orange-500' 
                    : 'bg-white/5 text-slate-400 border-transparent hover:border-orange-500/30'
                  }`}
                >
                  {tool}
                </button>
              ))}
           </div>
        </div>

        {/* Section 04 */}
        <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
           <div className="flex items-center space-x-3 mb-8">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-md flex items-center justify-center text-[10px] font-black italic">04</span>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Artifact Distribution</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="space-y-1">
                    <label className={labelStyle}>Main Portfolio Link</label>
                    <input type="url" className={inputStyle} placeholder="https://..." value={formData.portfolioLinks.website} onChange={(e) => setFormData({ ...formData, portfolioLinks: { ...formData.portfolioLinks, website: e.target.value } })} />
                 </div>
                 <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer relative group">
                    <input type="file" className="sr-only" id="f-up" onChange={handleFileUpload} />
                    <label htmlFor="f-up" className="cursor-pointer block">
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{isUploading ? 'Validating...' : uploadedFileName ? `SECURED: ${uploadedFileName}` : 'UPLOAD CREDENTIALS (PDF)'}</p>
                    </label>
                 </div>
              </div>
              <div className="space-y-1">
                 <label className={labelStyle}>Creative Statement</label>
                 <textarea rows={6} required className={`${inputStyle} resize-none`} placeholder="Briefly define your methodology..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
              </div>
           </div>
        </div>

        <div className="flex items-center justify-between pt-6">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight max-w-xs leading-relaxed">Verification protocol is triggered upon submission. Accurate data ensures higher matching priority.</p>
           <button type="submit" className="px-12 py-5 bg-orange-500 text-white font-black rounded-lg shadow-lg shadow-orange-500/10 hover:bg-slate-900 transition-all uppercase tracking-[0.2em] text-[10px]">
             {isEditing ? 'Confirm Update' : 'Initialize Session'}
           </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;

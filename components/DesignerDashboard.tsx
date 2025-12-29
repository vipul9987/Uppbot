
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { Assessment, Submission, SubmissionStatus } from '../types';

interface DesignerDashboardProps {
  userId: string;
  onEditProfile: () => void;
}

const DesignerDashboard: React.FC<DesignerDashboardProps> = ({ userId, onEditProfile }) => {
  const [profile, setProfile] = useState(db.getProfile(userId));
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [uploadLink, setUploadLink] = useState('');
  const [uploadFileData, setUploadFileData] = useState<{name: string, data: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentProfile = db.getProfile(userId);
    if (currentProfile) {
      setProfile(currentProfile);
      setAssessments(db.getAssignedAssessments(currentProfile));
      setSubmissions(db.getSubmissionsForDesigner(userId));
    }
  }, [userId]);

  const metrics = db.getDesignerMetrics(userId);
  const handleOpenSubmission = (asm: Assessment) => setSelectedAssessment(asm);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadFileData({
          name: file.name,
          data: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    setIsSubmitting(true);
    setTimeout(() => {
      // Logic: Save either Link or File data string
      const finalPayload = uploadFileData 
        ? `File: ${uploadFileData.name}|${uploadFileData.data}` 
        : uploadLink;

      db.submitAssessment({
        assessmentId: selectedAssessment.id,
        designerId: userId,
        externalLink: finalPayload
      });
      setSubmissions(db.getSubmissionsForDesigner(userId));
      setSelectedAssessment(null);
      setUploadLink('');
      setUploadFileData(null);
      setIsSubmitting(false);
    }, 1000);
  };

  const getSubmissionForAssessment = (asmId: string) => submissions.find(s => s.assessmentId === asmId);

  const cardStyle = "bg-white border border-slate-200 rounded-lg p-8 shadow-sm transition-all";
  const labelStyle = "text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2";

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 lg:px-8">
      {/* Real-time Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="md:col-span-2 bg-slate-900 text-white p-8 rounded-lg shadow-lg flex items-center justify-between">
           <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{profile?.fullName.split(' ')[0]}</h1>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-2">{profile?.primarySkill}</p>
           </div>
           <div className="text-right">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
              <span className="text-[10px] font-black uppercase border border-white/20 px-3 py-1.5 rounded-md">{profile?.status}</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
           <span className={labelStyle}>Verification Score</span>
           <span className="text-3xl font-black text-slate-900 tracking-tighter italic">{metrics.avgScore}%</span>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
           <span className={labelStyle}>Global Ranking</span>
           <span className="text-3xl font-black text-orange-500 tracking-tighter italic">TOP {metrics.percentile}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
           <div className="flex items-center space-x-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Assessments</h3>
              <div className="h-px bg-slate-200 flex-1"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assessments.filter(a => !getSubmissionForAssessment(a.id)).map(asm => (
                <div key={asm.id} className={`${cardStyle} hover:border-orange-500 cursor-pointer group flex flex-col h-full`} onClick={() => handleOpenSubmission(asm)}>
                   <div className="flex justify-between items-start mb-8">
                      <span className="bg-slate-50 border border-slate-100 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md text-slate-500">{asm.category}</span>
                      <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-300 group-hover:bg-orange-500 group-hover:text-white transition-all flex items-center justify-center">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                   </div>
                   <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3 leading-none">{asm.title}</h4>
                   <p className="text-slate-400 text-[11px] font-bold leading-relaxed mb-auto line-clamp-2">{asm.brief}</p>
                   <div className="pt-6 border-t border-slate-50 mt-8 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Deadline</span>
                        <span className="text-[10px] font-black text-slate-900 italic">{asm.timeLimit}</span>
                      </div>
                      <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest group-hover:tracking-[0.3em] transition-all">Begin Flow</span>
                   </div>
                </div>
              ))}
              {assessments.filter(a => !getSubmissionForAssessment(a.id)).length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-lg">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">All current assessments completed</p>
                </div>
              )}
           </div>

           <div className="flex items-center space-x-4 pt-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Verification History</h3>
              <div className="h-px bg-slate-200 flex-1"></div>
           </div>
           <div className="space-y-3">
              {submissions.length === 0 ? (
                <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest text-center py-6">No session history found</p>
              ) : submissions.map(sub => {
                const asm = assessments.find(a => a.id === sub.assessmentId);
                return (
                  <div key={sub.id} className="bg-white/50 border border-slate-200 rounded-lg p-5 flex items-center justify-between hover:bg-white transition-all">
                     <div className="flex items-center space-x-5">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${sub.status === SubmissionStatus.REVIEWED ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900 tracking-tight leading-none">{asm?.title}</p>
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1.5">Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        {sub.score !== undefined ? (
                          <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{sub.score}%</span>
                        ) : (
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Audit in progress</span>
                        )}
                     </div>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
           <div className={`${cardStyle}`}>
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Specialist ID</h3>
                 <button onClick={onEditProfile} className="text-[9px] font-black text-orange-600 uppercase tracking-widest border border-orange-100 px-3 py-1.5 rounded-md hover:bg-orange-50 transition-all">Sync Credentials</button>
              </div>
              <div className="space-y-6">
                 <div className="p-5 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-sm font-bold text-slate-600 italic leading-relaxed">"{profile?.bio || 'Synchronizing identity...'}"</p>
                 </div>
                 <div className="space-y-3">
                    <span className={labelStyle}>Software Arsenal</span>
                    <div className="flex flex-wrap gap-2">
                       {profile?.tools.map(t => <span key={t} className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm">{t}</span>)}
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-orange-500 rounded-lg p-8 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl transition-all group-hover:scale-150 duration-700"></div>
              <h3 className="text-[9px] font-black text-orange-200 uppercase tracking-widest mb-6">Internal Grade</h3>
              <p className="text-2xl font-black tracking-tight leading-none italic uppercase">Verified specialist</p>
              <div className="mt-8 pt-8 border-t border-white/20">
                 <div className="flex justify-between items-end mb-3">
                    <span className="text-[9px] font-black text-orange-200 uppercase tracking-widest">Network percentile</span>
                    <span className="text-xl font-black italic">{100 - metrics.percentile}%</span>
                 </div>
                 <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${100 - metrics.percentile}%` }}></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Submission Portal Modal - Standardized Design */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-lg max-w-xl w-full p-10 border border-slate-200 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{selectedAssessment.title}</h3>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-2">Submission Portal Core</p>
                 </div>
                 <button onClick={() => setSelectedAssessment(null)} className="p-2 hover:bg-slate-50 rounded-md text-slate-300 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <div className="space-y-8">
                 <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-600 leading-relaxed italic">
                    "{selectedAssessment.brief}"
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Asset Link (Figma/Webflow)</label>
                    <input 
                      type="url" 
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-orange-500 focus:bg-white rounded-lg outline-none transition-all font-bold text-slate-900 shadow-sm placeholder:text-slate-300"
                      placeholder="HTTPS://WWW.FIGMA.COM/..."
                      value={uploadLink}
                      onChange={(e) => setUploadLink(e.target.value)}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Documentation Archive</label>
                    <input type="file" id="m-file" className="hidden" onChange={handleFileChange} />
                    <label htmlFor="m-file" className={`flex flex-col items-center justify-center w-full py-12 border-2 border-dashed rounded-lg cursor-pointer transition-all ${uploadFileData ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-orange-500 hover:bg-orange-50/50'}`}>
                        <svg className={`w-8 h-8 mb-3 ${uploadFileData ? 'text-green-500' : 'text-slate-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">{uploadFileData ? uploadFileData.name : 'Attach Design Package (ZIP)'}</span>
                    </label>
                 </div>

                 <button 
                   onClick={handleSubmit} 
                   disabled={isSubmitting || (!uploadLink && !uploadFileData)}
                   className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-lg hover:bg-orange-500 transition-all shadow-lg active:scale-95 disabled:bg-slate-100"
                 >
                   {isSubmitting ? "ENCRYPTING DATA..." : "FINALIZE SUBMISSION"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DesignerDashboard;

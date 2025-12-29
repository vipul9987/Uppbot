
import React, { useState } from 'react';
import { db } from '../services/mockDatabase';
import { DesignerProfile, DesignerStatus, Submission, SubmissionStatus } from '../types';
import { MOCK_ASSESSMENTS } from '../constants';

const AdminDashboard: React.FC = () => {
  const [designers, setDesigners] = useState<DesignerProfile[]>(db.getAllProfiles());
  const [submissions, setSubmissions] = useState<Submission[]>(db.getAllSubmissions());
  const [selectedDesigner, setSelectedDesigner] = useState<DesignerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'TALENT' | 'SUBMISSIONS'>('TALENT');
  const [previewFile, setPreviewFile] = useState<{name: string, data: string} | null>(null);

  const [score, setScore] = useState(85);
  const [note, setNote] = useState('');

  const refreshData = () => {
    setDesigners([...db.getAllProfiles()]);
    setSubmissions([...db.getAllSubmissions()]);
  };

  const sysMetrics = db.getSystemMetrics();

  const handleUpdateStatus = (userId: string, status: DesignerStatus) => {
    db.updateDesignerStatus(userId, status);
    refreshData();
    if (selectedDesigner && selectedDesigner.userId === userId) {
      setSelectedDesigner(db.getProfile(userId)!);
    }
  };

  const handleReviewSubmission = (subId: string) => {
    db.updateSubmission(subId, {
      score,
      adminNote: note,
      status: SubmissionStatus.REVIEWED
    });
    setNote('');
    refreshData();
  };

  const handleDownload = (storageString: string) => {
    if (!storageString.includes('|')) {
       // It's a URL
       const url = storageString.startsWith('http') ? storageString : `https://${storageString}`;
       window.open(url, '_blank');
       return;
    }
    const [name, data] = storageString.split('|');
    const link = document.createElement('a');
    link.href = data;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDesignerSubmissions = (userId: string) => submissions.filter(s => s.designerId === userId);

  const statCard = "bg-white p-6 rounded-lg border border-slate-200 shadow-sm";
  const labelStyle = "text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1";

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 lg:px-8">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-slate-900 p-6 rounded-lg text-white shadow-lg">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">Total Specialists</span>
            <div className="flex items-end justify-between">
               <span className="text-3xl font-black">{sysMetrics.totalDesigners}</span>
               <span className="text-green-400 text-[9px] font-black uppercase tracking-widest">Active</span>
            </div>
         </div>
         <div className={statCard}>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Awaiting Audit</span>
            <div className="flex items-end justify-between">
               <span className="text-3xl font-black text-slate-900">{sysMetrics.pendingCount}</span>
               <span className="text-orange-500 text-[10px] font-bold uppercase">Priority</span>
            </div>
         </div>
         <div className={statCard}>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Audit Efficiency</span>
            <span className="text-3xl font-black text-slate-900 tracking-tighter">{sysMetrics.efficiency}<span className="text-xs ml-1 text-slate-300">%</span></span>
         </div>
         <div className={statCard}>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Verification Rate</span>
            <span className="text-3xl font-black text-slate-900 tracking-tighter">{sysMetrics.verificationRate}<span className="text-xs ml-1 text-slate-300">%</span></span>
         </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Audit Console v4.8</h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
           <button onClick={() => setActiveTab('TALENT')} className={`px-5 py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'TALENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Talent Hub</button>
           <button onClick={() => setActiveTab('SUBMISSIONS')} className={`px-5 py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'SUBMISSIONS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Submission Queue</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-3">
          {activeTab === 'TALENT' ? (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Specialist</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Discipline</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">CMD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {designers.map(d => (
                    <tr key={d.userId} className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${selectedDesigner?.userId === d.userId ? 'bg-orange-50/50' : ''}`} onClick={() => setSelectedDesigner(d)}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 bg-slate-900 text-white rounded-md flex items-center justify-center font-black text-[10px] uppercase italic">{d.fullName[0]}</div>
                           <span className="text-[13px] font-black text-slate-900">{d.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{d.primarySkill}</td>
                      <td className="px-6 py-5">
                         <span className={`px-2 py-1 text-[8px] font-black tracking-widest uppercase rounded-md border ${
                            d.status === DesignerStatus.HIRED ? 'bg-green-50 text-green-700 border-green-100' :
                            d.status === DesignerStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-orange-50 text-orange-700 border-orange-100'
                         }`}>{d.status}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <svg className={`w-4 h-4 ml-auto transition-colors ${selectedDesigner?.userId === d.userId ? 'text-orange-500' : 'text-slate-200 group-hover:text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
               {submissions.filter(s => s.status === SubmissionStatus.PENDING).map(sub => {
                  const d = designers.find(des => des.userId === sub.designerId);
                  const a = MOCK_ASSESSMENTS.find(asm => asm.id === sub.assessmentId);
                  const isFile = sub.externalLink?.startsWith('File:');
                  return (
                    <div key={sub.id} className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom-2">
                       <div className="flex-1 space-y-6">
                          <div className="flex items-center space-x-3">
                             <span className="bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Pending Audit</span>
                             <span className="text-[9px] text-slate-300 font-black uppercase">{new Date(sub.submittedAt).toLocaleString()}</span>
                          </div>
                          <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{a?.title}</h4>
                          <div className="p-4 bg-slate-50 rounded-lg inline-flex items-center space-x-3 border border-slate-100">
                             <div className="w-6 h-6 bg-slate-900 text-white rounded-md flex items-center justify-center font-black text-[9px]">{d?.fullName[0]}</div>
                             <span className="text-[11px] font-black text-slate-700">{d?.fullName}</span>
                          </div>
                          <div className="pt-4">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Deliverable Target</label>
                            <button 
                               onClick={() => handleDownload(sub.externalLink!.replace('File: ', ''))}
                               className={`block w-full text-center py-4 border rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm group ${
                                 isFile ? 'bg-slate-50 border-slate-100 hover:bg-orange-500 hover:text-white' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'
                               }`}
                            >
                               <span className="group-hover:tracking-[0.3em] transition-all flex items-center justify-center space-x-2">
                                  {isFile ? (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                      <span>DOWNLOAD SECURE ARCHIVE</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                      <span>LAUNCH DIGITAL PORTAL</span>
                                    </>
                                  )}
                               </span>
                            </button>
                            {!isFile && (
                              <p className="text-[8px] text-slate-400 font-bold mt-2 truncate text-center lowercase">{sub.externalLink}</p>
                            )}
                          </div>
                       </div>
                       <div className="w-full md:w-72 bg-slate-50 p-6 rounded-lg border border-slate-100 flex flex-col gap-6">
                          <div>
                             <div className="flex justify-between items-end mb-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit Score</label>
                                <span className="text-2xl font-black text-slate-900">{score}%</span>
                             </div>
                             <input type="range" className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-slate-900" value={score} onChange={(e) => setScore(parseInt(e.target.value))} />
                          </div>
                          <textarea className="w-full p-4 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-orange-500 shadow-inner resize-none" placeholder="VERIFICATION NOTES..." rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                          <button onClick={() => handleReviewSubmission(sub.id)} className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-orange-500 transition-all shadow-md">Publish Audit</button>
                       </div>
                    </div>
                  );
               })}
               {submissions.filter(s => s.status === SubmissionStatus.PENDING).length === 0 && (
                 <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-lg">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No pending submissions in queue</p>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Sidebar: Specialist Technical Dossier */}
        <div className="lg:col-span-1 sticky top-24">
           <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
              {selectedDesigner ? (
                <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col min-h-0">
                   {/* Static Header */}
                   <div className="p-6 border-b border-slate-50 shrink-0">
                      <div className="flex justify-between items-start mb-6">
                         <div className="w-12 h-12 bg-slate-900 text-white rounded-md flex items-center justify-center text-xl font-black italic shadow-lg">{selectedDesigner.fullName[0]}</div>
                         <button onClick={() => setSelectedDesigner(null)} className="p-1.5 hover:bg-slate-50 rounded-md text-slate-300 transition-all">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{selectedDesigner.fullName}</h3>
                      <p className="text-[9px] text-orange-500 font-black uppercase tracking-widest italic">{selectedDesigner.primarySkill}</p>
                   </div>

                   {/* Scrollable Technical Content */}
                   <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                      {/* Technical Summary */}
                      <section className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Technical Dossier</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <span className={labelStyle}>Country</span>
                               <span className="text-[11px] font-bold text-slate-900 uppercase">{selectedDesigner.country}</span>
                            </div>
                            <div>
                               <span className={labelStyle}>Experience</span>
                               <span className="text-[11px] font-bold text-slate-900 uppercase">{selectedDesigner.yearsExperience} Years</span>
                            </div>
                         </div>
                         <div>
                            <span className={labelStyle}>Full Creative Statement</span>
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic border-l-2 border-orange-500/30 pl-3">"{selectedDesigner.bio}"</p>
                         </div>
                      </section>

                      {/* Web Presence Section */}
                      <section className="space-y-3">
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Web Presence</h4>
                         <div className="grid grid-cols-1 gap-2">
                            {selectedDesigner.portfolioLinks.website && (
                               <a href={selectedDesigner.portfolioLinks.website} target="_blank" className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-900 hover:text-white transition-all group">
                                  <span className="text-[9px] font-black uppercase tracking-widest">Main Portfolio</span>
                                  <svg className="w-3 h-3 text-slate-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                               </a>
                            )}
                            {(!selectedDesigner.portfolioLinks.website) && <p className="text-[8px] font-black text-slate-300 uppercase italic">No external links indexed</p>}
                         </div>
                      </section>

                      {/* Artifact Library - REFINED WITH CLEAR URL VISIBILITY */}
                      <section className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Artifact Library</h4>
                         
                         {/* Onboarding Credential */}
                         {selectedDesigner.credentialUrl && (
                            <div className="space-y-1.5">
                               <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Archive</span>
                               <button 
                                  onClick={() => {
                                     const [name, data] = selectedDesigner.credentialUrl!.split('|');
                                     setPreviewFile({ name, data });
                                  }}
                                  className="w-full py-3 bg-orange-50 border border-orange-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center space-x-2"
                               >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  <span className="truncate max-w-[150px]">{selectedDesigner.credentialUrl.split('|')[0]}</span>
                               </button>
                            </div>
                         )}

                         {/* Submission Artifacts */}
                         <div className="space-y-3">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Assessment Submissions</span>
                            {getDesignerSubmissions(selectedDesigner.userId).map((sub) => {
                               const isFile = sub.externalLink?.startsWith('File:');
                               const asm = MOCK_ASSESSMENTS.find(a => a.id === sub.assessmentId);
                               const rawVal = isFile ? sub.externalLink?.replace('File: ', '') : sub.externalLink;
                               return (
                                  <div key={sub.id} className="space-y-1">
                                    <div className={`p-3 border rounded-lg transition-all ${isFile ? 'bg-slate-50 border-slate-100' : 'bg-blue-50/50 border-blue-100'}`}>
                                       <div className="flex justify-between items-start mb-2">
                                          <span className="text-[8px] font-black text-slate-900 uppercase tracking-tight leading-tight max-w-[140px]">{asm?.title}</span>
                                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${isFile ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}>
                                            {isFile ? 'Archive' : 'Digital'}
                                          </span>
                                       </div>
                                       
                                       <button 
                                          onClick={() => handleDownload(rawVal!)}
                                          className={`w-full py-2.5 rounded text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-1.5 ${
                                            isFile ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white'
                                          }`}
                                        >
                                          {isFile ? (
                                            <>
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                              <span>Download</span>
                                            </>
                                          ) : (
                                            <>
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                              <span>Launch Portal</span>
                                            </>
                                          )}
                                       </button>
                                       
                                       {!isFile && (
                                         <p className="text-[7px] font-bold text-slate-400 mt-2 truncate italic lowercase">{sub.externalLink}</p>
                                       )}
                                    </div>
                                  </div>
                               );
                            })}
                            {getDesignerSubmissions(selectedDesigner.userId).length === 0 && <p className="text-[8px] font-black text-slate-200 uppercase italic">No assessment artifacts found</p>}
                         </div>
                      </section>

                      {/* Internal Management */}
                      <section className="space-y-4 pt-4 border-t border-slate-50">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Update Verdict</label>
                            <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none focus:border-orange-500 transition-all shadow-inner cursor-pointer" value={selectedDesigner.status} onChange={(e) => handleUpdateStatus(selectedDesigner.userId, e.target.value as DesignerStatus)}>
                               {Object.values(DesignerStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                         <div className="space-y-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastered Software Stack</p>
                            <div className="flex flex-wrap gap-1.5">
                               {selectedDesigner.tools.map(t => <span key={t} className="px-2.5 py-1.5 bg-slate-100 rounded-md text-[8px] font-black uppercase text-slate-600 tracking-tighter border border-slate-200">{t}</span>)}
                            </div>
                         </div>
                      </section>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-center text-slate-200 p-8">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-loose text-slate-300">Select specialist to<br/>begin full audit</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Mock Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[300] flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                 <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-500 text-white rounded-md flex items-center justify-center">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{previewFile.name}</h3>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Identity Artifact</p>
                    </div>
                 </div>
                 <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-slate-100 rounded-md text-slate-400 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="flex-1 bg-slate-100 p-12 flex flex-col items-center justify-center relative">
                 <div className="w-full max-w-md bg-white p-12 shadow-sm rounded-md border border-slate-200 text-center space-y-8">
                    {previewFile.data.startsWith('data:image/') ? (
                       <img src={previewFile.data} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg border border-slate-100 object-contain" />
                    ) : (
                       <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto flex items-center justify-center">
                          <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       </div>
                    )}
                    <div>
                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Technical Proof</h4>
                       <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Encrypted Document Container</p>
                    </div>
                    <button 
                      onClick={() => handleDownload(`${previewFile.name}|${previewFile.data}`)}
                      className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-lg hover:bg-orange-500 transition-all shadow-lg active:scale-95"
                    >
                      Authorize Secure Download
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;

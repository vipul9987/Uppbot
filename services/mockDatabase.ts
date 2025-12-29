
import { User, DesignerProfile, Assessment, Submission, UserRole, DesignerStatus, SubmissionStatus } from '../types';
import { MOCK_ASSESSMENTS } from '../constants';

class MockDatabase {
  private users: User[] = [
    { id: 'admin-1', email: 'admin@uppbot.com', role: UserRole.ADMIN, profileCompleted: true }
  ];
  private profiles: DesignerProfile[] = [];
  private submissions: Submission[] = [];
  private assessments: Assessment[] = [...MOCK_ASSESSMENTS];
  private currentUser: User | null = null;

  private readonly ADMIN_SECRET = "ADMIN123";

  constructor() {
    const storedUser = localStorage.getItem('dh_user');
    const storedProfiles = localStorage.getItem('dh_profiles');
    const storedSubmissions = localStorage.getItem('dh_submissions');

    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
    if (storedProfiles) {
      this.profiles = JSON.parse(storedProfiles);
    }
    if (storedSubmissions) {
      this.submissions = JSON.parse(storedSubmissions);
    }
  }

  private persist() {
    localStorage.setItem('dh_user', JSON.stringify(this.currentUser));
    localStorage.setItem('dh_profiles', JSON.stringify(this.profiles));
    localStorage.setItem('dh_submissions', JSON.stringify(this.submissions));
  }

  login(email: string, role: UserRole, adminKey?: string): User {
    if (role === UserRole.ADMIN && adminKey !== this.ADMIN_SECRET) {
      throw new Error("Invalid Admin Authorization Key.");
    }

    let user = this.users.find(u => u.email === email && u.role === role);
    if (!user) {
      user = { id: `u-${Math.random().toString(36).substr(2, 9)}`, email, role, profileCompleted: false };
      this.users.push(user);
    }
    
    const profile = this.profiles.find(p => p.userId === user!.id);
    if (profile) user.profileCompleted = true;

    this.currentUser = user;
    this.persist();
    return user;
  }

  getCurrentUser(): User | null { return this.currentUser; }
  
  logout() { 
    this.currentUser = null; 
    localStorage.removeItem('dh_user');
  }

  completeProfile(profileData: Omit<DesignerProfile, 'status'>): DesignerProfile {
    const existingIndex = this.profiles.findIndex(p => p.userId === profileData.userId);
    let profile: DesignerProfile;

    if (existingIndex >= 0) {
      profile = { ...this.profiles[existingIndex], ...profileData };
      this.profiles[existingIndex] = profile;
    } else {
      profile = { ...profileData, status: DesignerStatus.NEW };
      this.profiles.push(profile);
    }

    if (this.currentUser && this.currentUser.id === profileData.userId) {
      this.currentUser.profileCompleted = true;
    }
    
    this.persist();
    return profile;
  }

  getProfile(userId: string): DesignerProfile | undefined {
    return this.profiles.find(p => p.userId === userId);
  }

  getAllProfiles(): DesignerProfile[] { return this.profiles; }

  updateDesignerStatus(userId: string, status: DesignerStatus) {
    const p = this.profiles.find(prof => prof.userId === userId);
    if (p) {
      p.status = status;
      this.persist();
    }
  }

  getDesignerMetrics(userId: string) {
    const userSubmissions = this.getSubmissionsForDesigner(userId);
    const graded = userSubmissions.filter(s => s.status === SubmissionStatus.REVIEWED && s.score !== undefined);
    
    const avgScore = graded.length > 0 
      ? Math.round(graded.reduce((acc, s) => acc + (s.score || 0), 0) / graded.length)
      : 0;

    const allDesignersScores = this.profiles.map(p => {
      const pSubs = this.getSubmissionsForDesigner(p.userId);
      const pGraded = pSubs.filter(s => s.status === SubmissionStatus.REVIEWED);
      return pGraded.length > 0 ? pGraded.reduce((acc, s) => acc + (s.score || 0), 0) / pGraded.length : 0;
    }).sort((a, b) => b - a);

    const rankIndex = allDesignersScores.indexOf(avgScore);
    const percentile = allDesignersScores.length > 0 
      ? Math.max(1, Math.round(((rankIndex + 1) / allDesignersScores.length) * 100 * 10) / 10) 
      : 100;

    return { avgScore, percentile, totalSubmissions: userSubmissions.length };
  }

  getSystemMetrics() {
    const totalDesigners = this.profiles.length;
    const totalSubmissions = this.submissions.length;
    const pendingCount = this.submissions.filter(s => s.status === SubmissionStatus.PENDING).length;
    const reviewedCount = this.submissions.filter(s => s.status === SubmissionStatus.REVIEWED).length;
    
    const verificationRate = totalDesigners > 0 
      ? Math.round((this.profiles.filter(p => [DesignerStatus.HIRED, DesignerStatus.SHORTLISTED].includes(p.status)).length / totalDesigners) * 100)
      : 0;

    const efficiency = totalSubmissions > 0 
      ? Math.round((reviewedCount / totalSubmissions) * 100)
      : 0;

    return { totalDesigners, pendingCount, verificationRate, efficiency };
  }

  getAssignedAssessments(profile: DesignerProfile): Assessment[] {
    // Advanced Match Logic
    return this.assessments.map(asm => {
      let score = 0;
      
      // Match Primary Skill (Weight: 10)
      if (asm.category === profile.primarySkill) score += 10;
      
      // Match Secondary Skills (Weight: 5 per match)
      const secondaryMatch = profile.secondarySkills.filter(s => s === asm.category).length;
      score += (secondaryMatch * 5);
      
      // Match Tools Mastery (Weight: 3 per tool)
      if (asm.toolsRequired) {
        const toolsMatch = asm.toolsRequired.filter(t => profile.tools.includes(t)).length;
        score += (toolsMatch * 3);
      }
      
      return { asm, score };
    })
    .sort((a, b) => b.score - a.score) // Sort by highest relevance
    .map(item => item.asm)
    .slice(0, 4);
  }

  submitAssessment(submission: Omit<Submission, 'id' | 'status' | 'submittedAt'>): Submission {
    const newSubmission: Submission = {
      ...submission,
      id: `sub-${Math.random().toString(36).substr(2, 9)}`,
      status: SubmissionStatus.PENDING,
      submittedAt: new Date().toISOString()
    };
    this.submissions.push(newSubmission);
    this.persist();
    return newSubmission;
  }

  getSubmissionsForDesigner(designerId: string): Submission[] {
    return this.submissions.filter(s => s.designerId === designerId);
  }

  getAllSubmissions(): Submission[] { return this.submissions; }

  updateSubmission(id: string, updates: Partial<Submission>) {
    const s = this.submissions.find(sub => sub.id === id);
    if (s) {
      Object.assign(s, updates);
      this.persist();
    }
  }
}

export const db = new MockDatabase();

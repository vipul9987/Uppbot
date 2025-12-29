
export enum UserRole {
  ADMIN = 'ADMIN',
  DESIGNER = 'DESIGNER'
}

export enum DesignerStatus {
  NEW = 'New',
  UNDER_REVIEW = 'Under Review',
  SHORTLISTED = 'Shortlisted',
  REJECTED = 'Rejected',
  HIRED = 'Hired'
}

export enum SubmissionStatus {
  PENDING = 'Pending',
  REVIEWED = 'Reviewed'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profileCompleted: boolean;
}

export interface DesignerProfile {
  userId: string;
  fullName: string;
  country: string;
  yearsExperience: number;
  primarySkill: string;
  secondarySkills: string[];
  tools: string[];
  portfolioLinks: {
    dribbble?: string;
    behance?: string;
    website?: string;
  };
  credentialUrl?: string; // Track the uploaded PDF from onboarding
  preferredProjectTypes: string[];
  availability: number;
  bio: string;
  status: DesignerStatus;
}

export interface Assessment {
  id: string;
  title: string;
  category: string;
  brief: string;
  instructions: string;
  deliverables: string[];
  timeLimit: string;
  allowedFileTypes: string[];
  toolsRequired?: string[];
}

export interface Submission {
  id: string;
  assessmentId: string;
  designerId: string;
  fileUrl?: string;
  externalLink?: string;
  status: SubmissionStatus;
  score?: number;
  adminNote?: string;
  submittedAt: string;
}

export type WorkExperience = {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type EducationData = {
  SchoolName: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  CGPA: number;
  maxGpa: number;
};

export interface WellfoundProfileData {
  bio: string;
  name: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  primaryRole: string;
  location: string;
  openToRoles: string[];
  workExperience: WorkExperience[];
  education: EducationData[];
  skills: string[];
  achievements: string;
  identity: "he/him" | "she/her" | "other"
}

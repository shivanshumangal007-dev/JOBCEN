import { api } from "./utils"
import { toast } from "sonner"
import { useMutation, useQuery } from "@tanstack/react-query"
import Cookies from "js-cookie";

export interface ContactInfo {
  phone_number?: string | null;
  phone_type?: string | null;
  address?: string | null;
  birthday?: string | null;
}

export interface SocialProfiles {
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
  portfolio?: string | null;
  websites: string[];
}

export interface WorkExperience {
  company: string;
  title: string;
  location?: string | null;
  location_type?: string | null;
  start_date: string;
  end_date?: string | null;
  description: string[];
  technologies: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year?: number | null;
  graduation_year: number;
  gpa?: number | null;
  max_gpa?: number | null;
  activities?: string | null;
  description?: string | null;
}

export interface Certification {
  name: string;
  issuing_organization: string;
  issue_date?: string | null;
  expiration_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
}

export interface ProjectItem {
  title: string;
  description: string;
  role?: string | null;
  url?: string | null;
  github_url?: string | null;
  technologies: string[];
}

export interface JobPreferences {
  search_status?: string | null;
  requires_sponsorship: boolean;
  legally_authorized: boolean;
  job_types: string[];
  open_to_remote: boolean;
  desired_salary?: string | null;
  culture_preference?: string | null;
}

export interface UniversalProfile {
  full_name: string;
  primary_role?: string | null;
  years_of_experience?: number | null;
  bio: string;
  pronouns?: string | null;
  gender?: string | null;
  
  contact: ContactInfo;
  socials: SocialProfiles;
  experience: WorkExperience[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: string[];
  certifications: Certification[];
  preferences: JobPreferences;
  achievements: string[];
}

export const useProfile = () => {
  return useQuery<UniversalProfile>({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const response = await api.get("/profile/me")
      return response.data as UniversalProfile
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!Cookies.get("access_token"),
  })
}

const useResumeUpload = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.post("/uplaod-pdf", formData)
      return response.data
    },
    onSuccess: () => {
      toast.success("Resume uploaded successfully")
    },
    onError: (error: any) => {
      toast.error("Failed to upload resume")
      console.log("error in uploading resume:", error)
    },
  })
}

export default useResumeUpload
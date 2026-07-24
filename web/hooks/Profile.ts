import { api } from "./utils"
import { toast } from "sonner"
import { useMutation, UseMutationResult, useQuery } from "@tanstack/react-query"
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
export interface User {
  created_at: string;
  email: string;
  id: string;
  is_active: boolean;
  username: string;
}
export interface profileResponse {
  profile: UniversalProfile;
  user:  User;
}
interface resumeResponse{
  job_id: string,
  status: string,
  message: string,
}
interface jobresponse{
  "job_id": string,
  "status": string,
  "error": string,
  "updated_at": string
}
export const useProfile = () => {
  return useQuery<profileResponse>({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const response = await api.get("/profile/me")
      return response.data as profileResponse
    },
    staleTime: 1000 * 60 * 2,
    retry: false, // Don't retry on 401 Unauthorized
  })
}

export const useResumeUpload = () : UseMutationResult<resumeResponse, any, File, unknown> => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.post("/upload-pdf", formData)
      return response.data as resumeResponse
    },
    onSuccess: (data) => {
      console.log(data)
      toast.success(data.message)
    },
    onError: (error: any) => {
      toast.error("Failed to parse resume")
      console.log("error in uploading resume:", error)
    },
  })
}

export const useJobStatus = (jobID: string | null) => {
  return useQuery({
    queryKey: ["jobStatus", jobID],
    queryFn: async () => {
      if (!jobID) return null;
      const response = await api.get(`/status/${jobID}`);
      return response.data as jobresponse;
    },
    enabled: !!jobID,
    refetchInterval: (query) => {
      const data = query.state.data as jobresponse | undefined;
      console.log(data)
      if (data?.status === "COMPLETED" || data?.status === "FAILED") {
        return false;
      }
      return 3000; // Poll every 2 seconds
    },
  });
};

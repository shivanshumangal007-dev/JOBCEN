from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional
from datetime import date

class ContactInfo(BaseModel):
    phone_number: Optional[str] = None
    phone_type: Optional[str] = "Mobile"  # Mobile, Home, Work
    address: Optional[str] = None         # e.g., "Delhi, India"
    birthday: Optional[str] = None        # e.g., "YYYY-MM-DD" or "DD/MM"

class SocialProfiles(BaseModel):
    linkedin: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    portfolio: Optional[str] = None
    websites: List[str] = []

class WorkExperience(BaseModel):
    company: str
    title: str
    location: Optional[str] = None
    location_type: Optional[str] = "On-site"  # On-site, Remote, Hybrid
    start_date: str                           # Flexible string like "Jan 2024" or "2024-01"
    end_date: Optional[str] = "Present"
    description: List[str]                    # Array of accomplishment bullet points
    technologies: List[str] = []              # Explicit tech stack used in this specific role

class EducationItem(BaseModel):
    institution: str
    degree: str                               # e.g., "B.Tech", "M.S."
    field_of_study: str                       # e.g., "Computer Science and Engineering"
    start_year: Optional[int] = None
    graduation_year: int
    gpa: Optional[float] = None
    max_gpa: Optional[float] = 4.0
    activities: Optional[str] = None          # Societies, clubs
    description: Optional[str] = None

class Certification(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

class ProjectItem(BaseModel):
    title: str
    description: str
    role: Optional[str] = None
    url: Optional[str] = None
    github_url: Optional[str] = None
    technologies: List[str] = []

class JobPreferences(BaseModel):
    search_status: Optional[str] = None      # e.g., "Actively Looking", "Open to Offers"
    requires_sponsorship: bool = False       # Visa requirements
    legally_authorized: bool = True          # Right to work
    job_types: List[str] = []                 # "Full-time", "Internship", "Contract"
    open_to_remote: bool = True
    desired_salary: Optional[str] = None
    culture_preference: Optional[str] = None  # What they value in their next team

class UniversalProfileSchema(BaseModel):
    full_name: str
    primary_role: Optional[str] = None       # e.g., "Full-Stack Engineer"
    years_of_experience: Optional[float] = 0.0
    bio: str                                  # Master summary profile section
    pronouns: Optional[str] = None
    gender: Optional[str] = None
    
    # Nested Sub-schemas
    contact: ContactInfo
    socials: SocialProfiles
    experience: List[WorkExperience]
    education: List[EducationItem]
    projects: List[ProjectItem] = []
    skills: List[str]
    certifications: List[Certification] = []
    preferences: JobPreferences
    achievements: List[str] = []              # General awards/honors lists

    class Config:
        # Allows parsing from SQLAlchemy models or internal object attributes directly
        from_attributes = True
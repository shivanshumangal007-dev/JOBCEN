from typing import Dict, Any, Tuple


def _split_full_name(full_name: str) -> Tuple[str, str]:
    """Split a full name into first and last name."""
    parts = full_name.strip().split(maxsplit=1)
    first_name = parts[0] if parts else ""
    last_name = parts[1] if len(parts) > 1 else ""
    return first_name, last_name


def transform_linkedin_data(profile_data: Dict[str, Any], user_email: str) -> Dict[str, Any]:
    """
    Transform universal profile to LinkedIn field values grouped by link.
    """
    first_name, last_name = _split_full_name(profile_data.get("full_name", ""))
    contact = profile_data.get("contact", {})
    address = contact.get("address", "")
    city = address.split(",")[0].strip() if address else ""

    return {
        "https://www.linkedin.com/jobs": {
            "first_name": first_name,
            "last_name": last_name,
            "email": user_email,
            "phone": contact.get("phone_number", ""),
            "city": city,
            "headline": profile_data.get("primary_role", ""),
        }
    }


def transform_internshala_data(profile_data: Dict[str, Any], user_email: str) -> Dict[str, Any]:
    """
    Transform universal profile to Internshala field values grouped by link.
    """
    first_name, last_name = _split_full_name(profile_data.get("full_name", ""))
    contact = profile_data.get("contact", {})

    return {
        "https://internshala.com/internships": {
            "first_name": first_name,
            "last_name": last_name,
            "email": user_email,
            "phone": contact.get("phone_number", ""),
            "cover_letter": "I am writing to express my interest in this position. "
                            "With my background and skills, I am confident I can contribute meaningfully to your team.",
        }
    }


def transform_wellfound_data(profile_data: Dict[str, Any], user_email: str) -> Dict[str, Any]:
    """
    Transform universal profile to Wellfound field values grouped by link.
    Matches the exact field names from the provided Excel sheet.
    """
    socials = profile_data.get("socials", {})
    contact = profile_data.get("contact", {})
    preferences = profile_data.get("preferences", {})

    # Format Work Experience
    work_exp = []
    for exp in profile_data.get("experience", []):
        work_exp.append({
            "company": exp.get("company", ""),
            "title": exp.get("title", ""),
            "location": exp.get("location", ""),
            "startDate": exp.get("start_date", ""),
            "endDate": exp.get("end_date", ""),
            "description": "\n".join(exp.get("description", []))
        })

    # Format Education
    education = []
    for edu in profile_data.get("education", []):
        education.append({
            "SchoolName": edu.get("institution", ""),
            "degree": edu.get("degree", ""),
            "fieldOfStudy": edu.get("field_of_study", ""),
            "graduationYear": str(edu.get("graduation_year", "")),
            "CGPA": edu.get("gpa", 0.0),
            "maxGpa": edu.get("max_gpa", 4.0)
        })

    # Combine achievements into a string
    achievements = "\n".join(profile_data.get("achievements", []))

    return {
        "https://wellfound.com/profile/edit": {
            "bio": profile_data.get("bio", ""),
            "name": profile_data.get("full_name", ""),
            "websiteUrl": socials.get("portfolio", "") or (socials.get("websites", [])[0] if socials.get("websites") else ""),
            "linkedinUrl": socials.get("linkedin", ""),
            "githubUrl": socials.get("github", ""),
            "twitterUrl": socials.get("twitter", ""),
            "primaryRole": profile_data.get("primary_role", ""),
            "location": contact.get("address", ""),
            "openToRoles": preferences.get("job_types", []),
            "workExperience": work_exp,
            "education": education,
            "skills": profile_data.get("skills", []),
            "achievements": achievements
        }
    }


# The registry now just maps platform names to their transformer functions.
# The transformers themselves return the { link: {name: value} } structure.
ADAPTERS_CONFIG = {
    "linkedin": {
        "transformer": transform_linkedin_data,
    },
    "internshala": {
        "transformer": transform_internshala_data,
    },
    "wellfound": {
        "transformer": transform_wellfound_data,
    },
}

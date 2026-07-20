from typing import Dict, Any, Tuple


def _split_full_name(full_name: str) -> Tuple[str, str]:
    """Split a full name into first and last name."""
    parts = full_name.strip().split(maxsplit=1)
    first_name = parts[0] if parts else ""
    last_name = parts[1] if len(parts) > 1 else ""
    return first_name, last_name


def transform_linkedin_data(profile_data: Dict[str, Any], user_email: str) -> Dict[str, Any]:
    """Transform universal profile to LinkedIn field values."""
    first_name, last_name = _split_full_name(profile_data.get("full_name", ""))
    contact = profile_data.get("contact", {})
    address = contact.get("address", "")
    city = address.split(",")[0].strip() if address else ""

    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": user_email,
        "phone": contact.get("phone_number", ""),
        "city": city,
        "headline": profile_data.get("primary_role", ""),
    }


def transform_internshala_data(profile_data: Dict[str, Any], user_email: str) -> Dict[str, Any]:
    """Transform universal profile to Internshala field values."""
    first_name, last_name = _split_full_name(profile_data.get("full_name", ""))
    contact = profile_data.get("contact", {})

    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": user_email,
        "phone": contact.get("phone_number", ""),
        "cover_letter": "I am writing to express my interest in this position. "
                        "With my background and skills, I am confident I can contribute meaningfully to your team.",
    }


def transform_wellfound_data(profile_data: Dict[str, Any], user_email: str) -> Dict[str, Any]:
    """Transform universal profile to Wellfound field values."""
    first_name, last_name = _split_full_name(profile_data.get("full_name", ""))
    socials = profile_data.get("socials", {})

    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": user_email,
        "linkedin_url": socials.get("linkedin", ""),
        "note_to_founder": "I am very interested in your company and believe my skills align "
                           "well with the role. I would love the opportunity to contribute to your mission.",
    }


# Each adapter has a link (the platform apply URL) and a transformer function.
# The API response format is:  { link: { "name": "value", ... }, ... }
ADAPTERS_CONFIG = {
    "linkedin": {
        "link": "https://www.linkedin.com/jobs",
        "transformer": transform_linkedin_data,
    },
    "internshala": {
        "link": "https://internshala.com/internships",
        "transformer": transform_internshala_data,
    },
    "wellfound": {
        "link": "https://wellfound.com/jobs",
        "transformer": transform_wellfound_data,
    },
}

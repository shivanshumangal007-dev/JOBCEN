import os
from google import genai
from google.genai import types
from fastapi import HTTPException, status
from app.schemas.profile import UniversalProfileSchema
from app.core.config import settings

# Initialize the GenAI client using your environment API key
# Make sure GEMINI_API_KEY is defined in your core settings or .env file
client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def extract_universal_profile(raw_text: str, links: list | None = None) -> UniversalProfileSchema:
    """
    Takes unstructured text from a resume or paste, passes it securely to Gemini, 
    and forces a 100% structured type-safe validation matching our UniversalProfileSchema.
    Optionally accepts hyperlinks extracted from a PDF for more accurate social/portfolio mapping.
    """
    
    # Build the links section if we have extracted hyperlinks
    links_section = ""
    if links:
        formatted_links = "\n".join(
            f"    - URL: {link['url']}" + (f" (anchor text: \"{link['anchor_text']}\")" if link.get('anchor_text') else "")
            for link in links
        )
        links_section = f"""
    EXTRACTED HYPERLINKS FROM THE DOCUMENT:
    The following clickable URLs were extracted directly from the PDF. Use them to accurately 
    populate the social profiles (linkedin, github, twitter, portfolio, websites), project URLs, 
    credential URLs, and any other URL fields in the schema. Match each URL to its most 
    appropriate field based on the domain and surrounding context.
    
{formatted_links}
    """

    prompt = f"""
    You are an advanced, elite-tier resume parsing engine. 
    Your absolute objective is to analyze the following unstructured text input belonging 
    to a candidate's professional profile, extract every key datapoint, and organize it 
    perfectly into the requested JSON schema. 
    
    CRITICAL INSTRUCTIONS:
    - Do not invent, hallucinate, or alter any historical experience data.
    - If specific details (e.g., certifications, social links, phone number) are completely absent, leave them empty or null according to the schema definitions.
    - Standardize work descriptions into concise, clear bullet points.
    - When hyperlinks are provided, use them to fill in the social profiles, project URLs, and credential URLs accurately. Prefer these extracted URLs over any text that looks like a URL in the raw text.
    {links_section}
    Raw Unstructured Profile Data:
    \"\"\"{raw_text}\"\"\"
    """
        
    try:
        # We use gemini-2.5-flash for blazing-fast, accurate structured processing
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=UniversalProfileSchema,  # Enforces Gemini to conform completely to your Pydantic structure
                temperature=0.1,  # Set low to remain objective and rule out creative liberties
            ),
        )
        
        # Validates and maps the returned JSON direct to your type hint class instance
        validated_profile = UniversalProfileSchema.model_validate_json(response.text)

        print(f"validated profile is {validated_profile}")
        return validated_profile
        
    except Exception as e:
        # Wrap extraction errors elegantly so the background task captures the precise trace failure
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Gemini Structured Extraction failed parsing input: {str(e)}"
        )
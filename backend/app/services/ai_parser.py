import os
from google import genai
from google.genai import types
from fastapi import HTTPException, status
from app.schemas.profile import UniversalProfileSchema
from app.core.config import settings

# Initialize the GenAI client using your environment API key
# Make sure GEMINI_API_KEY is defined in your core settings or .env file
client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def extract_universal_profile(raw_text: str, is_pdf: bool = False) -> UniversalProfileSchema:
    """
    Takes unstructured text from a resume or paste, passes it securely to Gemini, 
    and forces a 100% structured type-safe validation matching our UniversalProfileSchema.
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
    """
    
    if is_pdf:
        import base64
        pdf_bytes = base64.b64decode(raw_text)
        prompt_contents = [
            prompt,
            types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")
        ]
    else:
        prompt += f"\nRaw Unstructured Profile Data:\n\"\"\"{raw_text}\"\"\"\n"
        prompt_contents = [prompt]
        
    try:
        # We use gemini-2.5-flash for blazing-fast, accurate structured processing
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt_contents,
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
        # Wrap extraction errors elegantly so Celery captures the precise trace failure
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Gemini Structured Extraction failed parsing input: {str(e)}"
        )
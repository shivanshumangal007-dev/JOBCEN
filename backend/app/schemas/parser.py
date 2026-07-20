from pydantic import BaseModel

class ResumeUploadPayload(BaseModel):
    raw_text: str  # For handling raw copy-paste or text extractions
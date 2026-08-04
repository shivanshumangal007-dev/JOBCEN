from pydantic import BaseModel, Field

class ResumeUploadPayload(BaseModel):
    raw_text: str = Field(..., max_length=500_000)  # ~500KB cap to prevent OOM
# System Architecture

This document describes the architectural flow and design patterns used in the JOBCEN backend.

## High-Level Data Flow

1. **Ingestion & Parsing:**
   - User uploads a resume (PDF or text) via the API (`/upload` or `/upload-pdf`).
   - The API returns a tracking job ID and delegates the parsing to a Celery worker (`parser_worker.py`).
   - The worker uses `pdf_extractor.py` to extract text/links and `ai_parser.py` (powered by Google Gemini) to extract data into a heavily validated `UniversalProfileSchema`.
   - The resulting structured data is saved to PostgreSQL (`crud/profile.py`).

2. **Universal Profile Management:**
   - The Universal Profile acts as a superset of all fields required by supported job boards (LinkedIn, Internshala, etc.).
   - Users can update this central profile via the API, ensuring a single source of truth.
   - Pydantic models in `app/schemas/profile.py` strictly enforce this data structure.

3. **On-Demand Platform Adapters (The Planner):**
   - When the client extension or web app requests data for a specific site, the backend invokes the "Planner" mapping logic (`services/profile_service.py` / `services/sync_service.py`).
   - The Planner loads the user's Universal Profile and the requested target platform's JSON adapter configuration.
   - It maps the universal fields to the target schema, applying rules to transform formats (like converting generic dates into a specific site's expected format).
   - The generated platform-specific JSON is returned to the client to auto-fill the target site.

## Directory Structure

- `app/api/routes/`: FastAPI endpoints for authentication, profile management, parsing, and adapter routing.
- `app/core/`: Application configuration, Celery initialization, and security utilities.
- `app/db/`: SQLAlchemy async session setup, database models (`user.py`, `profile.py`), and CRUD operations.
- `app/schemas/`: Pydantic models enforcing data validation (notably `UniversalProfileSchema`).
- `app/services/`: Core business logic, AI interactions, and the Planner mapping system.
- `app/tasks/`: Celery asynchronous worker tasks for background jobs.
- `app/adapters/`: JSON templates and configurations defining the structure required by specific target platforms.

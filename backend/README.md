# JOBCEN Backend

The backend service for JOBCEN, acting as the central hub for managing users' professional identities. 

## Overview
JOBCEN allows users to maintain a "Universal Profile"—a single source of truth for their professional data (experience, education, projects, skills). Instead of updating profiles across multiple job boards (like LinkedIn, Internshala, etc.), users update their Universal Profile once. JOBCEN then dynamically maps and generates the required JSON structures for each specific platform on-demand using a mapping planner and site-specific adapters.

## Features
- **AI-Powered Resume Parsing:** Extracts structured data from raw text or PDFs using Google Gemini, automatically populating the Universal Profile.
- **Universal Profile System:** A comprehensive schema containing every data point required across all supported platforms.
- **On-Demand Platform Mapping (Planner):** Dynamically transforms the Universal Profile into site-specific schemas (e.g., LinkedIn, Internshala) when requested.
- **Asynchronous Task Processing:** Uses Celery for heavy I/O tasks like AI parsing and cloud storage uploads.

## Tech Stack
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL with SQLAlchemy (Async)
- **Task Queue:** Celery with Redis
- **AI Integration:** Google GenAI (Gemini 2.5 Flash)
- **Storage:** Cloudinary (for resumes)

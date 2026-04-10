"""
main.py
FastAPI entry point for Marketing Campaign Analyzer.

Run locally:
    uvicorn main:app --reload --port 8000

Deploy (Render):
    uvicorn main:app --host 0.0.0.0 --port $PORT
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import analyze, copy_gen, media_plan

load_dotenv()

cors_origins = os.getenv("CORS_ORIGINS", "*")
allow_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

app = FastAPI(
    title="Marketing Campaign Analyzer API",
    description="Analyze ad campaigns, generate copy, revise media plans.",
    version="1.0.0",
)

# In production replace "*" with your frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins if allow_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["Campaign Analysis"])
app.include_router(copy_gen.router, prefix="/api", tags=["Ad Copy Generator"])
app.include_router(media_plan.router, prefix="/api", tags=["Media Plan"])


@app.get("/api/health") 
def health():
    key_present = bool(os.getenv("OPENAI_API_KEY"))
    return {"status": "ok", "version": "1.0.0", "openai_key_configured": key_present}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

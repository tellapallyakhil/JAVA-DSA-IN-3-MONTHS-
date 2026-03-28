from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from executor import execute_java
import uvicorn
import os
import time

app = FastAPI(title="DSA Code Judge", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# Track uptime
START_TIME = time.time()

class CodeRequest(BaseModel):
    code: str = Field(..., max_length=50000)
    stdin: str = Field(default="", max_length=10000)

@app.get("/")
def read_root():
    uptime = round(time.time() - START_TIME)
    return {
        "status": "ok",
        "message": "DSA Code Judge v2.0 — Online",
        "uptime_seconds": uptime,
    }

@app.get("/health")
def health():
    """Health check endpoint for monitoring services like UptimeRobot."""
    return {"status": "healthy", "uptime_seconds": round(time.time() - START_TIME)}

@app.post("/execute")
def run_code(request: CodeRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Empty code submitted")
    
    result = execute_java(request.code, request.stdin)
    return result

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    workers = int(os.environ.get("WORKERS", 2))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        workers=workers,
        timeout_keep_alive=30,
    )

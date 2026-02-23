from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from executor import execute_java
import uvicorn
import os

app = FastAPI(title="DSA Code Judge")

class CodeRequest(BaseModel):
    code: str
    stdin: str = ""

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/execute")
def run_code(request: CodeRequest):
    result = execute_java(request.code, request.stdin)
    return result

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

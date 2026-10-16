
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ollama import Client

app = FastAPI(
    title="OpenFix AI",
    description="AI assistant for debugging Python and web applications",
    version="1.0.0",
)

# Allow the React frontend to connect to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ollama_client = Client(host="http://localhost:11434")


class DebugRequest(BaseModel):
    error: str = Field(min_length=1, max_length=10000)


@app.get("/")
def home():
    return {
        "message": "Welcome to OpenFix AI!",
        "status": "Backend is running successfully",
    }


@app.post("/debug")
def debug_error(request: DebugRequest):
    try:
        response = ollama_client.chat(
            model="qwen2.5-coder:3b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are OpenFix AI, a helpful debugging assistant. "
                        "Explain the error in simple language, identify the "
                        "likely cause, and provide corrected code when possible. "
                        "If information is missing, explain your assumptions."
                    ),
                },
                {
                    "role": "user",
                    "content": request.error,
                },
            ],
        )

        return {
            "error": request.error,
            "diagnosis": response["message"]["content"],
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not get an AI response. Check that Ollama is running "
                "and the qwen2.5-coder:3b model is available. "
                f"Details: {str(exc)}"
            ),
        )


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/debug")
def debug_error(request: DebugRequest):
    prompt = f"""
You are OpenFix AI, a beginner-friendly debugging assistant.

Analyze this Python or web-development error:

{request.error}

Return your answer with these sections:
1. Error type
2. Likely cause
3. Explanation in simple words
4. Suggested fix
5. Corrected code, if appropriate

Do not claim that a fix has been tested unless it actually has.
"""

    try:
        response = ollama_client.chat(
            model="qwen2.5-coder:3b",
            messages=[{"role": "user", "content": prompt}],
        )

        return {
            "error": request.error,
            "diagnosis": response["message"]["content"],
        }

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Could not connect to Ollama. "
                "Make sure Ollama is running and the model is downloaded."
            ),
        ) from exc


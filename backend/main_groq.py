from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, List
from groq import Groq
import PyPDF2
import os
import json
from dotenv import load_dotenv
import asyncio
from io import BytesIO

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="GenAI Chatbot API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Groq API
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables")

groq_client = Groq(api_key=GROQ_API_KEY)

# In-memory storage for chat sessions
chat_sessions: Dict[str, Dict] = {}

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ResetRequest(BaseModel):
    session_id: str = "default"

# Helper function to extract text from PDF
def extract_text_from_pdf(pdf_file: bytes) -> str:
    """Extract text content from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_file))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

# Initialize or get chat session
def get_or_create_session(session_id: str) -> Dict:
    """Get existing session or create new one"""
    if session_id not in chat_sessions:
        chat_sessions[session_id] = {
            "history": [],
            "pdf_context": None,
        }
    return chat_sessions[session_id]

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "GenAI Chatbot API is running with Groq"}

@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), session_id: str = "default"):
    """Upload and process PDF file"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Read PDF content
        pdf_content = await file.read()
        
        # Extract text
        pdf_text = extract_text_from_pdf(pdf_content)
        
        if not pdf_text:
            raise HTTPException(status_code=400, detail="No text found in PDF")
        
        # Store PDF context in session
        session = get_or_create_session(session_id)
        session["pdf_context"] = pdf_text
        
        return {
            "message": "PDF uploaded successfully",
            "filename": file.filename,
            "text_length": len(pdf_text),
            "session_id": session_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading PDF: {str(e)}")

@app.post("/api/chat")
async def chat_stream(request: ChatRequest):
    """Chat endpoint with streaming support"""
    session = get_or_create_session(request.session_id)
    
    # Build context-aware prompt
    user_message = request.message
    if session["pdf_context"]:
        user_message = f"""You have access to the following PDF document content:

{session["pdf_context"][:3000]}...

User question: {request.message}

Please answer based on the PDF content if relevant, otherwise respond normally."""
    
    # Add user message to history
    session["history"].append({
        "role": "user",
        "content": request.message
    })
    
    # Build messages for Groq
    messages = [{"role": msg["role"], "content": msg["content"]} for msg in session["history"]]
    
    async def generate():
        """Generator function for streaming responses"""
        try:
            # Generate response using Groq with streaming
            stream = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Fast and capable model
                messages=messages,
                temperature=0.7,
                max_tokens=2048,
                stream=True
            )
            
            full_response = ""
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    # Send chunk as Server-Sent Event
                    yield f"data: {json.dumps({'chunk': content})}\n\n"
            
            # Add assistant response to history
            session["history"].append({
                "role": "assistant",
                "content": full_response
            })
            
            # Send completion signal
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except Exception as e:
            error_msg = f"Error generating response: {str(e)}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.get("/api/history/{session_id}")
async def get_history(session_id: str = "default"):
    """Get chat history for a session"""
    session = get_or_create_session(session_id)
    return {
        "session_id": session_id,
        "history": session["history"],
        "has_pdf": session["pdf_context"] is not None
    }

@app.post("/api/reset")
async def reset_chat(request: ResetRequest):
    """Reset chat session"""
    if request.session_id in chat_sessions:
        del chat_sessions[request.session_id]
    
    return {
        "message": "Chat session reset successfully",
        "session_id": request.session_id
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

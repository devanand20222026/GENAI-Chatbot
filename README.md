# GenAI Chatbot Web App 🤖

A full-stack AI-powered chatbot application with PDF analysis capabilities, built with Next.js and FastAPI, powered by Google Gemini AI.

## ✨ Features

### Must-Have Features
- ✅ **Interactive Chat UI** - Modern, responsive chat interface with real-time messaging
- ✅ **PDF Upload & Analysis** - Upload PDF documents and ask questions about their content
- ✅ **LLM Integration** - Powered by Google Gemini Pro API for intelligent responses
- ✅ **Modern Frontend** - Built with Next.js 14 and React
- ✅ **Robust Backend** - FastAPI backend with async support

### Bonus Features
- ✅ **Streaming Responses** - Real-time word-by-word response streaming
- ✅ **Chat History** - Maintains conversation context throughout the session
- ✅ **Conversation Reset** - Clear chat history and start fresh
- ✅ **Premium UI/UX** - Glassmorphism effects, gradients, and smooth animations
- ✅ **Session Management** - Persistent chat sessions with PDF context
- ✅ **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Styling**: Modern CSS with custom properties, glassmorphism, and animations
- **Font**: Inter (Google Fonts)

### Backend
- **Framework**: FastAPI (Python)
- **LLM**: Google Gemini Pro API
- **PDF Processing**: PyPDF2
- **Server**: Uvicorn with async support

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Google Gemini API Key** (free tier available)

## 🚀 Setup Instructions

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# OR
cp .env.example .env    # macOS/Linux

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Frontend Setup

```bash
# Navigate to project root (from backend directory)
cd ..

# Install dependencies
npm install
```

## 🎯 Running the Application

### Start Backend Server

```bash
# From backend directory with activated virtual environment
cd backend
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

### Start Frontend Server

```bash
# From project root (in a new terminal)
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📚 API Endpoints

### POST `/api/chat`
Stream chat responses with context awareness
- **Body**: `{ "message": "string", "session_id": "string" }`
- **Response**: Server-Sent Events (SSE) stream

### POST `/api/upload-pdf`
Upload and process PDF documents
- **Body**: FormData with PDF file
- **Response**: `{ "message": "string", "filename": "string", "text_length": number }`

### GET `/api/history/{session_id}`
Retrieve chat history for a session
- **Response**: `{ "session_id": "string", "history": [], "has_pdf": boolean }`

### POST `/api/reset`
Reset chat session and clear history
- **Body**: `{ "session_id": "string" }`
- **Response**: `{ "message": "string", "session_id": "string" }`

## 💡 Usage Guide

1. **Start a Conversation**
   - Type your message in the input field
   - Press Enter or click the send button
   - Watch as the AI responds in real-time with streaming

2. **Upload a PDF**
   - Click the "Upload PDF" button
   - Select a PDF file from your computer
   - Once uploaded, ask questions about the PDF content
   - The AI will answer based on the document

3. **Reset Chat**
   - Click "Reset Chat" to clear all messages
   - This also removes the PDF context
   - Start a fresh conversation

## 🎨 Design Features

- **Glassmorphism Effects** - Modern frosted glass UI elements
- **Gradient Accents** - Vibrant purple/blue color scheme
- **Smooth Animations** - Floating icons, message slides, typing indicators
- **Dark Theme** - Easy on the eyes with high contrast
- **Responsive Layout** - Adapts to all screen sizes

## 🚀 Deployment Options

### Frontend (Vercel - Recommended)
```bash
npm run build
# Deploy to Vercel, Netlify, or any static hosting
```

### Backend (Railway, Render, or DigitalOcean)
```bash
# Ensure requirements.txt is up to date
pip freeze > requirements.txt

# Deploy using your preferred platform
# Remember to set GEMINI_API_KEY environment variable
```

### Docker (Optional)
Create `Dockerfile` for containerized deployment of both frontend and backend.

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Customization

- **Change LLM Model**: Edit `backend/main.py` and modify the model name in `genai.GenerativeModel()`
- **Adjust Styling**: Modify CSS variables in `app/globals.css`
- **Change Port**: Update `API_BASE_URL` in `app/page.js` and backend port in uvicorn command

## 📝 Project Structure

```
chatbot/
├── app/
│   ├── page.js          # Main chat component
│   ├── layout.js        # Root layout with metadata
│   └── globals.css      # Global styles and design system
├── backend/
│   ├── main.py          # FastAPI application
│   ├── requirements.txt # Python dependencies
│   └── .env.example     # Environment template
├── package.json         # Node.js dependencies
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python virtual environment is activated
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify GEMINI_API_KEY is set in `.env` file

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify `API_BASE_URL` in `app/page.js` matches backend URL

### PDF upload fails
- Ensure the file is a valid PDF
- Check file size (large PDFs may take longer to process)
- Verify PyPDF2 is installed correctly

### Streaming not working
- Check browser console for errors
- Ensure EventSource/fetch streaming is supported in your browser
- Verify backend is sending proper SSE format



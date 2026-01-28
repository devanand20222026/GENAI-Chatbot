# GenAI Chatbot - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your Free Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### Step 2: Setup Backend
```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
Copy-Item .env.example .env

# Edit .env and replace with your actual API key:
# GEMINI_API_KEY=your_actual_key_here
notepad .env
```

### Step 3: Run Backend
```powershell
# Make sure you're in backend directory with venv activated
uvicorn main:app --reload --port 8000
```

Keep this terminal open! Backend running at: http://localhost:8000

### Step 4: Run Frontend (New Terminal)
```powershell
# From project root
npm run dev
```

Frontend running at: http://localhost:3000

## ✅ You're Ready!

Open your browser to: **http://localhost:3000**

### Try These:
1. **Chat**: Type "Hello! What can you do?" and press Enter
2. **Upload PDF**: Click "Upload PDF" and select any PDF file
3. **Ask about PDF**: "Summarize the main points from the PDF"
4. **Reset**: Click "Reset Chat" to start fresh

## 🎯 Features to Test

- ✨ **Streaming**: Watch responses appear word-by-word
- 📄 **PDF Analysis**: Upload and ask questions
- 💬 **Chat History**: Scroll through conversation
- 🔄 **Reset**: Clear everything and start over
- 📱 **Responsive**: Try on mobile/tablet

## 🐛 Troubleshooting

**Backend won't start?**
- Check Python version: `python --version` (need 3.8+)
- Verify venv is activated (you should see `(venv)` in terminal)
- Make sure .env file has your API key

**Frontend won't connect?**
- Ensure backend is running on port 8000
- Check browser console for errors (F12)
- Verify API_BASE_URL in app/page.js

**PDF upload fails?**
- Ensure file is a valid PDF
- Check file size (very large PDFs may timeout)
- Look at backend terminal for error messages

## 📚 Next Steps

1. **Customize**: Edit colors in `app/globals.css`
2. **Deploy**: See README.md for deployment options
3. **Extend**: Add more features like voice input, image generation, etc.

---

**Need Help?** Check the full README.md for detailed documentation.

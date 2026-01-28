import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing with API key: {api_key[:20]}...")

try:
    genai.configure(api_key=api_key)
    
    # Try gemini-2.0-flash-exp
    print("\nTrying gemini-2.0-flash-exp...")
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content("Say hello")
        print(f"✓ Success with gemini-2.0-flash-exp: {response.text[:50]}")
    except Exception as e:
        print(f"✗ Failed: {e}")
    
    # Try models/gemini-exp-1206
    print("\nTrying models/gemini-exp-1206...")
    try:
        model = genai.GenerativeModel('models/gemini-exp-1206')
        response = model.generate_content("Say hello")
        print(f"✓ Success with models/gemini-exp-1206: {response.text[:50]}")
    except Exception as e:
        print(f"✗ Failed: {e}")
        
    # Try gemini-exp-1206
    print("\nTrying gemini-exp-1206...")
    try:
        model = genai.GenerativeModel('gemini-exp-1206')
        response = model.generate_content("Say hello")
        print(f"✓ Success with gemini-exp-1206: {response.text[:50]}")
    except Exception as e:
        print(f"✗ Failed: {e}")
    
except Exception as e:
    print(f"Error: {type(e).__name__}: {str(e)}")

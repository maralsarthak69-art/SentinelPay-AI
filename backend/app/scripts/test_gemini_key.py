import os
import json
import google.generativeai as genai

env_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
key = ""
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                key = line.split("=", 1)[1].strip()

print("Testing Gemini API Key...")
print("Loaded Key:", key[:12] + "..." if key else "NOT FOUND")

if not key:
    print("ERROR: GEMINI_API_KEY not found in .env!")
    exit(1)

genai.configure(api_key=key)

print("\n--- Listing Available Models ---")
try:
    available_models = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            available_models.append(m.name)
            print(f"- {m.name}")

    # Try testing available models
    tested = False
    for model_name in available_models:
        try:
            print(f"\nTesting model: {model_name}...")
            model = genai.GenerativeModel(model_name)
            res = model.generate_content("Respond in 5 words: Confirm Gemini AI API is active.")
            print("SUCCESS!")
            print("Response:", res.text.strip())
            tested = True
            break
        except Exception as e:
            print(f"Failed with {model_name}: {str(e)}")

    if not tested and available_models:
        print("Could not generate content with listed models.")

except Exception as e:
    print("\n--- GEMINI API LIST MODELS ERROR ---")
    print("Error details:", str(e))

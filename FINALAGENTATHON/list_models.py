import os
from google.genai import Client

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("No API Key found")
    exit(1)

client = Client(api_key=GOOGLE_API_KEY)
try:
    print("Listing models...")
    for m in client.models.list():
        print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")

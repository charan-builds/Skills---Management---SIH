from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app

client = TestClient(app)

def print_summary(name, response):
    print(f"--- {name} ---")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, list):
            print(f"Returned List with {len(data)} items.")
            if data:
                print(f"First item keys: {list(data[0].keys())}")
        elif isinstance(data, dict):
            print(f"Returned Dict with keys: {list(data.keys())}")
            for k, v in data.items():
                if isinstance(v, list):
                    print(f"  {k}: list of {len(v)} items")
        else:
            print(f"Returned: type {type(data)}")
    else:
        print(f"Error: {response.text}")
    print("\n")

# Use a demo token. The middleware might require a token. 
# In app.auth.dependencies, let's see if we can bypass or use a specific token.
import base64
import json
payload = {"role": "admin", "uid": "123"}
b64_payload = base64.b64encode(json.dumps(payload).encode()).decode().rstrip('=')
token = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0." + b64_payload + "."
headers = {"Authorization": f"Bearer {token}"} 

print_summary("GET /api/trainees", client.get("/api/trainees", headers=headers))
print_summary("GET /api/programmes", client.get("/api/programmes", headers=headers))
print_summary("GET /api/jobs", client.get("/api/jobs", headers=headers))
print_summary("GET /api/skills", client.get("/api/skills", headers=headers))


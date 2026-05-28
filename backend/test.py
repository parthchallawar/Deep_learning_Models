import requests
try:
    # Test the local FastAPI endpoint
    response = requests.get('http://localhost:8000/')
    print(f"Local Server Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Local Server Error: {e}")
    print("\nIt seems the uvicorn server is not running. Please stop and restart the previous cell (ug9fBdGk-svX).")
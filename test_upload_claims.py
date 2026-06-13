import httpx, os
from dotenv import load_dotenv

base_dir = r"d:\\SEMESTER6\\PBL\\AXA-PRISM"
load_dotenv(os.path.join(base_dir, ".env.local"))
url = os.getenv("NEXT_PUBLIC_API_BASE_URL") or "http://127.0.0.1:8000"
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
headers = {"apikey": key, "Authorization": f"Bearer {key}"}

file_path = os.path.join(base_dir, "Data_Klaim.csv")
with open(file_path, "rb") as f:
    files = {"file": ("Data_Klaim.csv", f, "text/csv")}
    try:
        r = httpx.post(f"{url}/api/v1/upload/claims", files=files, headers=headers)
        print("Status:", r.status_code)
        print("Response JSON:", r.json())
    except Exception as e:
        print("Error during request:", e)

import requests

#python Scripts/auto_register.py

URL = "http://localhost:5000/api/register"  # adjust to your Flask route

payload = {
    "name": "Test",
    "email": "test1@example.com",
    "password": "password123"
}

response = requests.post(URL, json=payload)

if response.status_code == 201:
    print("✅ Account registered successfully")
else:
    print("❌ Failed to register")
    print(response.status_code, response.text)

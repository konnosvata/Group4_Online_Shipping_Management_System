import requests
import json

BASE_URL = "http://localhost:5000/api/login"

payload = {
    "email": "alice@example.com",
    "password": "12345"
}

def test_login():
    print("Testing login API...")

    response = requests.post(
        BASE_URL,
        headers={"Content-Type": "application/json"},
        json=payload
    )

    print(f"Status Code: {response.status_code}")

    try:
        data = response.json()
    except json.JSONDecodeError:
        print("Invalid JSON response")
        print(response.text)
        return

    if response.status_code != 200:
        print("Login failed")
        print("Error:", data.get("error"))
        return

    user = data.get("user")
    print("Login successful")
    print(f"User ID   : {user['id']}")
    print(f"Name      : {user['name']}")
    print(f"Email     : {user['email']}")
    print(f"Role ID   : {user['role_id']}")

    if user["role_id"] == 1:
        print("Redirect to /customer/create-shipment")
    elif user["role_id"] == 2:
        print("Redirect to /driver/assignedShipments")
    elif user["role_id"] == 3:
        print("Redirect to /admin/monitorDrivers")
    else:
        print("Unknown role")

if __name__ == "__main__":
    test_login()

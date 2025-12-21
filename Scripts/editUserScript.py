import requests
import json

BASE_URL = "http://localhost:5000/api"

# Must match an existing user in your database
USER_ID = 1   # change if Alice has a different user_id

UPDATED_USER_DATA = {
    "user_id": USER_ID,
    "name": "Alice Johnson2",
    "email": "alice@example.com",
    "password": "12345"
}


def get_user(user_id):
    print("\nFetching user profile...")

    response = requests.get(
        f"{BASE_URL}/getUser",
        params={"user_id": user_id}
    )

    print(f"Status Code: {response.status_code}")

    if response.status_code != 200:
        print("Failed to fetch user")
        print(response.text)
        return None

    data = response.json()
    print("User fetched successfully:")
    print(json.dumps(data, indent=2))
    return data


def update_user(user_data):
    print("\nUpdating user profile...")

    response = requests.post(
        f"{BASE_URL}/updateUser",
        headers={"Content-Type": "application/json"},
        json=user_data
    )

    print(f"Status Code: {response.status_code}")

    if response.status_code != 200:
        print("Failed to update user")
        print(response.text)
        return False

    print("User updated successfully")
    print(response.json())
    return True


if __name__ == "__main__":
    print("Starting Account Settings API Test")

    user = get_user(USER_ID)

    if not user:
        print("Stopping test due to fetch failure")
        exit(1)

    success = update_user(UPDATED_USER_DATA)

    if not success:
        print("Stopping test due to update failure")
        exit(1)

    updated_user = get_user(USER_ID)

    print("\nTest completed")

import requests
import json

BASE_URL = "http://localhost:5000/api"

UPDATED_FORMULA = {
    "price_per_km": 5,
    "price_per_weight": 10,
    "base_fee": 50,
    "fragile_fee": 25
}


def get_payment_formula():
    print("\nFetching payment formula...")

    response = requests.get(f"{BASE_URL}/getPaymentFormula")
    print(f"Status Code: {response.status_code}")

    if response.status_code != 200:
        print("Failed to fetch payment formula")
        print(response.text)
        return None

    data = response.json()
    print("Payment formula fetched successfully:")
    print(json.dumps(data, indent=2))
    return data


def update_payment_formula(formula_data):
    print("\nUpdating payment formula...")

    response = requests.post(
        f"{BASE_URL}/updatePaymentFormula",
        headers={"Content-Type": "application/json"},
        json=formula_data
    )

    print(f"Status Code: {response.status_code}")

    if response.status_code != 200:
        print("Failed to update payment formula")
        print(response.text)
        return False

    print("Payment formula updated successfully")
    print(response.json())
    return True


if __name__ == "__main__":
    print("Starting Payment Formula API Test")

    formula = get_payment_formula()

    if not formula:
        print("Stopping test due to fetch failure")
        exit(1)

    success = update_payment_formula(UPDATED_FORMULA)

    if not success:
        print("Stopping test due to update failure")
        exit(1)

    updated_formula = get_payment_formula()

    print("\nTest completed")

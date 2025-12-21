import requests

BASE_URL = "http://localhost:5000/api"

print(" Script started")

#python Scripts/get_shipments.py

def get_active_and_pending_shipments():
    """
    Fetch only ACTIVE and PENDING shipments
    """
    response = requests.get(
        f"{BASE_URL}/shipments",
        params={"status": "active"}
    )

    if response.status_code != 200:
        raise Exception(
            f"Failed to fetch active shipments: {response.status_code} {response.text}"
        )

    shipments = response.json()

    
    active_pending = [
        s for s in shipments
        if s.get("status") in ("active", "pending")
    ]

    return active_pending


def get_full_shipment_history():
    """
    Fetch ALL shipments (history)
    """
    response = requests.get(f"{BASE_URL}/shipments")

    if response.status_code != 200:
        raise Exception(
            f"Failed to fetch shipment history: {response.status_code} {response.text}"
        )

    return response.json()


def print_shipments(shipments, title):
    print(f"\n{'=' * 60}")
    print(title)
    print(f"{'=' * 60}\n")

    if not shipments:
        print("No shipments found.\n")
        return

    for s in shipments:
        print(f"ID: {s.get('shipment_id')}")
        print(f"Status: {s.get('status')}")
        print(f"Destination: {s.get('destination')}")
        print(f"Date Created: {s.get('date_created')}")
        print(f"Date to Deliver: {s.get('date_to_deliver')}")
        print(f"Weight: {s.get('weight')} kg")

        dimensions = f"{s.get('length')} × {s.get('width')} × {s.get('height')} cm"
        print(f"Dimensions: {dimensions}")

        print(f"Fragile: {'Yes' if s.get('fragile') else 'No'}")
        print("-" * 60)


if __name__ == "__main__":
    try:
        print("✅ Fetching shipments...")
        
        active_shipments = get_active_and_pending_shipments()
        print_shipments(active_shipments, "ACTIVE")

        history = get_full_shipment_history()
        print_shipments(history, "FULL SHIPMENT HISTORY")

    except Exception as e:
        print(f"\n❌ ERROR: {e}")

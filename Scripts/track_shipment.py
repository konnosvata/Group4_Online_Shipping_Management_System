import requests

#python Scripts/track_shipment.py

URL = "http://localhost:5000/api/activeShipments?user_id=1"  # You can change user_id if needed

try:
    response = requests.get(URL)

    if response.status_code == 200:
        shipments = response.json()
        if not shipments:
            print("⚠️ No active shipments found.")
        else:
            print("📍 Active Shipments and Driver Locations:")
            for s in shipments:
                print(f"Shipment #{s['shipment_id']}")
                print(f"  Driver ID: {s['driver_id']}")
                print(f"  Status: {s['status']}")
                print(f"  Destination: {s['destination']}")
                print(f"  Last Location: ({s['last_latitude']}, {s['last_longitude']})\n")
    else:
        print("❌ Failed to fetch shipments")
        print(response.status_code, response.text)

except requests.exceptions.RequestException as e:
    print("❌ Error connecting to the server:", e)

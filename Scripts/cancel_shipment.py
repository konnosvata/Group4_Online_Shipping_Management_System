import requests

# URL of the Flask API endpoint
URL = "http://localhost:5000/api/cancelShipment"  # adjust if different

#python Scripts/cancel_shipment.py

# Shipment ID to cancel
payload = {
    "shipment_id": 1  # replace with the actual shipment ID you want to cancel
}

try:
    response = requests.post(URL, json=payload)

    if response.status_code == 200:
        print("✅ Shipment cancelled successfully")
        print("Response:", response.json())
    elif response.status_code == 404:
        print("❌ Shipment not found")
    elif response.status_code == 400:
        print("❌ Bad request:", response.json())
    else:
        print("❌ Failed to cancel shipment")
        print("Status code:", response.status_code)
        print("Response:", response.text)

except requests.exceptions.RequestException as e:
    print("❌ Error connecting to API:", e)

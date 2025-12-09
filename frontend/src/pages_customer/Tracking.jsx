import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function Tracking() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backendUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : `http://${window.location.hostname}:5000`;

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          setError("No user logged in.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${backendUrl}/api/activeShipments?user_id=${user.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch shipments");
        }

        setShipments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [backendUrl]);

  // Leaflet marker icon (green truck emoji)
  const truckIcon = new L.DivIcon({
    className: "",
    html: "🚚",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  if (loading) return <p>Loading shipments...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (shipments.length === 0) return <p>No active shipments to track.</p>;

  // Map center: first shipment driver's location (fallback if null)
  const firstLocation = shipments.find(s => s.last_latitude && s.last_longitude);
  const center = firstLocation
    ? [firstLocation.last_latitude, firstLocation.last_longitude]
    : [35.1856, 33.3823]; // Default Cyprus center

  return (
    <div style={{ padding: "20px" }}>
      <h2>📍 Track Your Shipments</h2>
      <MapContainer style={{ height: "500px", width: "100%" }} center={center} zoom={13}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {shipments.map((s) => (
          s.last_latitude && s.last_longitude && (
            <Marker
              key={s.shipment_id}
              position={[s.last_latitude, s.last_longitude]}
              icon={truckIcon}
            >
              <Popup>
                <strong>Shipment #{s.shipment_id}</strong><br />
                Status: {s.status}<br />
                Destination: {s.destination}<br />
                Driver ID: {s.driver_id}
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}

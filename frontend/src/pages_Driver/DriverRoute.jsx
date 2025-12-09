import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Detect map clicks
function MapClicker({ onClick }) {
  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function DirectLineRoute() {
  const [points, setPoints] = useState([]); // stored clicked points

  const addPoint = (latlng) => setPoints([...points, latlng]);

  const clearPoints = () => setPoints([]);

  // Remove OLDEST marker & save to backend
  const removeOldestPoint = async () => {
    if (points.length === 0) return;

    const removedPoint = points[0];
    setPoints(points.slice(1));

    try {
      // Read the saved user object from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (!userId) {
        console.error("No user_id found in localStorage!");
        return;
      }

      await fetch("http://127.0.0.1:5000/save-driver-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          latitude: removedPoint[0],
          longitude: removedPoint[1],
        }),
      });
    } catch (err) {
      console.error("Failed to save removed point:", err);
    }
  };

  // Green check emoji marker
  const checkIcon = new DivIcon({
    className: "",
    html: "✅",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2>🗺 Click-to-Connect Route</h2>

      <button
        onClick={clearPoints}
        style={{ marginBottom: 10, marginRight: 10 }}
      >
        Clear Points
      </button>

      <button
        onClick={removeOldestPoint}
        disabled={points.length === 0}
        style={{ marginBottom: 10 }}
      >
        Remove Oldest Point
      </button>

      <MapContainer
        style={{ height: "500px", width: "100%" }}
        center={[35.1856, 33.3823]} // Cyprus center
        zoom={13}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Enable click-to-add */}
        <MapClicker onClick={addPoint} />

        {/* Markers */}
        {points.map((p, idx) => (
          <Marker key={idx} position={p} icon={checkIcon}>
            <Popup>Point #{idx + 1}</Popup>
          </Marker>
        ))}

        {/* Auto-create polyline */}
        {points.length > 1 && <Polyline positions={points} color="blue" />}
      </MapContainer>
    </div>
  );
}

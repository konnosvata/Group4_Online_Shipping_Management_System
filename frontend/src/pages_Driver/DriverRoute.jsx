// DriverRoute.jsx
import { useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// FitBounds component to auto-zoom to route
function FitBounds({ coords }) {
  const map = useMap();
  if (coords.length) {
    map.fitBounds(coords);
  }
  return null;
}

export default function DriverRoute() {
  const [route, setRoute] = useState(null);

  // Hardcoded Cyprus route: EUC → Lidras → Nicosia Mall
 const fallbackRoute = [
  [33.33956, 35.16042], // EUC
  [33.36553, 35.17393], // Lidras
  [33.37154, 35.13046], // Nicosia Mall
];

  const loadRoute = async () => {
    try {
      const res = await fetch("http://localhost:5000/plan-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: fallbackRoute }),
      });

      const data = await res.json();

      if (!data.features || data.features.length === 0) {
        console.warn("No route returned from ORS, using fallback route.");
        // Wrap fallbackRoute in ORS-like structure
        setRoute({
          features: [{ geometry: { coordinates: fallbackRoute } }],
        });
      } else {
        setRoute(data);
      }
    } catch (err) {
      console.error("Error fetching route:", err);
      // On error, fall back to test route
      setRoute({
        features: [{ geometry: { coordinates: fallbackRoute } }],
      });
    }
  };

  function RouteMap({ route }) {
    if (!route?.features?.length) return null;

    // Leaflet expects [lat, lng], ORS gives [lng, lat]
    const coords = route.features[0].geometry.coordinates.map(c => [c[1], c[0]]);

    return (
      <MapContainer style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={coords} color="blue" />
        <FitBounds coords={coords} />
      </MapContainer>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Driver Route Planner</h1>
      <button onClick={loadRoute} style={{ marginBottom: "10px" }}>
        Load Route
      </button>
      {route && <RouteMap route={route} />}
    </div>
  );
}

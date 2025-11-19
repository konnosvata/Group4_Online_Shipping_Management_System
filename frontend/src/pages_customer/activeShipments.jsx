import React, { useEffect, useState } from "react";

function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        // Load logged-in user
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          setError("No user logged in.");
          setLoading(false);
          return;
        }

        // Call backend for only *this user's* shipments
        const res = await fetch(
          `http://localhost:5000/api/activeShipments?user_id=${user.id}`
        );

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error("Server did not return JSON: " + text);
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load shipments");
        }

        setShipments(data);
      } catch (err) {
        setError("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  if (loading) return <p>Loading shipments...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Active Shipments</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {shipments.length === 0 ? (
        <p>No active or pending shipments found.</p>
      ) : (
        shipments.map((ship) => (
          <div
            key={ship.shipment_id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
              background: "#f9f9f9"
            }}
          >
            <p><strong>ID:</strong> {ship.shipment_id}</p>
            <p><strong>Status:</strong> {ship.status}</p>
            <p><strong>Destination:</strong> {ship.destination}</p>
            <p><strong>Date Created:</strong> {ship.date_created}</p>
            <p><strong>Date to Deliver:</strong> {ship.date_to_deliver}</p>
            <p><strong>Weight:</strong> {ship.weight} kg</p>
            <p><strong>Dimensions:</strong> {ship.length} × {ship.width} × {ship.height}</p>
            <p><strong>Fragile:</strong> {ship.fragile ? "Yes" : "No"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default ShipmentsPage;

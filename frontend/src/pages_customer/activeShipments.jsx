import React, { useEffect, useState } from "react";

function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          setError("No user logged in.");
          setLoading(false);
          return;
        }

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

  const cancelShipment = async (shipment_id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this shipment?"
    );

    if (!confirmCancel) return;

    try {
      const res = await fetch("http://localhost:5000/api/cancelShipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipment_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to cancel shipment");
        return;
      }

      // Remove cancelled shipment from UI
      setShipments((prev) =>
        prev.filter((ship) => ship.shipment_id !== shipment_id)
      );

      alert("Shipment cancelled successfully.");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

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
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
              background: "#f9f9f9",
            }}
          >
            <p>
              <strong>ID:</strong> {ship.shipment_id}
            </p>
            <p>
              <strong>Status:</strong> {ship.status}
            </p>
            <p>
              <strong>Destination:</strong> {ship.destination}
            </p>
            <p>
              <strong>Date Created:</strong> {ship.date_created}
            </p>
            <p>
              <strong>Date to Deliver:</strong> {ship.date_to_deliver}
            </p>
            <p>
              <strong>Weight:</strong> {ship.weight} kg
            </p>
            <p>
              <strong>Dimensions:</strong> {ship.length} × {ship.width} ×{" "}
              {ship.height}
            </p>
            <p>
              <strong>Fragile:</strong> {ship.fragile ? "Yes" : "No"}
            </p>

            {/* Cancel Button */}
            <button
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => cancelShipment(ship.shipment_id)}
            >
              Cancel Shipment
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ShipmentsPage;

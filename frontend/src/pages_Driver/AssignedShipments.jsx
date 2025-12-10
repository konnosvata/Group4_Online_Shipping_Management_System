import React, { useCallback, useEffect, useState } from "react";

function AssignedShipments() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const backendUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : `http://${window.location.hostname}:5000`;

  const fetchAssignedShipments = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setError("No user logged in.");
        setLoading(false);
        return;
      }

      const endpoint = showFullHistory 
        ? `${backendUrl}/api/assignedShipmentsHistory?user_id=${user.id}`
        : `${backendUrl}/api/assignedShipments?user_id=${user.id}`;

      const res = await fetch(endpoint);

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
  }, [backendUrl, showFullHistory]);

  useEffect(() => {
    fetchAssignedShipments();
  }, [fetchAssignedShipments]);

  const handleToggleHistory = () => {
    setShowFullHistory(!showFullHistory);
  };

  if (loading) return <p>Loading assigned shipments...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Your Assigned Shipments</h2>
        <button
          onClick={handleToggleHistory}
          style={{
            padding: "10px 20px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#0056b3";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#007bff";
          }}
        >
          {showFullHistory ? "Show Active Only" : "Show Full History"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {shipments.length === 0 ? (
        <p>No assigned shipments found.</p>
      ) : (
        shipments.map((ship) => (
          <div
            key={ship.shipment_id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
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
            <p><strong>Dimensions:</strong> {ship.length} × {ship.width} × {ship.height} cm</p>
            <p><strong>Fragile:</strong> {ship.fragile ? "Yes" : "No"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default AssignedShipments;
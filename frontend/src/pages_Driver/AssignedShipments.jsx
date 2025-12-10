import React, { useCallback, useEffect, useState } from "react";

function AssignedShipments() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);

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

      const res = await fetch(`${backendUrl}/api/assignedShipments?user_id=${user.id}`);

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
  }, [backendUrl]);

  useEffect(() => {
    fetchAssignedShipments();
  }, [fetchAssignedShipments]);

  const handleMenuToggle = (shipmentId) => {
    setMenuOpen(menuOpen === shipmentId ? null : shipmentId);
  };

  if (loading) return <p>Loading assigned shipments...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Assigned Shipments</h2>

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
              background: "#f9f9f9",
              position: "relative"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p><strong>ID:</strong> {ship.shipment_id}</p>
                <p><strong>Status:</strong> {ship.status}</p>
                <p><strong>Destination:</strong> {ship.destination}</p>
                <p><strong>Date Created:</strong> {ship.date_created}</p>
                <p><strong>Date to Deliver:</strong> {ship.date_to_deliver}</p>
                <p><strong>Weight:</strong> {ship.weight} kg</p>
                <p><strong>Dimensions:</strong> {ship.length} × {ship.width} × {ship.height} cm</p>
                <p><strong>Fragile:</strong> {ship.fragile ? "Yes" : "No"}</p>
              </div>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => handleMenuToggle(ship.shipment_id)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "5px"
                  }}
                >
                  ⋮
                </button>

                {menuOpen === ship.shipment_id && (
                  <div style={{
                    position: "absolute",
                    top: "30px",
                    right: "0",
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    zIndex: 10,
                    minWidth: "150px"
                  }}>
                    <button
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "12px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        borderBottom: "1px solid #eee"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "none";
                      }}
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AssignedShipments;
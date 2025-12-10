import React, { useCallback, useEffect, useState } from "react";

function AssignedShipments() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [showFullHistory, setShowFullHistory] = useState(false);
=======
  const [menuOpen, setMenuOpen] = useState(null);
>>>>>>> fda002e14261190788c43c29c9f725e9bf20b9d9

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

<<<<<<< HEAD
      const endpoint = showFullHistory 
        ? `${backendUrl}/api/assignedShipmentsHistory?user_id=${user.id}`
        : `${backendUrl}/api/assignedShipments?user_id=${user.id}`;

      const res = await fetch(endpoint);
=======
      const res = await fetch(`${backendUrl}/api/assignedShipments?user_id=${user.id}`);
>>>>>>> fda002e14261190788c43c29c9f725e9bf20b9d9

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
<<<<<<< HEAD
  }, [backendUrl, showFullHistory]);
=======
  }, [backendUrl]);
>>>>>>> fda002e14261190788c43c29c9f725e9bf20b9d9

  useEffect(() => {
    fetchAssignedShipments();
  }, [fetchAssignedShipments]);

<<<<<<< HEAD
  const handleToggleHistory = () => {
    setShowFullHistory(!showFullHistory);
=======
  const handleMenuToggle = (shipmentId) => {
    setMenuOpen(menuOpen === shipmentId ? null : shipmentId);
>>>>>>> fda002e14261190788c43c29c9f725e9bf20b9d9
  };

  if (loading) return <p>Loading assigned shipments...</p>;

  return (
    <div style={{ padding: "20px" }}>
<<<<<<< HEAD
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
=======
      <h2>Your Assigned Shipments</h2>
>>>>>>> fda002e14261190788c43c29c9f725e9bf20b9d9

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
<<<<<<< HEAD
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
=======
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
>>>>>>> fda002e14261190788c43c29c9f725e9bf20b9d9
          </div>
        ))
      )}
    </div>
  );
}

export default AssignedShipments;
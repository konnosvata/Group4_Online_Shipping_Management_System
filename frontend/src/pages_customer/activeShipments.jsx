import React, { useEffect, useState } from "react";

function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const backendUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : `http://${window.location.hostname}:5000`;

  useEffect(() => {
    fetchShipments(showHistory);
  }, [showHistory]);

  const fetchShipments = async (historyMode) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setError("No user logged in.");
        setLoading(false);
        return;
      }

      const endpoint = historyMode
        ? `${backendUrl}/api/allShipments?user_id=${user.id}`
        : `${backendUrl}/api/activeShipments?user_id=${user.id}`;

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
  };

  const handleMenuToggle = (shipmentId) => {
    setMenuOpen(menuOpen === shipmentId ? null : shipmentId);
  };

  const handleEditClick = (shipment) => {
    setEditingId(shipment.shipment_id);
    setEditForm({ ...shipment });
    setMenuOpen(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!window.confirm("Are you sure you want to save these changes?")) {
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/updateShipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment_id: editingId,
          destination: editForm.destination,
          weight: editForm.weight,
          length: editForm.length,
          width: editForm.width,
          height: editForm.height,
          date_to_deliver: editForm.date_to_deliver,
          fragile: editForm.fragile
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update shipment");
        return;
      }

      alert("Shipment updated successfully!");
      setEditingId(null);
      fetchShipments(showHistory);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleCancelShipment = (shipmentId) => {
    setConfirmAction({
      type: "cancel",
      shipmentId: shipmentId,
      message: "Are you sure you want to cancel this shipment?"
    });
  };

  const confirmActionHandler = async () => {
    const { type, shipmentId } = confirmAction;

    try {
      let endpoint = "/api/cancelShipment";
      
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipment_id: shipmentId })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Action failed");
        return;
      }

      alert(data.message);
      setConfirmAction(null);
      setMenuOpen(null);
      fetchShipments(showHistory);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <p>Loading shipments...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{showHistory ? "Full Shipment History" : "Your Active Shipments"}</h2>

      <button
        style={{
          marginBottom: "20px",
          padding: "10px 15px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
        onClick={() => setShowHistory((prev) => !prev)}
      >
        {showHistory ? "Show Active Shipments" : "Show Full History"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {shipments.length === 0 ? (
        <p>No active or pending shipments found.</p>
      ) : (
        shipments.map((ship) => (
          <div key={ship.shipment_id}>
            {editingId === ship.shipment_id ? (
              <div style={{
                border: "2px solid #007bff",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "8px",
                background: "#f0f8ff"
              }}>
                <h4>Edit Shipment #{ship.shipment_id}</h4>

                <div style={{ marginBottom: "10px" }}>
                  <label><strong>Destination:</strong></label>
                  <input
                    type="text"
                    value={editForm.destination || ""}
                    onChange={(e) => handleEditChange("destination", e.target.value)}
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label><strong>Weight (kg):</strong></label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.weight || ""}
                      onChange={(e) => handleEditChange("weight", e.target.value)}
                      style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                  </div>
                  <div>
                    <label><strong>Length (cm):</strong></label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.length || ""}
                      onChange={(e) => handleEditChange("length", e.target.value)}
                      style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                  </div>
                  <div>
                    <label><strong>Width (cm):</strong></label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.width || ""}
                      onChange={(e) => handleEditChange("width", e.target.value)}
                      style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                  </div>
                  <div>
                    <label><strong>Height (cm):</strong></label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.height || ""}
                      onChange={(e) => handleEditChange("height", e.target.value)}
                      style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <label><strong>Delivery Date:</strong></label>
                  <input
                    type="date"
                    value={editForm.date_to_deliver || ""}
                    onChange={(e) => handleEditChange("date_to_deliver", e.target.value)}
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <input
                    type="checkbox"
                    checked={editForm.fragile === 1 || editForm.fragile === true}
                    onChange={(e) => handleEditChange("fragile", e.target.checked ? 1 : 0)}
                  />
                  <label style={{ marginLeft: "8px" }}><strong>Fragile</strong></label>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
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
                    {!showHistory && (
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
                    )}

                    {!showHistory && menuOpen === ship.shipment_id && (
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
                          onClick={() => ship.status === "pending" && handleEditClick(ship)}
                          disabled={ship.status !== "pending"}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "12px",
                            border: "none",
                            background: "none",
                            cursor: ship.status === "pending" ? "pointer" : "not-allowed",
                            textAlign: "left",
                            borderBottom: "1px solid #eee",
                            opacity: ship.status === "pending" ? 1 : 0.5,
                            color: ship.status === "pending" ? "#000" : "#999"
                          }}
                          onMouseEnter={(e) => {
                            if (ship.status === "pending") {
                              e.target.style.background = "#f0f0f0";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "none";
                          }}
                          title={ship.status === "pending" ? "Edit Shipment" : "Only pending orders can be edited"}
                        >
                          ✏️ Edit Shipment
                        </button>
                        <button
                          onClick={() => (ship.status === "pending") && handleCancelShipment(ship.shipment_id)}
                          disabled={ship.status !== "pending"}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "12px",
                            border: "none",
                            background: "none",
                            cursor: ship.status === "pending" ? "pointer" : "not-allowed",
                            textAlign: "left",
                            opacity: ship.status === "pending" ? 1 : 0.5,
                            color: ship.status === "pending" ? "#000" : "#999"
                          }}
                          onMouseEnter={(e) => {
                            if (ship.status === "pending") {
                              e.target.style.background = "#f0f0f0";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "none";
                          }}
                          title={ship.status === "pending" ? "Cancel Shipment" : ship.status === "active" ? "Active shipments cannot be cancelled" : "This shipment is already cancelled"}
                        >
                          ❌ Cancel Shipment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {confirmAction && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 100
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "400px"
          }}>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>{confirmAction.message}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={confirmActionHandler}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Yes, Confirm
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShipmentsPage;
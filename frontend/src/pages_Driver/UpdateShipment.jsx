import React, { useEffect, useState } from "react";

function UpdateShipment() {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const backendUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

  useEffect(() => {
    fetchAssignedShipments();
  }, []);

  const fetchAssignedShipments = async () => {
    try {
      setLoading(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setError("No user logged in.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${backendUrl}/api/assignedShipments?user_id=${user.id}`
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

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: "active",
      active: "delivered",
      delivered: null,
      cancelled: null,
    };
    return statusFlow[currentStatus.toLowerCase()] || null;
  };

  const getStatusActionText = (currentStatus) => {
    const actionText = {
      pending: "Confirm Pickup",
      active: "Confirm Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return actionText[currentStatus.toLowerCase()] || "Unknown";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffc107",
      active: "#17a2b8",
      delivered: "#28a745",
      cancelled: "#dc3545",
    };
    return colors[status.toLowerCase()] || "#6c757d";
  };

  const handleShipmentClick = (shipment) => {
    if (shipment.status.toLowerCase() === "cancelled") {
      return;
    }
    setSelectedShipment(shipment);
  };

  const handleStatusUpdate = (shipment) => {
    const nextStatus = getNextStatus(shipment.status);

    if (!nextStatus) {
      return;
    }

    const actionText = nextStatus === "active" ? "pickup" : "delivery";

    setConfirmDialog({
      shipment: shipment,
      nextStatus: nextStatus,
      message: `Are you sure you want to confirm ${actionText} for Shipment #${shipment.shipment_id}?`,
    });
  };

  const confirmStatusUpdate = async () => {
    if (!confirmDialog) return;

    const { shipment, nextStatus } = confirmDialog;

    try {
      setUpdating(true);
      setError("");

      const res = await fetch(`${backendUrl}/api/updateShipmentStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment_id: shipment.shipment_id,
          status: nextStatus,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error("Server did not return JSON: " + text);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      alert(`Shipment #${shipment.shipment_id} status updated to ${nextStatus}`);

      setConfirmDialog(null);
      setSelectedShipment(null);
      fetchAssignedShipments();
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const cancelConfirmation = () => {
    setConfirmDialog(null);
  };

  if (loading) return <p>Loading assigned shipments...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Update Shipment Status</h2>

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      {shipments.length === 0 ? (
        <p>No assigned shipments found.</p>
      ) : (
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: "1", maxWidth: "400px" }}>
            <h3>Your Shipments</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {shipments.map((ship) => {
                const isCancelled = ship.status.toLowerCase() === "cancelled";
                const isDelivered = ship.status.toLowerCase() === "delivered";
                const isSelected =
                  selectedShipment &&
                  selectedShipment.shipment_id === ship.shipment_id;

                return (
                  <div
                    key={ship.shipment_id}
                    onClick={() => handleShipmentClick(ship)}
                    style={{
                      border: isSelected
                        ? "3px solid #007bff"
                        : "1px solid #ccc",
                      padding: "15px",
                      borderRadius: "8px",
                      background: isCancelled
                        ? "#f8f9fa"
                        : isSelected
                        ? "#e7f3ff"
                        : "#fff",
                      cursor:
                        isCancelled || isDelivered ? "not-allowed" : "pointer",
                      opacity: isCancelled ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <strong>Shipment #{ship.shipment_id}</strong>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "white",
                          backgroundColor: getStatusColor(ship.status),
                        }}
                      >
                        {ship.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0", fontSize: "14px" }}>
                      <strong>Destination:</strong> {ship.destination}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "14px" }}>
                      <strong>Deliver by:</strong> {ship.date_to_deliver}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex: "2" }}>
            {selectedShipment ? (
              <div
                style={{
                  border: "2px solid #007bff",
                  padding: "20px",
                  borderRadius: "8px",
                  background: "#f8f9fa",
                }}
              >
                <h3>Shipment Details</h3>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <strong>Shipment ID:</strong> {selectedShipment.shipment_id}
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <strong>Current Status:</strong>{" "}
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "white",
                        backgroundColor: getStatusColor(
                          selectedShipment.status
                        ),
                        marginLeft: "8px",
                      }}
                    >
                      {selectedShipment.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <strong>Destination:</strong> {selectedShipment.destination}
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <strong>Weight:</strong> {selectedShipment.weight} kg
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <strong>Dimensions:</strong> {selectedShipment.length} x{" "}
                    {selectedShipment.width} x {selectedShipment.height} cm
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <strong>Fragile:</strong>{" "}
                    {selectedShipment.fragile ? "Yes" : "No"}
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <strong>Date Created:</strong>{" "}
                    {selectedShipment.date_created}
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <strong>Deliver by:</strong>{" "}
                    {selectedShipment.date_to_deliver}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #ddd",
                    paddingTop: "20px",
                  }}
                >
                  {getNextStatus(selectedShipment.status) ? (
                    <button
                      onClick={() => handleStatusUpdate(selectedShipment)}
                      disabled={updating}
                      style={{
                        width: "100%",
                        padding: "15px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "white",
                        backgroundColor: updating ? "#6c757d" : "#28a745",
                        border: "none",
                        borderRadius: "6px",
                        cursor: updating ? "not-allowed" : "pointer",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!updating)
                          e.target.style.backgroundColor = "#218838";
                      }}
                      onMouseLeave={(e) => {
                        if (!updating)
                          e.target.style.backgroundColor = "#28a745";
                      }}
                    >
                      {updating
                        ? "Updating..."
                        : getStatusActionText(selectedShipment.status)}
                    </button>
                  ) : (
                    <div
                      style={{
                        padding: "15px",
                        textAlign: "center",
                        backgroundColor: "#e9ecef",
                        borderRadius: "6px",
                        color: "#6c757d",
                      }}
                    >
                      {selectedShipment.status.toLowerCase() === "delivered"
                        ? "This shipment has been delivered"
                        : "No further action available"}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: "1px dashed #ccc",
                  padding: "40px",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#6c757d",
                }}
              >
                <p style={{ fontSize: "18px" }}>
                  Select a shipment from the list to view details and update
                  status
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "500px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
              Confirm Status Update
            </h3>
            <p style={{ fontSize: "16px", marginBottom: "30px" }}>
              {confirmDialog.message}
            </p>

            <div
              style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
            >
              <button
                onClick={cancelConfirmation}
                disabled={updating}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                  backgroundColor: "#e9ecef",
                  border: "none",
                  borderRadius: "4px",
                  cursor: updating ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={updating}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "white",
                  backgroundColor: updating ? "#6c757d" : "#28a745",
                  border: "none",
                  borderRadius: "4px",
                  cursor: updating ? "not-allowed" : "pointer",
                }}
              >
                {updating ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateShipment;

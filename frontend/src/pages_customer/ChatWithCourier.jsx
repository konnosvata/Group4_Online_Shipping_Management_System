import React, { useEffect, useState } from "react";

function ChatWithCourier() {
  const [shipments, setShipments] = useState([]);
  const [visiblePhone, setVisiblePhone] = useState(null);

  useEffect(() => {
    const fetchShipments = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      try {
        const res = await fetch(
          `http://localhost:5001/api/communication?user_id=${user.id}`
        );
        const data = await res.json();
        setShipments(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchShipments();
  }, []);

  const handleMessageClick = () => {
    alert("Messaging function is coming soon");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px" }}>
      <h2 style={{ marginBottom: "20px" }}>Communication</h2>

      {shipments.length === 0 && (
        <p style={{ color: "#666" }}>No active shipments found.</p>
      )}

      {shipments.map((item) => (
        <div
          key={item.shipmentId}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* LEFT INFO */}
          <div>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              Driver: {item.name}
            </p>
            <p style={{ margin: "4px 0", color: "#555" }}>
              Shipment ID: {item.shipmentId}
            </p>
          </div>

          {/* ACTIONS */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleMessageClick}
              style={{
                background: "#1e5bff",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Message
            </button>

            <button
              onClick={() =>
                setVisiblePhone(
                  visiblePhone === item.shipmentId
                    ? null
                    : item.shipmentId
                )
              }
              style={{
                background: "#2bb673",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Call
            </button>

            {visiblePhone === item.shipmentId && (
              <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
                {item.phone}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatWithCourier;

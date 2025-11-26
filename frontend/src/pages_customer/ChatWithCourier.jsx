import React, { useEffect, useState } from "react";

function ChatWithCourier() {
  const [couriers, setCouriers] = useState([]);
  const [selectedDriverPhone, setSelectedDriverPhone] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/communication?user_id=${user.id}`
        );
        const data = await res.json();
        setCouriers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleCall = (phone) => {
    setSelectedDriverPhone(phone); // show phone box
  };

  const handleMessage = () => {
    alert("Chat with courier coming soon!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "40px", marginBottom: "30px" }}>Communication</h1>

      {/* 🔷 DRIVER CONTACT BOX AT THE TOP */}
      {selectedDriverPhone && (
        <div
          style={{
            background: "#e9f0ff",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "30px",
            border: "1px solid #c9d6ff",
          }}
        >
          <h2 style={{ marginBottom: "10px" }}>Driver Contact</h2>
          <p style={{ fontSize: "20px" }}>📞 {selectedDriverPhone}</p>

          <button
            onClick={() => setSelectedDriverPhone(null)}
            style={{
              padding: "10px 20px",
              marginTop: "10px",
              borderRadius: "12px",
              background: "#3366ff",
              color: "#fff",
              fontSize: "16px",
              border: "none",
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* 🔷 LIST OF SHIPMENTS */}
      {couriers.length === 0 ? (
        <p>No assigned couriers at the moment.</p>
      ) : (
        couriers.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "16px",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>{item.name}</h2>
            <p style={{ marginTop: "5px", color: "#555" }}>
              Shipment: #{item.shipmentId}
            </p>

            {/* Buttons */}
            <div style={{ marginTop: "15px", display: "flex", gap: "15px" }}>
              {/* Call Button */}
              <button
                onClick={() => handleCall(item.phone)}
                style={{
                  padding: "12px 30px",
                  borderRadius: "12px",
                  background: "#444",
                  color: "white",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Call
              </button>

              {/* Message Button → Blue */}
              <button
                onClick={handleMessage}
                style={{
                  padding: "12px 30px",
                  borderRadius: "12px",
                  background: "#3366ff",
                  color: "white",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Message
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ChatWithCourier;

/*
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchShipments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setError("No logged-in user found.");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/activeShipments?user_id=${user.id}`
      );

      const data = await res.json();

        // Filter shipments with status Pending or Active
        const filtered = data.filter(
          (s) => s.status === "Pending" || s.status === "Active"
        );

        setShipments(filtered);
      } catch (err) {
        setError("Network error: " + err.message);
      }
    };

    fetchShipments();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Active Shipments</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {shipments.length === 0 && <p>No active or pending shipments.</p>}

      {shipments.map((ship) => (
        <div 
          key={ship.shipment_id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px"
          }}
        >
          <p><strong>Status:</strong> {ship.status}</p>
          <p><strong>Destination:</strong> {ship.destination}</p>
          <p><strong>Date to Deliver:</strong> {ship.date_to_deliver}</p>
        </div>
      ))}
    </div>
  );
}

export default ShipmentsPage;
*/
import React, { useEffect, useState } from "react";

function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/testShipments");

       
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error("Server did not return JSON. Response: " + text);
        }

        const data = await res.json();
        setShipments(data);
      } catch (err) {
        setError("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const handleClick = () => {
    alert("Page is working! React is running.");
  };

  if (loading) return <p>Loading shipments...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Debug Shipments Page</h2>

      <button 
        onClick={handleClick} 
        style={{ padding: "10px 15px", marginBottom: "20px" }}
      >
        Test Page
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {shipments.length === 0 ? (
        <p>No shipments found in the database.</p>
      ) : (
        shipments.map((ship) => (
          <div
            key={ship.shipment_id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px"
            }}
          >
            <p><strong>ID:</strong> {ship.shipment_id}</p>
            <p><strong>Status:</strong> {ship.status}</p>
            <p><strong>Destination:</strong> {ship.destination}</p>
            <p><strong>Date to Deliver:</strong> {ship.date_to_deliver}</p>
            <p><strong>Created By:</strong> {ship.created_by}</p>
            <p><strong>Weight:</strong> {ship.weight} kg</p>
            <p><strong>Dimensions (L×W×H):</strong> {ship.length}×{ship.width}×{ship.height}</p>
            <p><strong>Fragile:</strong> {ship.fragile ? "Yes" : "No"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default ShipmentsPage;
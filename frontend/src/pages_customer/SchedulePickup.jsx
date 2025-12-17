import React, { useEffect, useState } from "react";

const getTodayUTC2 = () => {
  const now = new Date();
  const offset = 2 * 60 * 60 * 1000; // UTC+2 like elsewhere
  const utc2Date = new Date(now.getTime() + offset);
  return utc2Date.toISOString().split("T")[0];
};


const generateTimeOptions = (stepMinutes = 15) => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
  }
  return options;
};


export default function SchedulePickup() {
  const [shipments, setShipments] = useState([]);
  const pendingShipments = Array.isArray(shipments)
    ? shipments.filter((s) => String(s.status || "").toLowerCase() === "pending")
    : [];
  const [selectedShipmentId, setSelectedShipmentId] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [handoffDetails, setHandoffDetails] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const backendUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

  // Load pending shipments for this customer
  useEffect(() => {
    const fetchActiveShipments = async () => {
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
          `${backendUrl}/api/activeShipments?user_id=${user.id}`
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

        setShipments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveShipments();
  }, [backendUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedShipmentId || !pickupDate || !pickupTime || !pickupLocation) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/schedulePickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment_id: selectedShipmentId,
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          pickup_location: pickupLocation,
          handoff_details: handoffDetails,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error("Server did not return JSON: " + text);
      }

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const detailsText = Object.entries(data.details)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join("\n");
          throw new Error(detailsText);
        }
        throw new Error(data.error || "Failed to schedule pickup.");
      }

      setSuccess(data.message || "Pickup scheduled successfully.");
      setSelectedShipmentId("");
      setPickupDate("");
      setPickupTime("");
      setPickupLocation("");
      setHandoffDetails("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Schedule Pickup</h2>

      {loading && <p>Loading your pending shipments...</p>}
      {error && (
        <p style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</p>
      )}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {!loading && pendingShipments.length === 0 && (
        <p>
          You don&apos;t have any pending shipments to schedule a pickup
          for.
        </p>
      )}

      {!loading && pendingShipments.length > 0 && (
        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: "500px", marginTop: "20px" }}
        >
          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Select Shipment *</strong>
            </label>
            <select
              value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            >
              <option value="">-- Choose a shipment --</option>
              {pendingShipments.map((s) => (
                <option key={s.shipment_id} value={s.shipment_id}>
                  #{s.shipment_id} – {s.destination} ({s.status})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Pickup Date *</strong>
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={getTodayUTC2()}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Pickup Time *</strong>
            </label>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              size={6}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                overflowY: "auto",
              }}
            >
              <option value="">-- Choose a time --</option>
              {generateTimeOptions(15).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Pickup Location *</strong>
            </label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. Nicosia Mall Entrance"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              <strong>Handoff Details (optional)</strong>
            </label>
            <input
              type="text"
              value={handoffDetails}
              onChange={(e) => setHandoffDetails(e.target.value)}
              placeholder="e.g. Call me when you arrive"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#1e5bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Confirm Pickup
          </button>
        </form>
      )}
    </div>
  );
}

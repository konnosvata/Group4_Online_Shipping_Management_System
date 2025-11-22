import React, { useState } from "react";

export default function CreateShipment() {
  const [formData, setFormData] = useState({
    weight: "",
    length: "",
    width: "",
    height: "",
    destination: "",
    fragile: 0,
    date_to_deliver: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setError("You must be logged in to create a shipment");
        setLoading(false);
        return;
      }

      if (
        !formData.weight ||
        !formData.length ||
        !formData.width ||
        !formData.height ||
        !formData.destination ||
        !formData.date_to_deliver
      ) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const shipmentData = {
        weight: parseFloat(formData.weight),
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        destination: formData.destination,
        fragile: formData.fragile,
        date_to_deliver: formData.date_to_deliver,
        created_by: user.id,
      };

      const backendUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : `http://${window.location.hostname}:5000`;

      const res = await fetch(`${backendUrl}/api/createShipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shipmentData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create shipment");
        setLoading(false);
        return;
      }

      setMessage("Shipment created successfully!");
      setFormData({
        weight: "",
        length: "",
        width: "",
        height: "",
        destination: "",
        fragile: 0,
        date_to_deliver: "",
      });
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Create Shipment</h1>

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
      {message && (
        <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="destination">
            Destination Address <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Enter destination address"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Dimensions (Length × Width × Height)</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div>
              <label htmlFor="length" style={{ fontSize: "12px" }}>
                Length (cm) <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
                step="0.01"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                required
              />
            </div>
            <div>
              <label htmlFor="width" style={{ fontSize: "12px" }}>
                Width (cm) <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleChange}
                step="0.01"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                required
              />
            </div>
            <div>
              <label htmlFor="height" style={{ fontSize: "12px" }}>
                Height (cm) <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                step="0.01"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                required
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="weight">
            Weight (kg) <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            step="0.01"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="date_to_deliver">
            Delivery Date <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="date"
            id="date_to_deliver"
            name="date_to_deliver"
            value={formData.date_to_deliver}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            id="fragile"
            name="fragile"
            checked={formData.fragile === 1}
            onChange={handleChange}
            style={{ marginRight: "10px", width: "18px", height: "18px" }}
          />
          <label htmlFor="fragile" style={{ marginTop: "0px" }}>
            Fragile Items
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Create Shipment"}
        </button>
      </form>
    </div>
  );
}
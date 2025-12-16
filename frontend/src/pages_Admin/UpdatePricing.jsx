import React, { useEffect, useState } from "react";

function EditPaymentFormula() {
  const [formula, setFormula] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backendUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

  useEffect(() => {
    fetchFormula();
  }, []);

  const fetchFormula = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/getPaymentFormula`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFormula(data);
      setEditForm(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateValues = () => {
    const limits = {
      price_per_km: 10,
      price_per_weight: 20,
      base_fee: 100,
      fragile_fee: 50
    };

    for (let key in limits) {
      const value = Number(editForm[key]);
      if (isNaN(value) || value < 0) {
        return `${key} must be a non-negative number`;
      }
      if (value > limits[key]) {
        return `${key} cannot exceed ${limits[key]}`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const err = validateValues();
    if (err) {
      alert(err);
      return;
    }

    if (!window.confirm("Save new pricing formula?")) return;

    try {
      const res = await fetch(`${backendUrl}/api/updatePaymentFormula`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("Formula updated successfully!");
      setFormula(editForm);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading formula...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <h2>Shipment Pricing Formula</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!editing ? (
        <>
          <p>Price per km: {formula.price_per_km}</p>
          <p>Price per weight: {formula.price_per_weight}</p>
          <p>Base fee: {formula.base_fee}</p>
          <p>Fragile fee: {formula.fragile_fee}</p>

          <button onClick={() => setEditing(true)}>Edit Formula</button>
        </>
      ) : (
        <>
          {["price_per_km", "price_per_weight", "base_fee", "fragile_fee"].map(
            (field) => (
              <div key={field} style={{ marginBottom: "10px" }}>
                <label>{field.replace(/_/g, " ")}:</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm[field]}
                  onChange={(e) =>
                    setEditForm({ ...editForm, [field]: e.target.value })
                  }
                  style={{ width: "100%" }}
                />
              </div>
            )
          )}

          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      )}
    </div>
  );
}

export default EditPaymentFormula;

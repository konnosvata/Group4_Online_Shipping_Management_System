import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Luhn algorithm for credit card checksum validation
const validateLuhn = (num) => {
  let sum = 0;
  let isEven = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const shipmentData = location.state?.shipmentData;

  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentCost, setPaymentCost] = useState(0);

  const calculateCost = React.useCallback(() => {
    try {
      const distance = Math.floor(Math.random() * 491) + 10;

      const pricePerKm = 0.5;
      const pricePerWeight = 2.0;
      const baseFee = 10.0;
      const fragileFee = shipmentData.fragile === 1 ? 5.0 : 0;
      const weight = parseFloat(shipmentData.weight) || 0;

      const cost =
        baseFee +
        distance * pricePerKm +
        weight * pricePerWeight +
        fragileFee;

      setPaymentCost(parseFloat(cost.toFixed(2)));
    } catch (err) {
      setError("Error calculating payment cost");
    }
  }, [shipmentData]);

  React.useEffect(() => {
    if (!shipmentData) {
      setError("No shipment data provided. Please go back and try again.");
      return;
    }

    calculateCost();
  }, [shipmentData, calculateCost]);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === "cardNumber") {
      sanitized = value.replace(/\D/g, "").slice(0, 16);
    } else if (name === "cvv") {
      sanitized = value.replace(/\D/g, "").slice(0, 3);
    } else if (name === "expiryDate") {
      sanitized = value.replace(/\D/g, "").slice(0, 4);
      if (sanitized.length >= 2) {
        sanitized = sanitized.slice(0, 2) + "/" + sanitized.slice(2);
      }
    }

    setCardData((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
  };

  const validatePayment = () => {
    if (
      !cardData.cardNumber ||
      !cardData.cardholderName ||
      !cardData.expiryDate ||
      !cardData.cvv
    ) {
      setError("Please fill in all required fields");
      return false;
    }

    if (cardData.cardNumber.length !== 16) {
      setError("Credit card number must be exactly 16 digits");
      return false;
    }

    if (!validateLuhn(cardData.cardNumber)) {
      setError("Invalid credit card number (failed checksum validation)");
      return false;
    }

    if (cardData.cardholderName.trim().split(" ").length < 2) {
      setError("Cardholder name must contain first and last name");
      return false;
    }

    // Validate expiry date format (MM/YY)
    const expiryRegex = /^\d{2}\/\d{2}$/;
    if (!expiryRegex.test(cardData.expiryDate)) {
      setError("Expiry date must be in MM/YY format");
      return false;
    }

    // Check month is 01–12 and card not expired
    const [expMonthStr, expYearStr] = cardData.expiryDate.split("/");
    const expMonth = parseInt(expMonthStr, 10);
    const expYear = parseInt(expYearStr, 10); // YY

    if (isNaN(expMonth) || isNaN(expYear)) {
      setError("Invalid expiry date");
      return false;
    }

    if (expMonth < 1 || expMonth > 12) {
      setError("Expiry month must be between 01 and 12");
      return false;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1–12
    const currentYear = now.getFullYear() % 100; // YY

    // If year is in the past, or same year but month is in the past → expired
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setError("Card has expired");
      return false;
    }

    if (cardData.cvv.length !== 3) {
      setError("CVV must be exactly 3 digits");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validatePayment()) {
      setLoading(false);
      return;
    }

    try {
      alert(
        `Payment of €${paymentCost} successful!\n\nCard ending in ${cardData.cardNumber.slice(
          -4
        )}`
      );

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setError("You must be logged in to create a shipment");
        setLoading(false);
        return;
      }

      const finalShipmentData = {
        ...shipmentData,
        created_by: user.id,
      };

      const backendUrl =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : `http://${window.location.hostname}:5000`;

      const res = await fetch(`${backendUrl}/api/createShipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalShipmentData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create shipment");
        setLoading(false);
        return;
      }

      alert("Shipment created successfully!");
      navigate("/customer/active-shipments");
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!shipmentData) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Payment</h1>
        <p style={{ color: "red" }}>
          Error: No shipment data provided. Please go back and try again.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Payment Details</h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
        }}
      >
        <h3>Order Summary</h3>
        <p>
          <strong>Destination:</strong> {shipmentData.destination}
        </p>
        <p>
          <strong>Weight:</strong> {shipmentData.weight} kg
        </p>
        <p>
          <strong>Dimensions:</strong> {shipmentData.length} ×{" "}
          {shipmentData.width} × {shipmentData.height} cm
        </p>
        <p>
          <strong>Fragile:</strong> {shipmentData.fragile === 1 ? "Yes" : "No"}
        </p>
        <p>
          <strong>Delivery Date:</strong> {shipmentData.date_to_deliver}
        </p>
        <hr />
        <h4 style={{ color: "#007bff" }}>Total Cost: €{paymentCost}</h4>
      </div>

      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="cardNumber">
            Credit Card Number <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={cardData.cardNumber}
            onChange={handleCardChange}
            placeholder="1234567890123456 (16 digits)"
            maxLength="16"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
          <p style={{ fontSize: "12px", color: "#666" }}>
            Must be exactly 16 digits
          </p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="cardholderName">
            Cardholder Name <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            id="cardholderName"
            name="cardholderName"
            value={cardData.cardholderName}
            onChange={handleCardChange}
            placeholder="John Doe"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
        </div>

        <div
          style={{
            marginBottom: "15px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <div>
            <label htmlFor="expiryDate">
              Expiry Date <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={cardData.expiryDate}
              onChange={handleCardChange}
              placeholder="MM/YY"
              maxLength="5"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              required
            />
          </div>

          <div>
            <label htmlFor="cvv">
              CVV <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={cardData.cvv}
              onChange={handleCardChange}
              placeholder="123"
              maxLength="3"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              required
            />
          </div>
        </div>

        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Back
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: loading ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Pay & Create Shipment"}
          </button>
        </div>
      </form>
    </div>
  );
}

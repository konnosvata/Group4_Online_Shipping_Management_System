import React from "react";
import { useNavigate } from "react-router-dom";

function CustomerHomePage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "2rem auto",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "15px",
      }}
    >
      <button style={btnStyle} onClick={() => navigate("/profile")}>Profile</button>
      <button style={btnStyle} onClick={() => navigate("/orders")}>Orders</button>
      <button style={btnStyle} onClick={() => navigate("/settings")}>Settings</button>
      <button style={btnStyle} onClick={() => navigate("/activeShipments")}>My Shipments</button>
      <button style={btnStyle} onClick={() => navigate("/-")}>5</button>
      <button style={btnStyle} onClick={() => navigate("/-")}>6</button>
      <button style={btnStyle} onClick={() => navigate("/-")}>7</button>
      <button style={btnStyle} onClick={() => navigate("/-")}>8</button>
      <button style={btnStyle} onClick={() => navigate("/-")}>9</button>

      
    </div>
  );
}

const btnStyle = {
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #ccc",
  backgroundColor: "#f2f2f2",
  fontSize: "16px",
  cursor: "pointer",
};

export default CustomerHomePage;
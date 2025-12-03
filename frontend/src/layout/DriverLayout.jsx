import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const DriverLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* sidebar */}
      <aside
        style={{
          width: "240px",
          backgroundColor: "#1e5bff",
          color: "white",
          padding: "20px 0",
        }}
      >
        <h2 style={{ marginLeft: 24, marginBottom: 30 }}>Driver</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SidebarLink to="/driver/assignedShipments" label="Assigned Shipments" />
          <SidebarLink to="/driver/driverRoute" label="Route" />
          <SidebarLink to="/driver/updateShipment" label="Update Shipment" />
          
        </nav>
      </aside>

      {/* main content */}
      <main style={{ flex: 1, padding: "24px 40px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            Logout
          </button>
        </div>

        {/* driver pages render here */}
        <Outlet />
      </main>
    </div>
  );
};

const SidebarLink = ({ to, label }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      padding: "10px 24px",
      textDecoration: "none",
      color: "white",
      backgroundColor: isActive ? "#1746bf" : "transparent",
      fontWeight: isActive ? "600" : "400",
    })}
  >
    {label}
  </NavLink>
);

export default DriverLayout;

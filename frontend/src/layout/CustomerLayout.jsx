import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const CustomerLayout = () => {
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
        <h2 style={{ marginLeft: 24, marginBottom: 30 }}>Customer</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SidebarLink to="/customer/dashboard" label="Dashboard" />
          <SidebarLink to="/customer/create-shipment" label="Create Shipment" />
          <SidebarLink to="/customer/my-shipments" label="My Shipments" />
          <SidebarLink to="/customer/schedule-pickup" label="Schedule Pickup" />
          <SidebarLink to="/customer/tracking" label="Tracking" />
          <SidebarLink to="/customer/payments" label="Payments" />
          <SidebarLink to="/customer/chat" label="Chat with Courier" />
          <SidebarLink to="/customer/settings" label="Account Settings" />
        </nav>
      </aside>

      {/* main content */}
      <main style={{ flex: 1, padding: "24px 40px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <span>Login</span>
        </div>

        {/* here each teammate’s page will be rendered */}
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

export default CustomerLayout;

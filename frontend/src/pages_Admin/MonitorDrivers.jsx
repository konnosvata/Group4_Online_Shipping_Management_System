import React, { useEffect, useState } from "react";

function MonitorDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState("");

  const backendUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

  useEffect(() => {
    fetch(`${backendUrl}/api/monitorDrivers`)
      .then(res => res.json())
      .then(data => setDrivers(data))
      .catch(() => setError("Failed to load drivers"));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Monitor Drivers</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {drivers.map(driver => (
        <div
          key={driver.driver_id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px"
          }}
        >
          <h3>{driver.driver_name}</h3>

          {driver.shipments.length === 0 ? (
            <p>No shipments assigned</p>
          ) : (
            driver.shipments.map(ship => (
              <div key={ship.shipment_id} style={{ marginLeft: "15px" }}>
                <p>
                  <strong>Shipment #{ship.shipment_id}</strong> – {ship.destination}  
                  <br />
                  Status: <b>{ship.status}</b>
                </p>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}

export default MonitorDrivers;

import React, { useEffect, useState } from "react";

function AccountSettings() {
  const [userData, setUserData] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backendUrl = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      setError("No user logged in.");
      setLoading(false);
      return;
    }
    fetchUserData(storedUser.id);
  }, []);

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/getUser?user_id=${userId}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error("Server did not return JSON: " + text);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load user profile");
      setUserData(data);
      setEditForm(data);
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    if (!email.includes("@")) return "Email must contain '@'";
    if (email.endsWith("@")) return "'@' cannot be the last character";
    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.email || !editForm.password) {
      alert("All fields must be filled");
      return;
    }

    const emailErr = validateEmail(editForm.email);
    if (emailErr) {
      alert(emailErr);
      return;
    }

    const passErr = validatePassword(editForm.password);
    if (passErr) {
      alert(passErr);
      return;
    }

    if (!window.confirm("Are you sure you want to save these changes?")) return;

    try {
      const res = await fetch(`${backendUrl}/api/updateUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update user");
        return;
      }

      alert("Profile updated successfully!");
      setUserData(editForm);
      setEditing(false);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Profile</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!userData ? (
        <p>No user profile found.</p>
      ) : (
        <div style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
          background: "#f9f9f9",
          maxWidth: "500px"
        }}>
          {editing ? (
            <>
              <div style={{ marginBottom: "15px" }}>
                <label><strong>Name:</strong></label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label><strong>Email:</strong></label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => handleEditChange("email", e.target.value)}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label><strong>Password:</strong></label>
                <input
                  type="password"
                  value={editForm.password || ""}
                  onChange={(e) => handleEditChange("password", e.target.value)}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleSave}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Password:</strong> ••••••••</p>

              <button
                onClick={() => setEditing(true)}
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountSettings;

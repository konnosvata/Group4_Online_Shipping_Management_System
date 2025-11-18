import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const token = new URLSearchParams(window.location.search).get("token");

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValid(false);
        setLoading(false);
        setMessage("Missing reset token.");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/checkToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          setValid(false);
          const data = await res.json().catch(() => ({}));
          setMessage(data.message || "Invalid or expired link.");
        } else {
          setValid(true);
        }
      } catch (err) {
        console.error(err);
        setValid(false);
        setMessage("Error connecting to server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!token) {
      setMessage("Missing reset token.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.message || "Could not reset password.");
        return;
      }

      setSuccess(true);
      setMessage(data.message || "Password successfully reset. You can now log in.");
      setValid(false); // hide the form
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server. Please try again later.");
    }
  };

  if (loading) {
    return <div>Checking reset link…</div>;
  }

  if (!valid && !success) {
    return (
      <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
        <h2>Reset Password</h2>
        <p>{message || "Invalid or expired link. Please request a new password reset."}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Reset Password</h2>

      {message && (
        <div style={{ marginBottom: 15, color: success ? "green" : "red" }}>
          {message}
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label>New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            />
          </div>

          <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
            Reset Password
          </button>
        </form>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{ borderRadius: "10px", padding: "10px 20px" }}
        >
          Go to Login
        </button>
      </div>

    </div>

    
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Forget() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/forget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(data.message);
    } catch (err) {
      //setError("Network error, please try again.");
      setError(err.message)
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: "2rem auto" }}>
      <h2>Forget Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Email<br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>

        <button type="submit" style={{ borderRadius: "10px", padding: "10px 20px" }}>
            reset password
        </button>
      </form>
      

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div style={{ marginTop: "1rem" }}>
        <button type="button" 
        onClick={() => navigate("/")}
        style={{ borderRadius: "10px", padding: "10px 20px" }}>
            Go to Login
        </button>
      </div>


    </div>
  );
}

export default Forget;
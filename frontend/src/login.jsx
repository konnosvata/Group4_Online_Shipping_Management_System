import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // success message from backend
      setSuccess(`Logged in as ${data.user.name}. Redirecting...`);
      setSuccess(`Logged in as ${data.user.name}`);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/customer/dashboard");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: "2rem auto" }}>
      <h2>Login</h2>
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

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Password<br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>

        <button type="submit" style={{ borderRadius: "10px", padding: "10px 20px" }}>
            Login
        </button>
      </form>
      

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div style={{ marginTop: "1rem" }}>
        <button 
          type="button"
          onClick={() => navigate("/registration")}
          style={{ borderRadius: "10px", padding: "10px 20px" }}
        >
          Go to Register
        </button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button 
          type="button"
          onClick={() => navigate("/forget")}
          style={{ borderRadius: "10px", padding: "10px 20px" }}
        >
          Go to Forget Password
        </button>
      </div>
      
    </div>
  );
}

export default Login;

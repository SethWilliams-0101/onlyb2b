import { useState } from "react";
import api from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import "../style/Login.css"; // ✅ Import external CSS
import logo from "../assets/logo.webp"; // Replace with your logo path

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

 const onSubmit = async (e) => {
  e.preventDefault();
  setErr("");
  try {
    const payload = { username: (username || "").trim().toLowerCase(), password };
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/");
  } catch (e) {
    setErr(e?.response?.data?.message || "Login failed");
  }
};


  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Company Logo" className="login-logo" />
        <h1 className="login-title">Sign In</h1>
        <form onSubmit={onSubmit} className="login-form">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          {err && <div className="login-error">{err}</div>}
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

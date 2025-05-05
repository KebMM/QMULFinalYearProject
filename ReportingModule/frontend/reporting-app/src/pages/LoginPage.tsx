// Login Page

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/login",
        new URLSearchParams({
          username,
          password,
        })
      );
      const { access_token } = response.data;
      localStorage.setItem("access_token", access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  const handleSSOLogin = () => {
    window.location.href = "http://127.0.0.1:8000/login-sso";
  };

  return (
    <div style={styles.pageWrapper}>
      <header style={styles.navbar}>
        <img src={logo} alt="Company Logo" style={styles.navLogo} />
      </header>
      <div style={styles.container}>
        <h2 style={styles.title}>Welcome to Infuse Test Reporting</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.loginButton}>
            Login
          </button>
        </form>
        <hr style={styles.divider} />
        <div style={styles.ssoSection}>
          <p>Or sign in with Microsoft</p>
          <button onClick={handleSSOLogin} style={styles.ssoButton}>
            Sign In with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
  },
  navbar: {
    width: "100%",
    padding: "0.8rem 1rem",
    justifyContent: "space-between",
    backgroundColor: "#1f2937",
    position: "fixed" as "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
  },
  navLogo: {
    height: "60px",
    width: "auto",
  },
  container: {
    marginTop: "20px",
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "90%",
  },
  title: {
    textAlign: "center" as "center",
    marginBottom: "1rem",
    color: "#1f2937",
  },
  form: {
    display: "flex",
    flexDirection: "column" as "column",
  },
  inputGroup: {
    marginBottom: "1rem",
  },
  label: {
    marginBottom: "0.25rem",
    fontWeight: 600,
    color: "#333",
  },
  input: {
    padding: "0.5rem",
    width: "100%",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  error: {
    color: "red",
    textAlign: "center" as "center",
  },
  loginButton: {
    padding: "0.75rem",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#1f2937",
    color: "#fff",
    fontWeight: "bold" as "bold",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  divider: {
    margin: "2rem 0",
    borderTop: "1px solid #ccc",
  },
  ssoSection: {
    textAlign: "center" as "center",
  },
  ssoButton: {
    padding: "0.75rem",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#1f2937",
    color: "#fff",
    fontWeight: "bold" as "bold",
    cursor: "pointer",
    width: "100%",
  },
};

export default LoginPage;

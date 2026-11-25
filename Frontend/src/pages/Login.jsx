import React, { useState } from "react";
import "./Login.css";

function Icon({ size = 20, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

    async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      
      const response = await fetch("http://localhost:8000/api/accounts/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      
      if (response.ok) {
        
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user_role", data.user.role);
        localStorage.setItem("username", data.user.username);

        
        onLogin();
      } else {
        
        setError(data.detail || "Invalid username or password.");
      }
    } catch (err) {
      
      setError("Unable to connect to server. Please ensure backend server is running.");
    }
  }
 

  return (
    <div className="login">
      <div className="login-left">
        <h1>Customer Support CRM</h1>
        <p>
          Manage customer queries, track support tickets and help your team
          respond faster.
        </p>
        <ul>
          <li>✓ Track all support tickets</li>
          <li>✓ Manage customer details</li>
          <li>✓ View reports and live updates</li>
        </ul>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleLogin}>
          {/* Headphone logo */}
          <div className="login-logo">
            <Icon size={28}>
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </Icon>
          </div>

          <h2>Welcome Back</h2>
          <p className="login-sub">Login to access your support dashboard</p>

          
          {error && <p className="login-error">{error}</p>}

          
          <label>Username or Email</label>
          <div className="input-box">
            <span className="input-icon">
              <Icon size={18}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </Icon>
            </span>
            <input
              type="text"
              placeholder="Enter username or email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          
          <label>Password</label>
          <div className="input-box">
            <span className="input-icon">
              <Icon size={18}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </Icon>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />
            <button
              type="button"
              className="eye-btn"
              aria-label="Show or hide password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Icon>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </Icon>
              ) : (
                <Icon>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </Icon>
              )}
            </button>
          </div>

          

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

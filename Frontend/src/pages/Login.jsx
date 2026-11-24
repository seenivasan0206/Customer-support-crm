import React, { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    // dummy login, backend ready ana apram API call podanum
    if (email === "admin@gmail.com" && password === "admin123") {
      onLogin();
    } else {
      alert("Invalid email or password");
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
        <form onSubmit={handleLogin}>
          <h2>Welcome Back</h2>
          <p>Login to continue</p>

          <label>Email</label>
          <br />
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <br />

          <label>Password</label>
          <br />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <br />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;

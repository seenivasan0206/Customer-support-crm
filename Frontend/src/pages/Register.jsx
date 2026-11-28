import React, { useState } from "react";
import "./Register.css";

function Register({ onNavigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (form.name.trim().length < 3) {
      return "Name must contain at least 3 characters.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (form.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[0-9]/.test(form.password)) {
      return "Password must contain at least one number.";
    }

    if (!/[^A-Za-z0-9]/.test(form.password)) {
      return "Password must contain at least one symbol.";
    }

    if (form.password !== form.confirmPassword) {
      return "Password and Confirm Password do not match.";
    }

    if (!["admin", "customer", "agent"].includes(form.role)) {
      return "Please select a valid role.";
    }

    return "";
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/accounts/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: form.email.trim(),
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            confirm_password: form.confirmPassword,
            role: form.role,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account created successfully. Please login.");

        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "customer",
        });
      } else {
        const message =
          data.detail ||
          data.email?.[0] ||
          data.username?.[0] ||
          data.password?.[0] ||
          data.role?.[0] ||
          "Registration failed. Please check your details.";

        setError(message);
      }
    } catch (err) {
      setError(
        "Unable to connect to server. Please ensure backend server is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login register">
      <div className="login-left">
        <h1>Customer Support CRM</h1>
        <p>Create your account and connect with our customer support team.</p>

        <ul>
          <li>✓ Easy customer support management</li>
          <li>✓ Track support requests</li>
          <li>✓ Stay connected with your team</li>
        </ul>
      </div>

      <div className="login-right register-right">
        <form className="login-card register-card" onSubmit={handleRegister}>
          <div className="login-logo">
            <span className="register-logo-icon">+</span>
          </div>

          <h2>Create Account</h2>
          <p className="login-sub">Register to access the support CRM</p>

          {error && <p className="login-error">{error}</p>}
          {success && <p className="register-success">{success}</p>}

          <label>
            Full Name <span className="required">*</span>
          </label>
          <div className="input-box">
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <label>
            Email Address <span className="required">*</span>
          </label>
          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <label>
            Password <span className="required">*</span>
          </label>
          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <p className="password-hint">
            Minimum 8 characters, at least one number and one symbol.
            <br />
            Example: Welcome@123
            <br />
            Symbols: @ # $ % & !
          </p>

          <label>
            Confirm Password <span className="required">*</span>
          </label>
          <div className="input-box">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label>
            Select Role <span className="required">*</span>
          </label>
          <div className="input-box">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="register-link">
            Already have an account?{" "}
            <button type="button" onClick={() => onNavigate("login")}>
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;

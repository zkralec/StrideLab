import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../utils/firebase";
import { Link } from "react-router-dom";
import "../styles/Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
        if (err.code === "auth/user-not-found") {
        setError("No account found with that email.");
        } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
        } else {
        setError("Failed to send reset email. Please try again later.");
        }
    }
    };

  return (
    <div className="login-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {message && <p className="inline-success">{message}</p>}
        {error && <p className="inline-error">{error}</p>}
        <button type="submit">Send Reset Email</button>
      </form>
      <p><Link to="/">Back to login</Link></p>
    </div>
  );
}

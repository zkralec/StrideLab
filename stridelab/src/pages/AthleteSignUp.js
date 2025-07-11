import React, { useState } from "react";
import { auth, db } from "../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import '../styles/AthleteSignup.css';

export default function AthleteSignup() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        age,
        email,
        onboardingComplete: false,
      });
      navigate("/onboarding");
    } catch (err) {
      setError("Signup failed. " + err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        {error && <p className="error">{error}</p>}
        <input type="text" placeholder="Name" value={name}
          onChange={(e) => setName(e.target.value)} required />
        <input type="number" placeholder="Age" value={age}
          onChange={(e) => setAge(e.target.value)} required />
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Create Account</button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

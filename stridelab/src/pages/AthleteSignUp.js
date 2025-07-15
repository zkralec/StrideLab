import React, { useState } from "react";
import { auth, db } from "../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { getDoc, updateDoc } from "firebase/firestore";
import '../styles/AthleteSignup.css';

export default function AthleteSignup() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Step 1: Checking invite code...");
      const codeRef = doc(db, "inviteCodes", inviteCode);
      const codeSnap = await getDoc(codeRef);

      if (!codeSnap.exists()) throw new Error("Invalid invite code.");
      console.log("✅ Invite code exists");

      const data = codeSnap.data();
      const now = new Date();

      if (data.used) throw new Error("This invite code has already been used.");
      if (data.expiresAt && data.expiresAt.toDate() < now) throw new Error("Invite code has expired.");
      console.log("✅ Invite code is valid and not used");

      console.log("Step 2: Creating user...");
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      console.log("✅ User created:", uid);

      console.log("Step 3: Creating user doc...");
      await setDoc(doc(db, "users", uid), {
        name,
        age,
        email,
        onboardingComplete: false,
      });
      console.log("✅ User doc created");

      console.log("Step 4: Updating invite code as used...");
      await updateDoc(codeRef, {
        used: true,
        usedBy: uid,
      });
      console.log("✅ Invite code updated");

      navigate("/onboarding");
    } catch (err) {
      console.error("❌ Error during signup:", err.message);
      setError("Signup failed. " + err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Name" value={name}
          onChange={(e) => setName(e.target.value)} required />
        <input type="number" placeholder="Age" value={age}
          onChange={(e) => setAge(e.target.value)} required />
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <input type="text" placeholder="Invite Code" value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)} required />
        {error && <p className="inline-error">{error}</p>}
        <button type="submit">Create Account</button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

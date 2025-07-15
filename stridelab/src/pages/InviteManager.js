import React, { useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  Timestamp,
  getDocs,
  query
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "../styles/InviteManager.css";

export default function InviteManager() {
  const [user, setUser] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [activeCodes, setActiveCodes] = useState([]);
  const [usedCodes, setUsedCodes] = useState([]);
  const [expiredCodes, setExpiredCodes] = useState([]);

  const navigate = useNavigate();
  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === adminEmail) {
        setUser(user);
        fetchCodes();
      } else {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [adminEmail, navigate]);

  const generateCode = async () => {
    const code = uuidv4().split("-")[0];
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    try {
      await setDoc(doc(collection(db, "inviteCodes"), code), {
        code,
        used: false,
        createdAt: now,
        expiresAt
      });
      setInviteCode(code);
      setMessage("Invite code generated successfully!");
      fetchCodes();
    } catch (error) {
      setMessage("Error generating code: " + error.message);
    }
  };

  const fetchCodes = async () => {
    const q = query(collection(db, "inviteCodes"));
    const snapshot = await getDocs(q);

    const now = new Date();
    const active = [];
    const used = [];
    const expired = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const exp = data.expiresAt?.toDate();

      if (data.used) {
        used.push(data);
      } else if (exp && exp < now) {
        expired.push(data);
      } else {
        active.push(data);
      }
    });

    setActiveCodes(active);
    setUsedCodes(used);
    setExpiredCodes(expired);
  };

  if (!user) return null;

  return (
    <div className="invite-manager-container">
      <h2>Invite Code Manager</h2>
      <div className="invite-actions">
        <button onClick={() => navigate("/dashboard")}>Back</button>
        <button onClick={generateCode}>Generate New Invite Code</button>
      </div>

      {inviteCode && (
        <p className="new-code"><strong>New Code:</strong> {inviteCode}</p>
      )}
      {message && <p className="invite-message">{message}</p>}

      <section>
        <h3>🔓 Active Codes</h3>
        <ul>
          {activeCodes.map((code) => (
            <li key={code.code}>{code.code} (expires: {code.expiresAt.toDate().toLocaleDateString()})</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>✅ Used Codes</h3>
        <ul>
          {usedCodes.map((code) => (
            <li key={code.code}>{code.code} (used by: {code.usedBy || "unknown"})</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>❌ Expired Codes</h3>
        <ul>
          {expiredCodes.map((code) => (
            <li key={code.code}>{code.code}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

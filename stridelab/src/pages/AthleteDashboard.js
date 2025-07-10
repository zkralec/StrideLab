import React, { useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CheckoutButton from "../components/CheckoutButton";
import "../styles/AthleteDashboard.css";

export default function AthleteDashboard() {
  const [userData, setUserData] = useState(null);
  const [includeWeights, setIncludeWeights] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };

    fetchUserData();
  }, [navigate]);

  const isPaid = userData?.isPaidUser;

  const handleGenerate = (duration) => {
    navigate(`/plan?duration=${duration}&weights=${includeWeights}`);
  };

  if (!userData) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to StrideLab</h1>
        <button className="settings-button" onClick={() => navigate("/settings")}>
          Settings
        </button>
      </div>

      <div className="dashboard-content">
        <p>Select an option to generate your workout plan:</p>

        <div className="plan-buttons">
          <button onClick={() => handleGenerate(1)}>1 Week Plan</button>

          <button
            onClick={() => isPaid && handleGenerate(2)}
            disabled={!isPaid}
            className={!isPaid ? "locked" : ""}
            title={!isPaid ? "Upgrade to unlock" : ""}
          >
            2 Week Plan 🔒
          </button>

          <button
            onClick={() => isPaid && handleGenerate(4)}
            disabled={!isPaid}
            className={!isPaid ? "locked" : ""}
            title={!isPaid ? "Upgrade to unlock" : ""}
          >
            4 Week Plan 🔒
          </button>
        </div>

        <div className="weights-toggle">
          <label title={!isPaid ? "Upgrade to include weights" : ""}>
            <input
              type="checkbox"
              checked={includeWeights}
              onChange={(e) => setIncludeWeights(e.target.checked)}
              disabled={!isPaid}
            />
            Include Weight Training 🔒
          </label>
        </div>

        {!isPaid && (
          <div className="upgrade-box">
            <p>Want access to more features?</p>
            <CheckoutButton />
          </div>
        )}
      </div>
    </div>
  );
}
